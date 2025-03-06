import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MarkerView } from "@rnmapbox/maps";

const facilityColors = {
  Hospitals: "red",
  FireStations: "orange",
  EvacSites: "purple",
};

const CriticalFacilitiesMarker = ({ data, type, setFacilitiesInformation, onPress }) => {
  if (!data || !type || !data[type]) return null;

  const facilities = data[type];

  if (!Array.isArray(facilities) || facilities.length === 0) return null;

  return facilities.map((facility, index) => {
    const onPressed = () => {
      setFacilitiesInformation({ facilityName: facility.name, facilityContact: facility.details.formatted_phone_number });
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
