import { router } from "expo-router";

import { icons } from "@/constants/index";
import { PermissionData } from "@/data/textContent";
import PermissionScreen from "@/views/Permissions/PermissionScreen";
import userPermissionStore from "@/context/userPermissionStore";
import accessLocation from "@/utilities/accessLocation";

const Geolocation = () => {
  // CURRENT LOCATION
  const getLocation = async () => {
    const location = await accessLocation();
    if (location) {
      userPermissionStore.setItem("userLocation", JSON.stringify(location));
    }

    router.push("/notificationAccess");
  };

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
      handlePress={() => getLocation()}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="location"
      buttonText="Next"
    />
  );
};

export default Geolocation;
