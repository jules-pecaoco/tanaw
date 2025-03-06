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

        const facilitiesWithDetails = await Promise.all(
          response.data.results.map(async (facility) => {
            try {
              const detailsResponse = await axios.get(GOOGLE_PLACES_DETAILS_URL, {
                params: {
                  place_id: facility.place_id,
                  key: GOOGLE_PLACES_API_KEY,
                },
              });

              return {
                ...facility,
                details: detailsResponse.data.result, // Merging facility details
              };
            } catch (error) {
              console.error(`Error fetching details for ${facility.name}:`, error);
              return facility; // Return facility without details if API fails
            }
          })
        );

        return { type, results: facilitiesWithDetails };
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

export { fetchAllFacilities };
