import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { setupNotificationsTable, saveNotification, fetchNotifications } from "@/services/sqlite";

import { formatDateTime } from "@/utilities/formatDateTime";
import { getHeatIndexColor } from "@/utilities/temperatureColorInterpretation";
import { router } from "expo-router";

// Create the context
const NotificationContext = createContext(null);

/**
 * Provider component for notification functionality
 * @param {Object} props - Component props
 * @param {Object} props.children - Child components
 * @param {string} props.projectId - Expo project ID
 * @returns {JSX.Element} Provider component
 */
export const NotificationProvider = ({ children, projectId }) => {
  const [pushToken, setPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set up notification listeners & database when component mounts
    setupNotificationListeners();
    const setupTable = async () => {
      await setupNotificationsTable();
    };

    setupTable();

    // Clean up listeners when component unmounts
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  /**
   * Set up notification listeners
   */
  const setupNotificationListeners = () => {
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
  const getNotification = async () => {
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

    // If permission already granted, return true
    if (existingStatus === "granted") {
      try {
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        setPushToken(token);
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

    if (finalStatus !== "granted") {
      return null;
    }

    if (!projectId) {
      handleRegistrationError("Project ID not found");
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      setPushToken(token);
      return token;
    } catch (e) {
      handleRegistrationError(`${e}`);
      return null;
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
  const setNotification = async (title, body, options = {}, timeStamp) => {
    try {
      const { data = {}, offsetHours = 2 } = options;

      let trigger;

      if (timeStamp) {
        // timestamp in iso format
        const eventDateUTC = new Date(timeStamp);

        const triggerDate = new Date(eventDateUTC.getTime() - offsetHours * 60 * 60 * 1000);

        console.log("Trigger date:", triggerDate.toString());

        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          repeats: false,
        };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger,
      });

      saveNotification(title, body, trigger.date);

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      throw error;
    }
  };

  const sendNotificationIfNeeded = async (data) => {
    const { hourly } = data;

    const alertConditions = ["thunderstorm", "rain", "shower rain", "broken clouds"];

    // Hourly Forecast (next 12 hours)
    for (let hour of hourly) {
      const color = getHeatIndexColor(hour.heat_index);
      const { detailed_time } = formatDateTime(hour.time);

      if (color === "#cc0001") {
        await setNotification(
          "Extreme Danger Heat Alert!",
          `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
          { data: { type: "alert", weatherType: "heat" } },
          hour.time
        );
      }
      if (color === "#cc0001" || color === "#ff6600") {
        await setNotification(
          "Danger Heat Alert!",
          `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
          { data: { type: "alert", weatherType: "heat" } },
          hour.time
        );
      }

      if (color === "#ffcc00") {
        await setNotification(
          "Caution High Heat Index!",
          `Forecast heat index of ${hour.heat_index}°C at ${detailed_time}.`,
          { data: { type: "notification", weatherType: "heat" } },
          hour.time
        );
      }

      if (hour.weather.condition === alertConditions[0]) {
        await setNotification(
          "Thunderstorm Alert!",
          `Forecast thunderstorm at ${detailed_time}.`,
          { data: { type: "alert", weatherType: "rain" } },
          hour.time
        );
      }

      if (hour.weather.condition === alertConditions[1]) {
        await setNotification("Rain Alert!", `Forecast rain at ${detailed_time}.`, { data: { type: "alert", weatherType: "rain" } }, hour.time);
      }

      if (hour.weather.condition === alertConditions[2]) {
        await setNotification(
          "Caution Shower Rain!",
          `Forecast shower rain at ${detailed_time}.`,
          { data: { type: "notification", weatherType: "rain" } },
          hour.time
        );
      }

      if (hour.weather.condition === alertConditions[3]) {
        await setNotification(
          "Caution Broken Clouds!",
          `Forecast broken clouds at ${detailed_time}.`,
          { data: { type: "notification", weatherType: "rain" } },
          hour.time
        );
      }
    }
  };
  /**
   * Fetch notifications from the SQLite database
   * @returns {Promise<Array>} List of notifications
   * */
  const getNotificationFromDatabase = async () => {
    try {
      const notifications = await fetchNotifications();
      return notifications;
    } catch (error) {
      console.error("Failed to fetch notifications from database:", error);
      throw error;
    }
  };

  /**
   * Cancel a specific notification
   * @param {string} notificationId - ID of notification to cancel
   */
  const cancelNotification = async (notificationId) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  /**
   * Get all pending notification requests
   * @returns {Promise<NotificationRequest[]>} List of pending notification requests
   */
  const getPendingNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
  };

  // Context value to be provided
  const contextValue = {
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
  };

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

/**
 * Custom hook to use notification context
 * @returns {Object} Notification context value
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};
