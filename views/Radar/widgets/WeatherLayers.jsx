import { RasterLayer, RasterSource } from "@rnmapbox/maps";

const RainViewerLayer = ({ rainViewerTile }) => {
  console.log("RainViewerLayer Render");
  return (
    <RasterSource id="rainviewer-tile" tileUrlTemplates={[rainViewerTile]} tileSize={256}>
      <RasterLayer id="rainviewer-layer" />
    </RasterSource>
  );
};

const OpenWeatherLayer = ({ openWeatherTile }) => {
  console.log("OpenWeatherLayer Rendered");
  return (
    <RasterSource id="openweather-tile" tileUrlTemplates={[openWeatherTile]} tileSize={256}>
      <RasterLayer id="openweather-layer" />
    </RasterSource>
  );
};

// const TomorrowIOLayer = ({ tomorrowIOTile }) => {
//   return (
//     <RasterSource id="tomorrowio-tile" tileUrlTemplates={[tomorrowIOTile]} tileSize={256}>
//       <RasterLayer id="tomorrowio-layer" />
//     </RasterSource>
//   );
// };

export { RainViewerLayer, OpenWeatherLayer };
