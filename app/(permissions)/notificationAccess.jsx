import { router } from "expo-router";

import { icons } from "@/constants/index";
import { registerForPushNotificationsAsync } from "@/utilities/registerNotification";
import { userPermissionStore } from "@/context/userPermissionStore";
import PermissionScreen from "@/views/screens/Permission/PermissionScreen";
import { PermissionData } from "@/data/contentData";

const Notification = () => {
  // NOTIFICATION PERMISSION
  const getNotificationPermission = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      userPermissionStore.setItem("expoPushToken", token);
      router.replace("/radar");
      return;
    }

    userPermissionStore.setItem("expoPushToken", "false");
    router.replace("/radar");
  };

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
      handlePress={() => getNotificationPermission()}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="notification"
      buttonText="Start"
    />
  );
};

export default Notification;
