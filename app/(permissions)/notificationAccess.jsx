import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import accessNotification from "@/utilities/accessNotification";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import userStorage from "@/storage/userStorage";

const Notification = () => {
  // NOTIFICATION PERMISSION
  const {
    data: expoToken,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["expoToken"],
    queryFn: accessNotification,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const nextScreen = () => {
    refetch();
  };

  useEffect(() => {
    if (expoToken) {
      userStorage.setItem("expoToken", expoToken);
      router.push("/radar");
    }
  }, [isLoading, expoToken]);

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
      handlePress={() => nextScreen()}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="notification"
      buttonText="Start"
      disabled={isLoading}
    />
  );
};

export default Notification;
