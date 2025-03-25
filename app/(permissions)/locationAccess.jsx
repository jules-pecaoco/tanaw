import { router } from "expo-router";
import { useEffect } from "react";
import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
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

  return (
    <PermissionScreen
      icon={icon}
      permissionTitle={PermissionData.location.title}
      permissionTitleDescription={PermissionData.location.titleDescription}
      permissionDescription={PermissionData.location.description}
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
