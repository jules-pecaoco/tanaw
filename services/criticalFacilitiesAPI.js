import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "@/tokens/tokens";

const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";
const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places/";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Facility Types Mapping
const facilityTypes = ["hospital", "fire_station", "primary_school", "secondary_school"];
const facilityKeyWord = ["", "", "public school", "public school"];
const filterFacilities = ["Hospitals", "FireStations", "EvacSites"];

/**
 * Fetches facilities based on type and location using Google Places API (New).
 * @param {Object} currentLocation - The user's latitude and longitude.
 * @returns {Object} Facilities grouped by category.
 */
const fetchGoogleFacilitiesByType = async ({ currentLocation }) => {
  console.log("Fetching facilities by type...");

  try {
    const allResults = await Promise.all(
      facilityTypes.map(async (type, index) => {
        const requestBody = {
          includedTypes: [type],
          locationRestriction: {
            circle: {
              center: { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
              radius: 5000,
            },
          },
        };

        // ACTUAL FETCH
        const response = await axios.post(GOOGLE_PLACES_URL, requestBody, {
          params: { key: GOOGLE_PLACES_API_KEY },
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.id,places.displayName,places.location",
          },
        });

        return {
          type,
          results: response.data.places.map((place) => ({
            id: place.id,
            name: place.displayName.text,
            location: place.location,
          })),
        };
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
    console.error("Error fetching facilities by type:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Fetches facility details based on place ID using Google Places API (New).
 * @param {string} placeId - The Place ID of the facility.
 * @returns {Object|null} Facility details including formatted phone number.
 */
const fetchGoogleFacilityById = async (placeId) => {
  console.log(`Fetching details for Place ID: ${placeId}...`);

  try {
    const response = await axios.get(`${GOOGLE_PLACES_DETAILS_URL}${placeId}`, {
      params: { key: GOOGLE_PLACES_API_KEY },
      headers: {
        "X-Goog-FieldMask": "id,displayName,nationalPhoneNumber,location",
      },
    });

    const placeDetails = response.data;
    return {
      id: placeDetails.id,
      name: placeDetails.displayName.text,
      location: placeDetails.location,
      phone: placeDetails.nationalPhoneNumber || "No phone number available",
    };
  } catch (error) {
    console.error(`Error fetching details for Place ID ${placeId}:`, error.response?.data || error.message);
    return null;
  }
};

/**
 * Fetches facilities based on type and location using Overpass API (OpenStreetMap).
 * @param {Object} currentLocation - The user's latitude and longitude.
 * @returns {Object} Facilities grouped by category.
 */

const facilityOverpassTypes = {
  hospital: '["amenity"="hospital"]',
  fire_station: '["amenity"="fire_station"]',
  primary_school: '["amenity"="school"]["operator:type"="public"]',
  secondary_school: '["amenity"="school"]["operator:type"="public"]',
};

const fetchOpenStreetFacilitiesByType = async ({ currentLocation }) => {
  console.log("Fetching facilities from Overpass API...");

  try {
    const allResults = await Promise.all(
      Object.entries(facilityOverpassTypes).map(async ([type, queryFilter]) => {
        const query = `
          [out:json];
          (
            node${queryFilter}(around:5000, ${currentLocation.latitude}, ${currentLocation.longitude});
            way${queryFilter}(around:5000, ${currentLocation.latitude}, ${currentLocation.longitude});
            relation${queryFilter}(around:5000, ${currentLocation.latitude}, ${currentLocation.longitude});
          );
          out center;
        `;

        const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        return {
          type,
          results: response.data.elements.map((element) => ({
            id: element.id,
            name: element.tags.name || "Unknown Facility",
            location: {
              latitude: element.lat || element.center?.lat,
              longitude: element.lon || element.center?.lon,
            },
            phone: element.tags?.["contact:phone"] ? element.tags["contact:phone"].split(";").map((p) => p.trim()) : ["No phone number available"],
          })),
        };
      })
    );

    // Group results into categories
    const facilitiesObject = allResults.reduce((acc, item) => {
      if (item.type === "primary_school" || item.type === "secondary_school") {
        acc["EvacSites"] = [...(acc["EvacSites"] || []), ...item.results];
      } else {
        const categoryIndex = Object.keys(facilityOverpassTypes).indexOf(item.type);
        acc[filterFacilities[categoryIndex]] = item.results;
      }
      return acc;
    }, {});

    return facilitiesObject;
  } catch (error) {
    console.error("Error fetching facilities from Overpass API:", error.response?.data || error.message);
    return null;
  }
};

export { fetchGoogleFacilitiesByType, fetchGoogleFacilityById, fetchOpenStreetFacilitiesByType };
