import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MarkerView } from "@rnmapbox/maps";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchFacilityById } from "@/services/criticalFacilitiesAPI";

const facilityColors = {
  Hospitals: "pink",
  FireStations: "red",
  EvacSites: "brown",
};

const FacilityMarker = ({ facility, type, setFacilitiesInformation, onPress }) => {
  const queryClient = useQueryClient();
  const { data: facilityData, isLoading } = useQuery({
    queryKey: [type, facility.place_id],
    queryFn: () => fetchFacilityById(facility.place_id),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
  });

  const handlePress = () => {
    if (facilityData) {
      const contact = facilityData.formatted_phone_number ?? "None";
      setFacilitiesInformation({
        facilityName: facilityData.name,
        facilityContact: contact,
      });
      onPress();
    } else {
      queryClient
        .fetchQuery({
          queryKey: [type, facility.place_id],
          queryFn: () => fetchFacilityById(facility.place_id),
        })
        .then((facilityData) => {
          const contact = facilityData.formatted_phone_number ?? "None";
          setFacilitiesInformation({
            facilityName: facilityData.name,
            facilityContact: contact,
          });
          onPress();
        });
    }
  };

  return (
    <MarkerView id={`${type}-${facility.place_id}`} coordinate={[facility.geometry.location.lng, facility.geometry.location.lat]}>
      <TouchableOpacity onPress={handlePress}>
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
};

const CriticalFacilitiesMarker = ({ data, type, setFacilitiesInformation, onPress }) => {
  if (!data || !type || !data[type]) return null;

  const facilities = data[type];

  if (!Array.isArray(facilities) || facilities.length === 0) return null;

  return facilities.map((facility) => (
    <FacilityMarker
      key={`${type}-${facility.place_id || facility.id || Math.random().toString()}`}
      facility={facility}
      type={type}
      setFacilitiesInformation={setFacilitiesInformation}
      onPress={onPress}
    />
  ));
};

export default CriticalFacilitiesMarker;
