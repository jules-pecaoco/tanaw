import React, { useState, useCallback, useMemo, useRef } from "react";
import { SafeAreaView, View, TouchableOpacity, Image, Text } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, MarkerView } from "@rnmapbox/maps";

import { icons } from "@/constants/index";
import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";
import userPermissionStore from "@/context/userPermissionStore";
import HazardLayers from "./HazardLayers";
import Marker from "./FacilitiesMarker";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./BottomSheet";

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const RadarButtons = React.memo(({ onPress, icon, isActive }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
        <Image source={icon} className="size-6" tintColor={`${isActive ? "#F47C25" : "#94a3b8"}`} />
      </View>
    </TouchableOpacity>
  );
});

const label = ["hazards", "facilities"];
const icon = [icons.weatherbuttons, icons.search];

const HazardFacilitiesWidget = () => {
  const userLocation = JSON.parse(userPermissionStore.getItem("location")) || { coords: { latitude: 10.65709, longitude: 122.948 } };

  const bottomSheetRef = useRef(null);

  const [state, setState] = useState({
    sideButtons: "none",
    facilities: "",
    hazards: "",
    bottomSheetButtons: "",
    zoom: 14,
  });

  Mapbox.setTelemetryEnabled(false);


  // USECALLBACK TO AVOID RE-RENDERING OF THE COMPONENT IF THE FUNCTION IS THE SAME
  const handleMapIdle = useCallback((e) => setState((prevState) => ({ ...prevState, zoom: e.zoomLevel })), []);
  const handleButtonPress = useCallback((item) => setState((prevState) => ({ ...prevState, sideButtons: item })), []);
  const handleZoomPress = useCallback(() => setState((prevState) => ({ ...prevState, sideButtons: "zoom", zoom: 14 })), []);

  const handleSheetChanges = useCallback((index) => {
    if (index > 0) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);


  // MEMOIZ THE COMPONENT // NOT RE-RENDERING THE COMPONENT IF THE STATE([state.hazard]) IS THE SAME
  const markerCoordinates = useMemo(() => [122.948, 10.65709], []);

  const hazardLayerProps = useMemo(() => {
    if (state.hazards === "Landslide") {
      return {
        vectorID: "NegrosOccidental_LandslideHazards",
        vectorURL: "mapbox://jules-devs.7ruzm16q",
        fillLayerID: "NegrosOccidental_LandslideHazards",
        fillLayerSourceID: "NegrosOccidental_LandslideHazards",
        style: { fillColor: ["interpolate", ["linear"], ["get", "LH"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    }
    if (state.hazards === "Flood") {
      return {
        vectorID: "NegrosOccidental_Flood_100yrs",
        vectorURL: "mapbox://jules-devs.cqobnk0d",
        fillLayerID: "NegrosOccidental_Flood_100yrs",
        fillLayerSourceID: "NegrosOccidental_Flood_100yrs",
        style: { fillColor: ["interpolate", ["linear"], ["get", "Var"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    }
    if (state.hazards === "Storm Surge") {
      return {
        vectorID: "NegrosOccidental_StormSurge4",
        vectorURL: "mapbox://jules-devs.7bvixhp8",
        fillLayerID: "NegrosOccidental_Flood_100yrs",
        fillLayerSourceID: "NegrosOccidental_Flood_100yrs",
        style: { fillColor: ["interpolate", ["linear"], ["get", "HAZ"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    }
    return null;
  }, [state.hazards]);

  return (
    <SafeAreaView className="flex-1 bg-white flex justify-center items-center">
      <View className="relative h-full w-full">
        <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle} styleURL="mapbox://styles/mapbox/light-v10">
          <Camera pitch={30} zoomLevel={state.zoom} centerCoordinate={[userLocation.coords.longitude, userLocation.coords.latitude]} />
          <UserLocation visible animated />
          <Marker coordinates={markerCoordinates} onPress={openBottomSheet} facilityName="UNO-R" facilityContactInfo="09951022578" />

          {/* Hazard Layers */}
          {hazardLayerProps && <HazardLayers {...hazardLayerProps} />}
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

        {/* BOTTOM SHEET */}
        <FacilitiesMarkerBottomSheet ref={bottomSheetRef} index={0} onChange={handleSheetChanges} state={state} setState />

        {state.sideButtons === "hazards" && <HazardSelectionBottomSheet state={state} setState={setState} />}

        {state.sideButtons === "facilities" && <FacilitiesSelectionBottomSheet state={state} setState={setState} />}
      </View>
    </SafeAreaView>
  );
};

export default HazardFacilitiesWidget;
