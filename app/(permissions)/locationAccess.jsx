import { router } from "expo-router";
import * as Location from "expo-location";

import { icons } from "@/constants/index";
import { userPermissionStore } from "@/context/userPermissionStore";
import { PermissionData } from "@/data/contentData";
import PermissionScreen from "@/views/screens/Permission/PermissionScreen";


const Geolocation = () => {
  // CURRENT LOCATION
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      userPermissionStore.setItem("location", "false");
      router.push("/notificationAccess");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    userPermissionStore.setItem("location", JSON.stringify(location));
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
      handlePress={() => getCurrentLocation()}
      gradient={gradient}
      statusBarColor={statusBarColor}
      permissionType="location"
      buttonText="Next"
    />
  );
};

export default Geolocation;
