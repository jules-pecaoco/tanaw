import axios from "axios";
import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";

const MAPBOX_SEARCH_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const MAPBOX_RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";
const MAPBOX_REVERSEGEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/reverse";
const MAPBOX_DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox";

/**
 * Search for cities using Mapbox API
 * @param {string} cityName - The city name to search for
 * @param {object} userLocation - The user's current location (latitude, longitude)
 * @param {string} sessionToken - Unique token for this search session (from parent)
 * @returns {Promise<Array>} - List of matching city suggestions
 */
const searchCity = async (cityName, currentLocation, sessionToken) => {
  try {
    const response = await axios.get(MAPBOX_SEARCH_URL, {
      params: {
        q: cityName,
        language: "en",
        country: "ph",
        proximity: `${currentLocation.longitude},${currentLocation.latitude}`,
        types: "city",
        session_token: sessionToken,
        access_token: MAPBOX_PUBLIC_TOKEN,
      },
    });

    return response.data.suggestions;
  } catch (error) {
    console.error("Error searching city:", error);
    return [];
  }
};

/**
 * Search for city details using Mapbox API
 * @param {string} cityId - The city id to search for
 * @param {string} sessionToken - Unique token for this search session (from parent)
 * @returns {Promise<Array>} - city details
 */
const searchCityDetails = async (cityId, session_token) => {
  try {
    const response = await axios.get(MAPBOX_RETRIEVE_URL + `/${cityId}`, {
      params: {
        language: "en",
        session_token: session_token,
        access_token: MAPBOX_PUBLIC_TOKEN,
      },
    });

    return response.data.features[0];
  } catch (error) {
    console.error("Error searching city details:", error);
    return [];
  }
};

/**
 * Reverse geocode latitude and longitude to get location name using Mapbox API
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @return {Promise<string>} - Location name
 */

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(MAPBOX_REVERSEGEOCODE_URL, {
      params: {
        latitude: latitude,
        longitude: longitude,
        access_token: MAPBOX_PUBLIC_TOKEN,
      },
    });

    return {
      locality: response.data.features[0].properties.context.locality.name,
      city: response.data.features[0].properties.context.place.name,
      region: response.data.features[0].properties.context.region.name,
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};

/**
 * Fetches directions data from Mapbox Directions API
 *
 * @param {Array} origin - Origin coordinates [longitude, latitude]
 * @param {Array} destination - Destination coordinates [longitude, latitude]
 * @param {String} profile - Travel profile (driving, walking, cycling)
 * @returns {Promise} - Route data with geometry, distance, duration
 */
const fetchDirections = async (origin, destination, profile = "driving") => {
  console.log("Fetching directions from:", origin, "to:", destination);
  try {
    // **Important:** Mapbox uses [longitude, latitude] order.
    const startLng = origin.longitude;
    const startLat = origin.latitude;
    const endLng = destination.longitude;
    const endLat = destination.latitude;

    const waypoints = `${startLng},${startLat};${endLng},${endLat}`; 
    const response = await axios.get(
      `${MAPBOX_DIRECTIONS_URL}/${profile}/${waypoints}`, 
      {
        params: {
          alternatives: false,
          geometries: "geojson",
          language: "en",
          overview: "full",
          steps: false,
          access_token: MAPBOX_PUBLIC_TOKEN, 
        },
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        coordinates: route.geometry.coordinates,
        distance: route.distance / 1000,
        duration: Math.round(route.duration / 60),
        geometry: route.geometry, // Use the geometry directly from the response
      };
    }

    throw new Error("No routes found");
  } catch (error) {
    console.error("Error fetching directions:", error);
    throw error;
  }
};

export { searchCity, searchCityDetails, reverseGeocode, fetchDirections };
