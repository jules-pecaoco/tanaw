import React from "react";
import { View } from "react-native";
import { PointAnnotation } from "@rnmapbox/maps";
import { MaterialIcons } from "@expo/vector-icons";

const hazardIcons = {
  flood: {
    icon: <MaterialIcons name="flood" size={30} color="#2196F3" />,
    color: "#2196F3",
  },
  fire: {
    icon: <MaterialIcons name="local-fire-department" size={30} color="#FF5722" />,
    color: "#FF5722",
  },
  storm: {
    icon: <MaterialIcons name="thunderstorm" size={30} color="#9C27B0" />,
    color: "#9C27B0",
  },
  landslide: {
    icon: <MaterialIcons name="landslide" size={30} color="#795548" />,
    color: "#795548",
  },
  earthquake: {
    icon: <MaterialIcons name="landslide" size={30} color="#607D8B" />,
    color: "#607D8B",
  },
  other: {
    icon: <MaterialIcons name="warning" size={30} color="#FF9800" />,
    color: "#FF9800",
  },
};

const HazardMarker = ({ report, onPress }) => {
  // Get appropriate icon based on hazard type
  const getMarkerIcon = () => {
    // Default to 'other' if hazard type is not found
    const hazardType = report.hazard_type?.toLowerCase() || "other";
    return hazardIcons[hazardType] || hazardIcons.other;
  };

  const markerIcon = getMarkerIcon();

  return (
    <PointAnnotation id={`marker-${report.id}`} coordinate={[report.longitude, report.latitude]} onSelected={() => onPress(report)}>
      {markerIcon.icon}
    </PointAnnotation>
  );
};

export default HazardMarker;
