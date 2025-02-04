import { router } from "expo-router";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import accessNotification from "@/utilities/accessNotification";
import userPermissionStore from "@/context/userPermissionStore";
import PermissionScreen from "@/views/Permissions/PermissionScreen";

const Notification = () => {
  // NOTIFICATION PERMISSION
  const getNotificationPermission = async () => {
    const token = await accessNotification();
    if (token) {
      userPermissionStore.setItem("expoPushToken", token);
      
    }

    userPermissionStore.setItem("hasVisitedPermissionScreen", "true");
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
