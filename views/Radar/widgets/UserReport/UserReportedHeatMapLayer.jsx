import React from "react";
import { ShapeSource, HeatmapLayer } from "@rnmapbox/maps";

const HeatMapLayer = ({ data }) => {
  // Convert data for Mapbox heatmap
  const featureCollection = {
    type: "FeatureCollection",
    features: data.map((point) => ({
      type: "Feature",
      properties: {
        weight: point.weight || 1,
      },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })),
  };

  return (
    <>
      <ShapeSource id="heatmapSource" shape={featureCollection}>
        <HeatmapLayer
          id="heatmapLayer"
          sourceID="heatmapSource"
          style={{
            heatmapWeight: ["get", "weight"],
            heatmapIntensity: 0.5,
            heatmapRadius: 20,
            heatmapOpacity: 0.8,
            heatmapColorStops: [
              [0, "rgba(0, 0, 255, 0)"],
              [0.2, "rgba(0, 0, 255, 0.5)"],
              [0.4, "rgba(0, 255, 255, 0.7)"],
              [0.6, "rgba(0, 255, 0, 0.7)"],
              [0.8, "rgba(255, 255, 0, 0.8)"],
              [1.0, "rgba(255, 0, 0, 1)"],
            ],
          }}
        />
      </ShapeSource>
    </>
  );
};

export default HeatMapLayer;
