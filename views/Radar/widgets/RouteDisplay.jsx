import React from "react";
import { View, StyleSheet } from "react-native";
import { PointAnnotation, ShapeSource, LineLayer } from "@rnmapbox/maps";

const RouteDisplay = ({ route, origin, destination, lineColor = "#3887be", lineWidth = 4 }) => {
  return (
    <>
      {/* Origin Marker */}
      {origin && (
        <PointAnnotation id="origin" coordinate={[origin.longitude, origin.latitude]}>
          <View style={styles.originMarker} />
        </PointAnnotation>
      )}

      {/* Destination Marker */}
      {destination && (
        <PointAnnotation id="destination" coordinate={[destination.longitude, destination.latitude]}>
          <View style={styles.destinationMarker} />
        </PointAnnotation>
      )}

      {/* Route Line */}
      {route && (
        <ShapeSource id="routeSource" shape={route}>
          <LineLayer
            id="routeLayer"
            style={{
              lineColor: lineColor,
              lineWidth: lineWidth,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </ShapeSource>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  originMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green",
    borderColor: "white",
    borderWidth: 2,
  },
  destinationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    borderColor: "white",
    borderWidth: 2,
  },
});

export default RouteDisplay;
