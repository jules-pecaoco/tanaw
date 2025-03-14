import { TouchableOpacity, View } from "react-native";
import React from "react";
import { MarkerView, PointAnnotation } from "@rnmapbox/maps";
import { useQueryClient } from "@tanstack/react-query";

import { fetchGoogleFacilityById } from "@/services/criticalFacilitiesAPI";

const facilityColors = {
  Hospitals: "pink",
  FireStations: "red",
  EvacSites: "brown",
};

const FacilityMarker = ({ facility, type, setFacilitiesInformation, onPress, source }) => {
  if (!facility.id) return null;
  const queryClient = useQueryClient();

  const handlePress = async () => {
    onPress();

    if (source === "OpenStreet") {
      setFacilitiesInformation({
        facilityName: facility.name,
        facilityContact: facility.phone,
      });
      return;
    } else {
      const cachedData = queryClient.getQueryData([type, facility.id]);

      if (cachedData) {
        setFacilitiesInformation({
          facilityName: cachedData.name,
          facilityContact: cachedData.phone,
        });
      } else {
        try {
          const facilityData = await queryClient.fetchQuery({
            queryKey: [type, facility.id],
            queryFn: () => fetchGoogleFacilityById(facility.id),
            gcTime: 0,
            staleTime: 0,
          });

          setFacilitiesInformation({
            facilityName: facilityData.name,
            facilityContact: facilityData.phone ?? "None",
          });
        } catch (error) {
          console.error("Error fetching facility details:", error);
        }
      }
    }
  };

  return (
    <MarkerView id={`${type}-${facility.id}`} coordinate={[facility.location.longitude, facility.location.latitude]}>
      <TouchableOpacity onPress={handlePress}>
        <View className={`p-3 rounded-full `} style={{ backgroundColor: facilityColors[type] || "gray" }}></View>
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
