import { router } from "expo-router";
import { useEffect, useState } from "react";
import uuid from "react-native-uuid";

import { icons } from "@/constants/index";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import storage from "@/storage/storage";
import { useNotification } from "@/context/NotificationContext";

const Notification = () => {
  const { getNotification } = useNotification();
  const [expoToken, setExpoToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextScreen = async () => {
    setIsLoading(true);
    try {
      const token = await getNotification();
      setExpoToken(token);
    } catch (error) {
      console.error("Error getting notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  let userId = storage.getItem("userID");

  if (!userId) {
    userId = uuid.v4();
    storage.setItem("userID", userId);
  }

  useEffect(() => {
    if (expoToken) {
      storage.setItem("expoToken", expoToken);
      router.replace("/radar");
    }
  }, [expoToken]);

  // STYLES
  const gradient = {
    first: "#E8434C",
    second: "#3c454c",
  };
  const icon = icons.notifications;
  const statusBarColor = "#E8434C";

  const NotificationText = {
    title: "NOTIFICATION PERMISSION",
    titleDescription: "Turn On Notifications for Alerts",
    description: "We need your permission to send you notifications about important updates and alerts.",
    permission: "notification",
  };

  return (
    <PermissionScreen
      icon={icon}
      permissionTitle={NotificationText.title}
      permissionTitleDescription={NotificationText.titleDescription}
      permissionDescription={NotificationText.description}
      handlePress={nextScreen}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="notification"
      buttonText={isLoading ? "Loading..." : "Start"}
      disabled={isLoading}
    />
  );
};

export default Notification;
