import axios from "axios";
import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";

const MAPBOX_SEARCH_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const MAPBOX_RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";
const MPABOX_REVERSEGEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/reverse";

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
    const response = await axios.get(MPABOX_REVERSEGEOCODE_URL, {
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

export { searchCity, searchCityDetails, reverseGeocode };
