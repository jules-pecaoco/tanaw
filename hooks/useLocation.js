import { useState } from "react";
import * as Location from "expo-location";
import userStorage from "@/storage/userStorage";

const LOCATION_STORAGE_KEY = "userLocation";

const useLocation = () => {
  // Initialize location from storage during state initialization
  const getInitialLocation = () => {
    const storedLocation = userStorage.getItem(LOCATION_STORAGE_KEY);
    if (storedLocation) {
      try {
        const parsedLocation = JSON.parse(storedLocation);
        // Check if it's in the expected format
        if (parsedLocation && parsedLocation.latitude && parsedLocation.longitude) {
          return parsedLocation;
        } else if (parsedLocation && parsedLocation.coords) {
          // Handle the case where it's stored in the coords format
          return {
            latitude: parsedLocation.coords.latitude,
            longitude: parsedLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
        }
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }
    return null;
  };

  const [location, setLocation] = useState(getInitialLocation);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      setLoading(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return null;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      // Save to state
      setLocation(locationData);

      // Save to storage
      userStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));

      setLoading(false);
      return locationData;
    } catch (error) {
      setErrorMsg("Error getting location: " + error.message);
      setLoading(false);
      return null;
    }
  };

  return { location, errorMsg, loading, getLocation };
};

export default useLocation;
