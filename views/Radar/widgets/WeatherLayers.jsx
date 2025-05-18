import { RasterLayer, RasterSource } from "@rnmapbox/maps";

const RainViewerLayer = ({ rainViewerPath }) => {
  console.log("RainViewerLayer Rendered", rainViewerPath);
  const pathHash = rainViewerPath ? rainViewerPath.split("/").slice(-7, -4).join("_") : "default";

  return (
    <RasterSource id={`rainviewer-tile-${pathHash}`} tileUrlTemplates={[rainViewerPath]} tileSize={256}>
      <RasterLayer id={`rainviewer-layer-${pathHash}`} />
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

export { RainViewerLayer, OpenWeatherLayer };
