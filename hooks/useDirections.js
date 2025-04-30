import { useState, useCallback } from "react";
import { fetchDirections } from "@/services/mapbox";

/**
 * Custom hook for handling map directions functionality with manual origin and destination setting.
 * @returns {Object} - Directions state and handler functions
 */
const useDirections = () => {
  const [origin, setOrigin] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState({
    distance: null,
    duration: null,
  });
  const [routeIsLoading, setRouteIsLoading] = useState(false); // Renamed loading to routeIsLoading
  const [routeError, setRouteError] = useState(null); // Renamed error to routeError
  const [hasClickedGetDirections, setHasClickedGetDirections] = useState(false);

  // Get directions from origin to destination
  const getDirections = useCallback(async (start, end) => {
    console.log("Fetching directions from:", start, "to:", end);

    if (!start || !end) {
      console.warn("Cannot fetch directions without a valid origin and destination.");
      return null;
    }

    try {
      setRouteIsLoading(true);
      setRouteError(null);
      setHasClickedGetDirections(true);

      const routeData = await fetchDirections(start, end);

      setRoute(routeData.geometry);
      setRouteInfo({
        distance: routeData.distance.toFixed(2),
        duration: routeData.duration,
      });

      return routeData;
    } catch (err) {
      setRouteError(err.message || "Error fetching directions"); // Use the new state variable
      console.error("Direction error:", err);
      return null;
    } finally {
      setRouteIsLoading(false); // Use the new state variable
    }
  }, []);

  // Function to trigger getDirections based on the current origin and destination
  const findRoute = useCallback(
    async (destination) => {
      if (origin && destination) {
        await getDirections(origin, destination);
      } else {
        console.warn("Origin or destination not set. Cannot fetch directions.");
      }
    },
    [origin, getDirections]
  );

  // Reset the route and the click state
  const resetRoute = useCallback(() => {
    setRoute(null);
    setRouteInfo({
      distance: null,
      duration: null,
    });
    setRouteError(null); // Use the new state variable
    setHasClickedGetDirections(false);
  }, []);

  // Directly set both points and get directions
  const getDirectionsBetweenPoints = useCallback(
    async (startCoords, endCoords) => {
      setOrigin(startCoords);
      setDestination(endCoords);
      setHasClickedGetDirections(true);
      return await getDirections(startCoords, endCoords);
    },
    [getDirections]
  );

  return {
    // State
    origin,
    route,
    distance: routeInfo.distance,
    duration: routeInfo.duration,
    routeIsLoading,
    routeError,
    hasClickedGetDirections,

    // Actions
    findRoute,
    resetRoute,
    getDirectionsBetweenPoints,

    // Direct setters
    setOrigin,
    setHasClickedGetDirections,
  };
};

export default useDirections;
