import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";

const OPENWEATHER_FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast/daily";
const OPENWEATHER_HOURLY_API_URL = "https://pro.openweathermap.org/data/2.5/forecast/hourly";

const fetchDailytData = async ({ currentLocation }) => {
  console.log(currentLocation);
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

export { fetchUserWeather };
