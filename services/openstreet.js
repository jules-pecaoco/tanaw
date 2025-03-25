import axios from "axios";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const filterFacilities = ["Hospitals", "FireStations", "EvacSites"];
const facilityOverpassTypes = {
  hospital: '["amenity"="hospital"]',
  fire_station: '["amenity"="fire_station"]',
  primary_school: '["amenity"="school"]["operator:type"="public"]',
  secondary_school: '["amenity"="school"]["operator:type"="public"]',
};

/**
 * Fetches facilities based on type and location using Overpass API (OpenStreetMap).
 * @param {Object} currentLocation - The user's latitude and longitude.
 * @returns {Object} Facilities grouped by category.
 */
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

export { fetchOpenStreetFacilitiesByType };
