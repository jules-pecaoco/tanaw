import { router } from "expo-router";
import { useEffect, useState } from "react";
import uuid from "react-native-uuid";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import userStorage from "@/storage/userStorage";
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

  let userId = userStorage.getItem("userID");

  if (!userId) {
    userId = uuid.v4();
    userStorage.setItem("userID", userId);
  }

  useEffect(() => {
    if (expoToken) {
      userStorage.setItem("expoToken", expoToken);
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

  return (
    <PermissionScreen
      icon={icon}
      permissionTitle={PermissionData.notification.title}
      permissionTitleDescription={PermissionData.notification.titleDescription}
      permissionDescription={PermissionData.notification.description}
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
