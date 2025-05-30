import React, { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { PROJECT_ID } from "@/tokens/tokens";
import { setupNotificationsTable, saveNotification, fetchNotifications } from "@/services/sqlite";
import { formatDateTime } from "@/utilities/formatDateTime";
import { getHeatIndexColor } from "@/utilities/temperatureColorInterpretation";
import storage from "@/storage/storage";

const PUSH_TOKEN_STORAGE_KEY = "pushToken";
const PERMISSION_STATUS_STORAGE_KEY = "permissionStatus";
const SENT_NOTIFICATIONS_STORAGE_KEY = "sentNotifications";

/**
 * Custom hook for notification functionality with push token persistence.
 * @returns {Object} - Object containing notification functions and state
 */
const useNotification = () => {
  const getInitialPushToken = () => {
    const storedToken = storage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (storedToken) {
      return storedToken;
    }
    return null;
  };

  const [pushToken, setPushToken] = useState(getInitialPushToken);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [loading, setLoading] = useState(true);
  // Track if listeners have been set up
  const listenersSetupRef = useRef(false);

  const getStoredNotificationInfo = useCallback(async () => {
    try {
      const storedToken = storage.getItem(PUSH_TOKEN_STORAGE_KEY);
      const storedPermissionStatus = storage.getItem(PERMISSION_STATUS_STORAGE_KEY);

      if (storedToken) {
        setPushToken(storedToken);
      }
      if (storedPermissionStatus) {
        setPermissionStatus(storedPermissionStatus);
      }
    } catch (error) {
      console.error("Error retrieving notification info from storage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification listeners & database only once
    if (!listenersSetupRef.current) {
      setupNotificationListeners();
      listenersSetupRef.current = true;
    }

    const setupTable = async () => {
      await setupNotificationsTable();
    };

    setupTable();
    getStoredNotificationInfo();

    // Clean up listeners when component unmounts
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [getStoredNotificationInfo]);

  /**
   * Set up notification listeners
   */
  const setupNotificationListeners = () => {
    // Remove any existing listeners first
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener((response) => {
      const data = response.request.content;

      console.log("Notification received Foreground:", data);

      if (data.data.type === "alert") {
        router.push({
          pathname: "/AlertScreen",
          params: { data: JSON.stringify(data) },
        });
      }

      if (data.type === "notification") {
        router.push("/notifications");
      }

      setLastNotification(response);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { notification } = response;
      const data = notification.request.content;

      console.log("Notification received Background:", data);

      if (data.data.type === "alert") {
        saveNotification(data.title, data.body, new Date());
        router.push({
          pathname: "/AlertScreen",
          params: { data: JSON.stringify(data) },
        });
      }

      if (data.type === "notification") {
        router.push("/notifications");
      }

      setLastNotification(notification);
    });
  };

  /**
   * Handle errors during notification registration
   * @param {string} errorMessage - Error message to display
   */
  const handleRegistrationError = (errorMessage) => {
    alert(errorMessage);
    throw new Error(errorMessage);
  };

  /**
   * Request notification permissions and get push token
   * @returns {Promise<string|null>} Push token if successful, null if permission denied
   */
  const getNotification = useCallback(async () => {
    // Set notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      handleRegistrationError("Must use physical device for push notifications");
      return null;
    }

    // Check if permission is granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    setPermissionStatus(existingStatus);
    storage.setItem(PERMISSION_STATUS_STORAGE_KEY, finalStatus);

    // If permission already granted, try to get the token
    if (existingStatus === "granted") {
      try {
        const token = (await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })).data;
        setPushToken(token);
        storage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
        return token;
      } catch (e) {
        handleRegistrationError(`Error getting push token: ${e}`);
        return null;
      }
    }

    // Request permission if not already granted
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    setPermissionStatus(finalStatus);
    storage.setItem(PERMISSION_STATUS_STORAGE_KEY, finalStatus);

    if (finalStatus !== "granted") {
      return null;
    }

    if (!PROJECT_ID) {
      handleRegistrationError("Project ID not found");
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })).data;
      setPushToken(token);
      storage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      return token;
    } catch (e) {
      handleRegistrationError(`${e}`);
      return null;
    }
  }, []);

  // Function to check if a similar notification was recently sent
  const isNotificationDuplicate = (title, body, triggerTime) => {
    try {
      const sentNotifications = JSON.parse(storage.getItem(SENT_NOTIFICATIONS_STORAGE_KEY) || "[]");

      // Create a unique key for this notification
      const notificationKey = `${title}_${body}_${triggerTime ? triggerTime.getTime() : "immediate"}`;

      // Check if we already sent this notification
      const isDuplicate = sentNotifications.includes(notificationKey);

      if (!isDuplicate) {
        // Add to sent notifications
        sentNotifications.push(notificationKey);
        // Keep only the last 50 notifications to prevent storage growth
        if (sentNotifications.length > 50) {
          sentNotifications.shift();
        }
        storage.setItem(SENT_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sentNotifications));
      }

      return isDuplicate;
    } catch (error) {
      console.error("Error checking notification duplication:", error);
      return false;
    }
  };

  /**
   * Schedule a notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} options - Notification options
   * @param {Object} options.schedule - Notification schedule options
   * @param {number} [options.schedule.seconds] - Seconds from now to trigger notification
   * @param {Date} [options.schedule.date] - Specific date to trigger notification
   * @param {Object} [options.data] - Additional data to include with the notification
   * @param {Date} [timestamp] -
   * @returns {Promise<string>} Notification identifier
   */
  const setNotification = useCallback(async (title, body, options = {}, timeStamp) => {
    try {
      const { data = {}, offsetHours = 2 } = options;

      let trigger;
      let triggerDate;

      if (timeStamp) {
        const eventDateUTC = new Date(timeStamp);
        triggerDate = new Date(eventDateUTC.getTime() - offsetHours * 60 * 60 * 1000);
        console.log("Trigger date:", triggerDate.toString());

        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          repeats: false,
        };
      }

      // Check for duplicate notification
      if (isNotificationDuplicate(title, body, triggerDate)) {
        console.log("Duplicate notification detected, skipping:", title);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger,
      });

      // Use a unique key based on content and time for DB entry
      await saveNotification(title, body, trigger?.date);

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      throw error;
    }
  }, []);

  const sendNotificationIfNeeded = useCallback(
    async (data) => {
      try {
        const { hourly } = data;
        const alertConditions = ["thunderstorm", "rain", "shower rain", "broken clouds"];
        const sentNotifications = new Set();

        // Hourly Forecast (next 12 hours)
        for (let hour of hourly) {
          const color = getHeatIndexColor(hour.heat_index);
          const { detailed_time } = formatDateTime(hour.time);

          // Create unique identifiers for each notification
          const notificationKeys = {
            extremeHeat: `extreme-heat-${hour.time}`,
            dangerHeat: `danger-heat-${hour.time}`,
            cautionHeat: `caution-heat-${hour.time}`,
            thunderstorm: `thunderstorm-${hour.time}`,
            rain: `rain-${hour.time}`,
            showerRain: `shower-rain-${hour.time}`,
            brokenClouds: `broken-clouds-${hour.time}`,
          };

          // Only send extreme danger once (highest priority)
          if (color === "#cc0001" && !sentNotifications.has(notificationKeys.extremeHeat)) {
            sentNotifications.add(notificationKeys.extremeHeat);
            await setNotification(
              "Extreme Danger Heat Alert!",
              `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
              { data: { type: "alert", weatherType: "heat" } },
              hour.time
            );
            // Skip lower level heat alerts for this hour
            continue;
          }

          // Send danger heat alert
          if ((color === "#cc0001" || color === "#ff6600") && !sentNotifications.has(notificationKeys.dangerHeat)) {
            sentNotifications.add(notificationKeys.dangerHeat);
            await setNotification(
              "Danger Heat Alert!",
              `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
              { data: { type: "alert", weatherType: "heat" } },
              hour.time
            );
            // Skip lower level heat alerts for this hour
            continue;
          }

          // Send caution heat alert
          if (color === "#ffcc00" && !sentNotifications.has(notificationKeys.cautionHeat)) {
            sentNotifications.add(notificationKeys.cautionHeat);
            await setNotification(
              "Caution High Heat Index!",
              `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
              { data: { type: "notification", weatherType: "heat" } },
              hour.time
            );
          }

          // Process rain/weather conditions
          const weatherCondition = hour.weather.condition.toLowerCase();

          if (weatherCondition.includes("thunderstorm") && !sentNotifications.has(notificationKeys.thunderstorm)) {
            sentNotifications.add(notificationKeys.thunderstorm);
            await setNotification(
              "Thunderstorm Alert!",
              `Forecast thunderstorm at ${detailed_time}.`,
              { data: { type: "alert", weatherType: "rain" } },
              hour.time
            );
          } else if (weatherCondition.includes("rain") && !weatherCondition.includes("shower") && !sentNotifications.has(notificationKeys.rain)) {
            sentNotifications.add(notificationKeys.rain);
            await setNotification("Rain Alert!", `Forecast rain at ${detailed_time}.`, { data: { type: "alert", weatherType: "rain" } }, hour.time);
          } else if (weatherCondition.includes("shower") && !sentNotifications.has(notificationKeys.showerRain)) {
            sentNotifications.add(notificationKeys.showerRain);
            await setNotification(
              "Caution Shower Rain!",
              `Forecast shower rain at ${detailed_time}.`,
              { data: { type: "notification", weatherType: "rain" } },
              hour.time
            );
          } else if (weatherCondition.includes("broken clouds") && !sentNotifications.has(notificationKeys.brokenClouds)) {
            sentNotifications.add(notificationKeys.brokenClouds);
            await setNotification(
              "Caution Broken Clouds!",
              `Forecast broken clouds at ${detailed_time}.`,
              { data: { type: "notification", weatherType: "rain" } },
              hour.time
            );
          }
        }
      } catch (error) {
        console.error("Error in sendNotificationIfNeeded:", error);
      }
    },
    [setNotification]
  );

  /**
   * Fetch notifications from the SQLite database
   * @returns {Promise<Array>} List of notifications
   * */
  const getNotificationFromDatabase = useCallback(async () => {
    try {
      const notifications = await fetchNotifications();
      return notifications;
    } catch (error) {
      console.error("Failed to fetch notifications from database:", error);
      throw error;
    }
  }, []);

  /**
   * Cancel a specific notification
   * @param {string} notificationId - ID of notification to cancel
   */
  const cancelNotification = useCallback(async (notificationId) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }, []);

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  /**
   * Get all pending notification requests
   * @returns {Promise<NotificationRequest[]>} List of pending notification requests
   */
  const getPendingNotifications = useCallback(async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  }, []);

  // Return the context value
  return {
    getNotification,
    setNotification,
    cancelNotification,
    cancelAllNotifications,
    getPendingNotifications,
    pushToken,
    permissionStatus,
    lastNotification,
    getNotificationFromDatabase,
    sendNotificationIfNeeded,
    loading,
  };
};

export default useNotification;
