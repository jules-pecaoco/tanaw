import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { PointAnnotation, Callout, MarkerView } from "@rnmapbox/maps";

const facilityColors = {
  Hospitals: "red",
  FireStations: "orange",
  EvacSites: "purple",
};

const CriticalFacilitiesMarker = ({ data, type, onPress }) => {
  if (!data || !type || !data[type]) return null;

  const facilities = data[type];

  if (!Array.isArray(facilities) || facilities.length === 0) return null;

  return facilities.map((facility, index) => {

    console.log(facility.name)
    return (
      <MarkerView key={`${type}-${index}`} id={`${type}-${index}`} coordinate={[facility.geometry.location.lng, facility.geometry.location.lat]}>
      <TouchableOpacity onPress={onPress}>
        <View
          className="rounded-lg p-1"
          style={{
            backgroundColor: facilityColors[type] || "gray",
          }}
        >
          <Text className="font-rmedium text-slate-200">{facility.name}</Text>
        </View>
      </TouchableOpacity>
    </MarkerView>
    )
  });
};

export default CriticalFacilitiesMarker;
