import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView, View, TouchableOpacity, Image } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, MarkerView } from "@rnmapbox/maps";

import { icons } from "@/constants/index";
import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";
import { EmergencyBottomSheet, HazardBottomSheet } from "@/views/Radar/widgets/BottomSheet";
import userPermissionStore from "@/context/userPermissionStore";
import HazardLayers from "./HazardLayers";

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const Marker = React.memo(({ coordinates, facilityName, facilityContactInfo }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <MarkerView coordinate={coordinates}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setShowInfo(!showInfo)}>
        <View className="flex flex-col items-center gap-2">
          {!showInfo && <View className="bg-primary size-10 rounded-full" />}
          {showInfo && (
            <View className="bg-white p-2 rounded-lg">
              <Text className="text-black">{facilityName}</Text>
              <Text className="text-black">{facilityContactInfo}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </MarkerView>
  );
});

const RadarButtons = React.memo(({ onPress, icon, isActive }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
        <Image source={icon} className="size-6" tintColor={`${isActive ? "#F47C25" : "#94a3b8"}`} />
      </View>
    </TouchableOpacity>
  );
});

const HazardFacilitiesWidget = () => {
  const userLocation = JSON.parse(userPermissionStore.getItem("location")) || { coords: { latitude: 10.65709, longitude: 122.948 } };

  const [state, setState] = useState({
    sideButtons: "none",
    facilities: "",
    hazards: "",
    bottomSheetButtons: "",
    zoom: 14,
  });

  const label = ["hazards", "facilities"];
  const icon = [icons.weatherbuttons, icons.search];

  Mapbox.setTelemetryEnabled(false);

  const handleMapIdle = useCallback((e) => setState((prevState) => ({ ...prevState, zoom: e.zoomLevel })), []);
  const handleButtonPress = useCallback((item) => setState((prevState) => ({ ...prevState, sideButtons: item })), []);
  const handleZoomPress = useCallback(() => setState((prevState) => ({ ...prevState, sideButtons: "zoom" })), []);

  const EmergencySheet = useMemo(() => <EmergencyBottomSheet state={state} setState={setState} />, [state]);
  const HazardSheet = useMemo(() => <HazardBottomSheet state={state} setState={setState} />, [state]);
  const markerCoordinates = useMemo(() => [122.948, 10.65709], []);

  return (
    <SafeAreaView className="flex-1 bg-white flex justify-center items-center">
      <View className="relative h-full w-full">
        <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle} styleURL="mapbox://styles/mapbox/light-v10">
          <Camera pitch={30} zoomLevel={state.zoom} centerCoordinate={[userLocation.coords.longitude, userLocation.coords.latitude]} />
          <Marker coordinates={markerCoordinates} facilityName="UNO-R" facilityContactInfo="09951022578" />
          <UserLocation visible animated />

          {/* Landslide */}
          {state.hazards === "Landslide" && (
            <HazardLayers
              vectorID="NegrosOccidental_LandslideHazards"
              vectorURL="mapbox://jules-devs.7ruzm16q"
              fillLayerID="NegrosOccidental_LandslideHazards"
              fillLayerSourceID="NegrosOccidental_LandslideHazards"
              style={{
                fillColor: ["interpolate", ["linear"], ["get", "LH"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"],
                fillOpacity: 0.8,
              }}
            />
          )}

          {/* Flood Layers */}
          {state.hazards === "Flood" && (
            <HazardLayers
              vectorID="NegrosOccidental_Flood_100yrs"
              vectorURL="mapbox://jules-devs.cqobnk0d"
              fillLayerID="NegrosOccidental_Flood_100yrs"
              fillLayerSourceID="NegrosOccidental_Flood_100yrs"
              style={{
                fillColor: ["interpolate", ["linear"], ["get", "Var"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"],
                fillOpacity: 0.8,
              }}
            />
          )}

          {/* Storm Surge Layers */}
          {state.hazards === "Storm Surge" && (
            <HazardLayers
              vectorID="NegrosOccidental_StormSurge4"
              vectorURL="mapbox://jules-devs.7bvixhp8"
              fillLayerID="NegrosOccidental_StormSurge4"
              fillLayerSourceID="NegrosOccidental_StormSurge4"
              style={{
                fillColor: ["interpolate", ["linear"], ["get", "HAZ"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"],
                fillOpacity: 0.8,
              }}
            />
          )}
        </MapView>

        {/* SIDE BUTTONS */}
        <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
          {label.map((item, index) => (
            <RadarButtons key={index} onPress={() => handleButtonPress(item)} icon={icon[index]} isActive={state.sideButtons === item} />
          ))}
          <TouchableOpacity activeOpacity={0.7} onPress={handleZoomPress}>
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.locationpinning} className="size-6" tintColor={`${state.sideButtons === "zoom" ? "#F47C25" : "#94a3b8"}`} />
            </View>
          </TouchableOpacity>
        </View>

        {/*FACILITY BOTTOM SHEET */}
        {state.sideButtons === "facilities" && EmergencySheet}
        {/*HAZARD BOTTOM SHEET */}
        {state.sideButtons === "hazards" && HazardSheet}
      </View>
    </SafeAreaView>
  );
};

export default HazardFacilitiesWidget;
