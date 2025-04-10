import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";

const OPENWEATHER_BOX_API_URL = "https://api.openweathermap.org/data/2.5/box/city";
const OPENWEATHER_PROXIMITY_API_URL = "https://api.openweathermap.org/data/2.5/find";
const OPENWEATHER_FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast/daily";
const OPENWEATHER_HOURLY_API_URL = "https://pro.openweathermap.org/data/2.5/forecast/hourly";
const OPENWEATHER_TILE = "https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=" + OPEN_WEATHER_API_KEY;

const fetchNegrosWeather = async () => {
  console.log("Fetching weather for Negros Occidental...");
  try {
    const response = await axios.get(OPENWEATHER_BOX_API_URL, {
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

const fetchProximityWeather = async ({ currentLocation }) => {
  console.log("Fetching proximity weather");
  try {
    const response = await axios.get(OPENWEATHER_PROXIMITY_API_URL, {
      params: {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        cnt: 10,
        appid: OPEN_WEATHER_API_KEY,
        units: "metric",
      },
    });

    // Response contains a list of nearby locations with their weather data
    return response.data.list;
  } catch (error) {
    console.error("Error fetching Proximity Weather:", error);
    return [];
  }
};

const fetchDailytData = async ({ currentLocation }) => {
  console.log("Fetching foreast data.....");

  try {
    const response = await axios.get(OPENWEATHER_FORECAST_API_URL, {
      params: {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        units: "metric",
        appid: OPEN_WEATHER_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Error fetching forecast data: ", error);
    return null;
  }
};

const fetchHourlyData = async ({ currentLocation }) => {
  console.log("Fetching hourlydata......");
  try {
    const response = await axios.get(OPENWEATHER_HOURLY_API_URL, {
      params: {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        units: "metric",
        cnt: 12,
        appid: OPEN_WEATHER_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Error fetching hourly data: ", error);
    return null;
  }
};

const fetchUserWeather = async ({ currentLocation }) => {
  const forecastData = await fetchDailytData({ currentLocation });
  const hourlyData = await fetchHourlyData({ currentLocation });

  return {
    forecast: forecastData || [],
    hourly: hourlyData || [],
  };
};

const fetchOpenWeatherTile = (layer = "temp_new") => {
  return OPENWEATHER_TILE.replace("{layer}", layer);
};



export { fetchUserWeather, fetchOpenWeatherTile, fetchNegrosWeather, fetchProximityWeather };
