import { useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

/**
 * Custom hook for handling notifications in React Native with Expo
 * @param {string} projectId - The Expo project ID for push notifications
 * @returns {Object} Notification methods and state
 */
const useNotification = (projectId) => {
  const [pushToken, setPushToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

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

    // Only send notification if device is physical
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
   * @param {Object} schedule - Notification schedule options
   * @param {number} [schedule.seconds] - Seconds from now to trigger notification
   * @param {Date} [schedule.date] - Specific date to trigger notification
   * @returns {Promise<string>} Notification identifier
   */
  const setNotification = async (title, body, schedule = { seconds: 10 }) => {
    try {
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
        content: { title, body },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
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

  return {
    getNotification,
    setNotification,
    cancelNotification,
    cancelAllNotifications,
    pushToken,
    permissionStatus,
  };
};

export default useNotification;
