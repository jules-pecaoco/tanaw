import { router } from "expo-router";
import { useEffect, useState } from "react";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import accessLocation from "@/utilities/accessLocation";
import userStorage from "@/storage/userStorage";

const Geolocation = () => {
  // State for loading and user location
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextScreen = async () => {
    setIsLoading(true);
    try {
      const location = await accessLocation();
      setUserLocation(location);
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      userStorage.setItem("userLocation", JSON.stringify(userLocation));
      router.push("/notificationAccess");
    }
  }, [userLocation]);

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
      handlePress={nextScreen}
      disabled={isLoading}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="location"
      buttonText={isLoading ? "Loading..." : "Next"}
    />
  );
};

export default Geolocation;
