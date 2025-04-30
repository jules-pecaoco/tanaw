import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";
import { reverseGeocode } from "@/services/mapbox";
import { convertUnixToISO } from "@/utilities/formatDateTime";

const OPENWEATHER_BOX_API_URL = "https://api.openweathermap.org/data/2.5/box/city";
const OPENWEATHER_PROXIMITY_API_URL = "https://api.openweathermap.org/data/2.5/find";
const OPENWEATHER_ONECALL_API_URL = "https://api.openweathermap.org/data/3.0/onecall";

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

    // extract only necessary data
    const simplifiedData = response.data.list.map((location) => ({
      id: location.id,
      city: location.name,
      heat_index: location.main.feels_like,
      humidity: location.main.humidity,
      clouds: location.clouds.all,
      weather: {
        condition: location.weather[0].main,
        description: location.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${location.weather[0].icon}.png`,
      },
      coords: {
        lat: location.coord.Lat,
        lon: location.coord.Lon,
      },
    }));

    return simplifiedData;
  } catch (error) {
    console.error("Error fetching Negros weather:", error);
    return [];
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

    const simplifiedData = response.data.list.map((location) => ({
      id: location.id,
      city: location.name,
      heat_index: location.main.feels_like,
      humidity: location.main.humidity,
      clouds: location.clouds.all,
      weather: {
        condition: location.weather[0].main,
        description: location.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${location.weather[0].icon}.png`,
      },
      coords: {
        lat: location.coord.lat,
        lon: location.coord.lon,
      },
    }));

    return simplifiedData;
  } catch (error) {
    console.error("Error fetching Proximity Weather:", error);
    return [];
  }
};

const fetchOneCallWeather = async ({ currentLocation }) => {
  console.log("Location", currentLocation);
  console.log("Fetching one call weather data.....");

  try {
    const response = await axios.get(OPENWEATHER_ONECALL_API_URL, {
      params: {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        exclude: "minutely",
        units: "metric",
        appid: OPEN_WEATHER_API_KEY,
      },
    });

    const name = await reverseGeocode(response.data.lat, response.data.lon);

    // extract current, hourly, and daily data
    const simplifiedData = {
      name: name,
      current: {
        time: convertUnixToISO(response.data.current.dt),
        heat_index: response.data.current.feels_like,
        weather: {
          condition: response.data.current.weather[0].main,
          description: response.data.current.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${response.data.current.weather[0].icon}.png`,
        },
      },
      hourly: response.data.hourly.slice(0, 12).map((hour) => ({
        time: convertUnixToISO(hour.dt),
        temp: hour.temp,
        heat_index: hour.feels_like,
        weather: {
          condition: hour.weather[0].main,
          description: hour.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`,
        },
      })),
      daily: response.data.daily.map((day) => ({
        time: convertUnixToISO(day.dt),
        temp: {
          min: day.temp.min,
          max: day.temp.max,
        },
        heat_index: day.feels_like.day,
        weather: {
          condition: day.weather[0].main,
          description: day.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
        },
      })),
    };

    return simplifiedData;
  } catch (error) {
    console.log("Error fetching one call weather data: ", error);
    return null;
  }
};

const fetchOpenWeatherTile = (layer = "temp_new") => {
  return OPENWEATHER_TILE.replace("{layer}", layer);
};

export { fetchOpenWeatherTile, fetchNegrosWeather, fetchProximityWeather, fetchOneCallWeather };
