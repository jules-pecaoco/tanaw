import React from "react";
import { Image } from "react-native";
import { PointAnnotation } from "@rnmapbox/maps";

const markerIcons = {
  flood: require("@/assets/icons/evacuationsites.png"),
};

const HazardMarker = ({ report, onPress }) => {
  // Get appropriate icon based on hazard type
  const getMarkerIcon = () => {
    return markerIcons["flood"];
  };

  return (
    <PointAnnotation id={`marker-${report.id}`} coordinate={[report.longitude, report.latitude]} onSelected={() => onPress(report)}>
      <Image source={getMarkerIcon()} style={{ width: 30, height: 30 }} resizeMode="contain" />
    </PointAnnotation>
  );
};

export default HazardMarker;
