import axios from "axios";

import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/box/city";

const fetchNegrosWeather = async () => {
  console.log("Fetching weather for Negros Occidental...");
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        bbox: "122.0,9.0,123.6,11.2,10",
        units: "metric",
        appid: OPEN_WEATHER_API_KEY,
      },
    });

    return response.data.list;
  } catch (error) {
    console.error("Error fetching Negros weather:", error);
  }
};

export { fetchNegrosWeather };
