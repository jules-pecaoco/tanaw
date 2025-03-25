import axios from "axios";

const rainViewer = "https://api.rainviewer.com/public/weather-maps.json";

const fetchRainViewerTile = async () => {
  try {
    const { data } = await axios.get(rainViewer);
    const { host, radar } = data;
    const latestFrame = radar.nowcast[radar.nowcast.length - 1];
    return `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  } catch (error) {
    console.error("Error fetching RainViewer data:", error);
    throw new Error("Failed to fetch RainViewer data");
  }
};

export { fetchRainViewerTile };
