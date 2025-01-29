import * as Location from "expo-location";

const accessLocation = async () => {
  // Check current permissions
  const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

  if (currentStatus === "granted") {
    const location = await Location.getCurrentPositionAsync({});
    return location;
  }

  // Request permissions if not granted
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status === "granted") {
    const location = await Location.getCurrentPositionAsync({});
    return location;
  }

  // Return null if permission is denied
  return null;
};

export default accessLocation;
