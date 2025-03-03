import axios from "axios";
import { OPEN_WEATHER_API_KEY, TOMORROWIO_API_KEY } from "@/tokens/tokens";

const BASE_URLS = {
  rainViewer: "https://api.rainviewer.com/public/weather-maps.json",
  openWeather: "https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=" + OPEN_WEATHER_API_KEY,
  tomorrowIO: "https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/{layer}/now.png?apikey=" + TOMORROWIO_API_KEY,
};


const fetchRainViewerData = async () => {
  try {
    const { data } = await axios.get(BASE_URLS.rainViewer);
    const { host, radar } = data;
    const latestFrame = radar.nowcast[radar.nowcast.length - 1];
    return `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  } catch (error) {
    console.error("Error fetching RainViewer data:", error);
    throw new Error("Failed to fetch RainViewer data");
  }
};

const fetchOpenWeatherData = async (layer) => {
  return BASE_URLS.openWeather.replace("{layer}", layer);
};


export { fetchRainViewerData, fetchOpenWeatherData };
