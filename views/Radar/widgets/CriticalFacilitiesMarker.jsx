import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MarkerView } from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";

import { fetchFacilityById } from "@/services/criticalFacilitiesAPI";

const facilityColors = {
  Hospitals: "pink",
  FireStations: "red",
  EvacSites: "brown",
};

const CriticalFacilitiesMarker = ({ data, type, setFacilitiesInformation, onPress }) => {
  console.log(data)
  if (!data || !type || !data[type]) return null;

  const facilities = data[type];

  if (!Array.isArray(facilities) || facilities.length === 0) return null;

  return facilities.map((facility, index) => {
    console.log(facility);
    const onPressed = async () => {
      const facilityData = await fetchFacilityById(facility.place_id);
      const contact = facilityData.formatted_phone_number ?? "None";
      setFacilitiesInformation({ facilityName: facilityData.name, facilityContact: contact });
      onPress();
    };
    return (
      <MarkerView key={`${type}-${index}`} id={`${type}-${index}`} coordinate={[facility.geometry.location.lng, facility.geometry.location.lat]}>
        <TouchableOpacity onPress={onPressed}>
          <View
            className="rounded-lg p-1"
            style={{
              backgroundColor: facilityColors[type] || "gray",
            }}
          >
            <Text className="font-rmedium text-white">{facility.name}</Text>
          </View>
        </TouchableOpacity>
      </MarkerView>
    );
  });
};

export default CriticalFacilitiesMarker;
