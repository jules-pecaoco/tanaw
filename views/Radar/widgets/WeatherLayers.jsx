// components/RainViewerLayer.js
import React, { useMemo } from "react";
import { RasterLayer, RasterSource } from "@rnmapbox/maps";

const RainViewerLayer = ({ rainViewerTile }) => {
  return (
    <RasterSource id="rainViewerLayer" tileUrlTemplates={[rainViewerTile]} tileSize={256}>
      <RasterLayer id="rainViewerLayer"/>
    </RasterSource>
  );
};

const OpenWeatherLayer = ({ openWeatherTile }) => {
  return (
    <RasterSource id="weatherLayer" tileUrlTemplates={[openWeatherTile]} tileSize={256}>
      <RasterLayer id="weatherLayer" />
    </RasterSource>
  );
};

export { RainViewerLayer, OpenWeatherLayer };
