// components/RainViewerLayer.js
import React, { useMemo } from "react";
import { RasterLayer, RasterSource } from "@rnmapbox/maps";

const RainViewerLayer = ({rainViewerData}) => {
  const tileUrlTemplate = useMemo(() => {
    if (!rainViewerData) return null;
    const host = rainViewerData.host;
    const radarFrames = rainViewerData.radar.past;
    const latestFrame = radarFrames[radarFrames.length - 1];
    const path = latestFrame.path;
    return `${host}${path}/512/{z}/{x}/{y}/2/1_1.png`;
  }, [rainViewerData]);

  return (
    <RasterSource id="rainViewerLayer" tileUrlTemplates={[tileUrlTemplate]} tileSize={512}>
      <RasterLayer id="rainViewerLayer" aboveLayerID="landslide_hazards"/>
    </RasterSource>
  );
};

const OpenWeatherLayer = ({ openWeatherTile }) => {
  return (
    <RasterSource id="weatherLayer" tileUrlTemplates={[openWeatherTile]} tileSize={512}>
      <RasterLayer id="weatherLayer" aboveLayerID="landslide_hazards"/>
    </RasterSource>
  );
};

export { RainViewerLayer, OpenWeatherLayer };
