import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";

const NEARBY_CITIES_URL = "https://api.openweathermap.org/data/2.5/find";



const fetchNearbyCities = async (latitude, longitude, radius = 50) => {
  try {
    const response = await axios.get(NEARBY_CITIES_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        cnt: 10,
        units: "metric",
        appid: OPEN_WEATHER_API_KEY,
      },
    });
    return response.data.list; // Returns an array of city weather data
  } catch (error) {
    console.error("Error fetching nearby cities:", error);
    throw new Error("Failed to fetch nearby cities");
  }
};

export { fetchNearbyCities };