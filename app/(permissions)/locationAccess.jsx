import { router } from "expo-router";
import { useEffect } from "react";

import { icons } from "@/constants/index";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import useLocation from "@/hooks/useLocation";

const Geolocation = () => {
  const { location, loading, getLocation } = useLocation();

  const nextScreen = async () => {
    await getLocation();
  };

  useEffect(() => {
    if (location) {
      router.push("/notificationAccess");
    }
  }, [location]);

  // STYLES
  const gradient = {
    first: "#FFFFFF",
    second: "#3c454c",
  };
  const icon = icons.gps;
  const statusBarColor = "#ffffff";

  const LocationText = {
    title: "LOCATION PERMISSION",
    titleDescription: "Enable Location for Hyper-Local Updates",
    description: "We need your permission to access your location to provide you with accurate, real-time updates.",
    permission: "location",
  };

  return (
    <PermissionScreen
      icon={icon}
      permissionTitle={LocationText.title}
      permissionTitleDescription={LocationText.titleDescription}
      permissionDescription={LocationText.description}
      handlePress={nextScreen}
      disabled={loading}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="location"
      buttonText={loading ? "Loading..." : "Next"}
    />
  );
};

export default Geolocation;
