import { View, Text } from "react-native";
import React from "react";
import { PointAnnotation, Callout } from "@rnmapbox/maps";

const facilityColors = {
  Hospitals: "red",
  FireStations: "orange",
  EvacSites: "purple",
};

const CriticalFacilitiesMarker = ({ data, type }) => {
  if (!data || !type) return null;

  // Find the category object that matches the selected type
  const category = data.find((facility) => facility.key === type);

  // If category is not found or has no results, return null
  if (!category || !category.results || category.results.length === 0) return null;
  console.log(category.results);

  return category.results.map((facility, index) => (
    <PointAnnotation key={`${type}-${index}`} id={`${type}-${index}`} coordinate={[facility.geometry.location.lng, facility.geometry.location.lat]}>
      <Callout>
        <View style={{ padding: 5, backgroundColor: "white", borderRadius: 5 }}>
          <Text style={{ fontWeight: "bold" }}>{facility.name}</Text>
          <Text>{facility.vicinity}</Text>
        </View>
      </Callout>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: facilityColors[type] || "gray",
        }}
      />
    </PointAnnotation>
  ));
};

export default CriticalFacilitiesMarker;
