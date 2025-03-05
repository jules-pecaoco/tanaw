import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "@/tokens/tokens";

const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const GOOGLE_PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json?";

const facilityTypes = ["hospital", "fire_station", "evacuation_center"];
const filterFacilities = ["Hospitals", "FireStations", "EvacSites"];

const fetchAllFacilities = async ({ currentLocation }) => {
  console.log("Fetching all facilities...");

  try {
    const allResults = await Promise.all(
      facilityTypes.map(async (type, index) => {
        const response = await axios.get(GOOGLE_PLACES_URL, {
          params: {
            location: `${currentLocation.latitude},${currentLocation.longitude}`,
            radius: 5000,
            type: type,
            key: GOOGLE_PLACES_API_KEY,
          },
        });

        return { key: filterFacilities[index], results: response.data.results };
      })
    );

    // Convert array of objects into a single object
    const facilitiesObject = allResults.reduce((acc, item) => {
      acc[item.key] = item.results;
      return acc;
    }, {});

    return facilitiesObject;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return null;
  }
};

const fetchCriticalFacilitiesInformmation = async ({ placeId }) => {
  console.log("Fetching critical facilities information...");

  try {
    const response = await axios.get(GOOGLE_PLACES_DETAILS_URL, {
      params: {
        place_id: placeId,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error("Error fetching critical facilities information:", error);
    return [];
  }
};

export { fetchAllFacilities, fetchCriticalFacilitiesInformmation };
