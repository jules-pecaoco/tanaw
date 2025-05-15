import axios from "axios";

const rainViewer = "https://api.rainviewer.com/public/weather-maps.json";

const fetchRainViewerTile = async () => {
  try {
    const { data } = await axios.get(rainViewer);
    const { radar } = data;

    // Combine past and nowcast radar data
    const allRadarData = [...(radar.past || []), ...(radar.nowcast || [])];

    // Sort from latest to earliest based on time
    const sortedRadarData = allRadarData.sort((a, b) => b.time - a.time);

    // Return directly as an array without the radar wrapper
    return sortedRadarData;
  } catch (error) {
    console.error("Error fetching RainViewer data:", error);
    throw new Error("Failed to fetch RainViewer data");
  }
};

export { fetchRainViewerTile };
