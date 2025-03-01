import axios from "axios";
import { OPEN_WEATHER_API_KEY } from "@/tokens/tokens";

const RAINVIEWER_API_URL = "https://api.rainviewer.com/public/weather-maps.json";
const OPEN_WEATHER_WEATHER_URL = "https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=" + OPEN_WEATHER_API_KEY;

const fetchRainViewerData = async () => {
  console.log("fetching Rain Viewer Data...............................................................");
  try {
    const response = await axios.get(RAINVIEWER_API_URL);
    const rainViewerData = response.data;
    const host = rainViewerData.host;
    const radarFrames = rainViewerData.radar.past;
    const latestFrame = radarFrames[radarFrames.length - 1];
    const path = latestFrame.path;
    return `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`;
  } catch (error) {
    console.error("Error fetching RainViewer data:", error);
    throw new Error("Failed to fetch RainViewer data");
  }
};

const fetchOpenWeatherData = async (layer) => {
  console.log("fetching Open Weather Data...............................................................");
  return OPEN_WEATHER_WEATHER_URL.replace("{layer}", layer);
};

export { fetchRainViewerData, fetchOpenWeatherData };
