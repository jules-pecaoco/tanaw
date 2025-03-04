import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import accessLocation from "@/utilities/accessLocation";
import userStorage from "@/storage/userStorage";

const Geolocation = () => {
  // CURRENT LOCATION

  const {
    data: userLocation,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["userLocation"],
    queryFn: accessLocation,
    enabled: false,
  });

  const nextScreen = () => {
    refetch();
  };

  useEffect(() => {
    if (userLocation) {
      userStorage.setItem("userLocation", JSON.stringify(userLocation));
      router.push("/notificationAccess");
    }
  }, [isLoading]);

  // STYLES
  const gradient = {
    first: "#FFFFFF",
    second: "#3c454c",
  };
  const icon = icons.gps;
  const statusBarColor = "#ffffff";

  return (
    <PermissionScreen
      icon={icon}
      permissionTitle={PermissionData.location.title}
      permissionTitleDescription={PermissionData.location.titleDescription}
      permissionDescription={PermissionData.location.description}
      handlePress={() => nextScreen()}
      disabled={isLoading}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="location"
      buttonText="Next"
    />
  );
};

export default Geolocation;
