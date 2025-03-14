import { router } from "expo-router";
import { useEffect, useState } from "react";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import accessNotification from "@/utilities/accessNotification";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import userStorage from "@/storage/userStorage";

const Notification = () => {
  // State for notification token & loading state
  const [expoToken, setExpoToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextScreen = async () => {
    setIsLoading(true);
    try {
      const token = await accessNotification();
      setExpoToken(token);
    } catch (error) {
      console.error("Error getting notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
