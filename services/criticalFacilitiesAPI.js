import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "@/tokens/tokens";

const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const GOOGLE_PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json?";

const facilityTypes = ["hospital", "fire_station", "primary_school", "secondary_school"];
const facilityKeyWord = ["", "", "public school", "public school"];
const filterFacilities = ["Hospitals", "FireStations", "EvacSites"];

/**
 * Fetches facilities based on type and location.
 * @param {Object} currentLocation - The user's latitude and longitude.
 * @returns {Object} Facilities grouped by category.
 */
const fetchFacilitiesByType = async ({ currentLocation }) => {
  console.log("Fetching facilities by type...");

  try {
    const allResults = await Promise.all(
      facilityTypes.map(async (type, index) => {
        const response = await axios.get(GOOGLE_PLACES_URL, {
          params: {
            location: `${currentLocation.latitude},${currentLocation.longitude}`,
            radius: 5000,
            type: type,
            keyword: facilityKeyWord[index],
            key: GOOGLE_PLACES_API_KEY,
          },
        });

        return { type, results: response.data.results };
      })
    );

    const facilitiesObject = allResults.reduce((acc, item) => {
      if (item.type === "primary_school" || item.type === "secondary_school") {
        acc["EvacSites"] = [...(acc["EvacSites"] || []), ...item.results];
      } else {
        const categoryIndex = facilityTypes.indexOf(item.type);
        acc[filterFacilities[categoryIndex]] = item.results;
      }
      return acc;
    }, {});

    return facilitiesObject;
  } catch (error) {
    console.error("Error fetching facilities by type:", error);
    return null;
  }
};

/**
 * Fetches facility details based on place ID.
 * @param {string} placeId - The Place ID of the facility.
 * @returns {Object|null} Facility details.
 */
const fetchFacilityById = async (placeId) => {
  console.log(`Fetching details for Place ID: ${placeId}...`);

  try {
    const response = await axios.get(GOOGLE_PLACES_DETAILS_URL, {
      params: {
        place_id: placeId,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    return response.data.result;
  } catch (error) {
    console.error(`Error fetching details for Place ID ${placeId}:`, error);
    return null;
  }
};

export { fetchFacilitiesByType, fetchFacilityById };
