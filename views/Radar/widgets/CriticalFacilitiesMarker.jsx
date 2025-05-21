import { TouchableOpacity, View } from "react-native";
import React from "react";
import { MarkerView, PointAnnotation } from "@rnmapbox/maps";
import { useQueryClient } from "@tanstack/react-query";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { fetchGoogleFacilityById } from "@/services/google";

const facilityColors = {
  Hospitals: "#333dff",
  FireStations: "#ff4e33",
  EvacSites: "#754406",
};

const FacilityMarker = ({ facility, type, setFacilitiesInformation, onPress, source }) => {
  if (!facility.id) return null;
  const queryClient = useQueryClient();

  const handlePress = async () => {
    onPress();

    if (source === "OpenStreet") {
      setFacilitiesInformation(facility);
      return;
    } else {
      const cachedData = queryClient.getQueryData([type, facility.id]);

      if (cachedData) {
        setFacilitiesInformation(cachedData);
      } else {
        try {
          const facilityData = await queryClient.fetchQuery({
            queryKey: [type, facility.id],
            queryFn: () => fetchGoogleFacilityById(facility.id),
            gcTime: 0,
            staleTime: 0,
          });

          setFacilitiesInformation(facilityData);
        } catch (error) {
          console.error("Error fetching facility details:", error);
        }
      }
    }
  };

  const facilityIcon = type === "Hospitals" ? "local-hospital" : type === "FireStations" ? "fire-truck" : "night-shelter";
  return (
    <MarkerView id={`${type}-${facility.id}`} coordinate={[facility.location.longitude, facility.location.latitude]}>
      <TouchableOpacity onPress={handlePress}>
        <MaterialIcons name={facilityIcon} size={30} color={facilityColors[type]} />
      </TouchableOpacity>
    </MarkerView>
  );
};

const CriticalFacilitiesMarker = ({ data, type, setFacilitiesInformation, onPress, source }) => {
  if (!data || !type || !data[type]) return null;

  const facilities = data[type];

  if (!Array.isArray(facilities) || facilities.length === 0) return null;

  return facilities.map((facility) => (
    <FacilityMarker
      key={`${type}-${Math.random()}`}
      facility={facility}
      type={type}
      setFacilitiesInformation={setFacilitiesInformation}
      onPress={onPress}
      source={source}
    />
  ));
};

export default CriticalFacilitiesMarker;
