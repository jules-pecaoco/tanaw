import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "@/tokens/tokens";

const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const GOOGLE_PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json?";

const facilityTypes = ["hospital", "fire_station", "primary_school", "secondary_school"];
const facilityKeyWord = ["", "", "public school", "public school"];
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
