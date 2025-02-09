import * as Location from "expo-location";

const accessLocation = async () => {
  try {
    // Check current permissions
    const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

    if (currentStatus === Location.PermissionStatus.GRANTED) {
      return await getLocation();
    }

    if (currentStatus === Location.PermissionStatus.DENIED) {
      console.warn("Location permission denied previously.");
      return null;
    }

    // Request permissions if not granted
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync();

    if (newStatus === Location.PermissionStatus.GRANTED) {
      return await getLocation();
    } else {
      console.warn("Location permission denied by user.");
      return null;
    }
  } catch (error) {
    console.error("Error accessing location:", error);
    return null;
  }
};

const getLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  } catch (error) {
    console.error("Error retrieving current position:", error);
    return null;
  }
};

export default accessLocation;
