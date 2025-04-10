import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { setupNotificationsTable, saveNotification, fetchNotifications } from "../services/sqlite"; // Adjust the import path as necessary

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
    setupNotificationsTable();

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
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setLastNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { notification } = response;
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
   * @returns {Promise<string>} Notification identifier
   */
  const setNotification = async (title, body, options = {}) => {
    try {
      const { schedule = { seconds: 10 }, data = {} } = options;

      // Build the trigger based on provided schedule
      let trigger;
      if (schedule.date instanceof Date) {
        trigger = { date: schedule.date };
      } else if (typeof schedule.seconds === "number") {
        trigger = { seconds: schedule.seconds };
      } else {
        trigger = { seconds: 10 }; // Default to 10 seconds
      }

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger,
      });

      saveNotification(title, body); // Save notification to SQLite database

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      throw error;
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
