import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";

import { icons } from "@/constants/index";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./BottomSheets";
import userPermissionStore from "@/storage/userPermissionStore";
import accessLocation from "@/utilities/accessLocation";

const label = ["hazards", "facilities"];
const icon = [icons.weatherbuttons, icons.search];

const HazardFacilitiesWidget = () => {
  // const [currentLocation, setCurrentLocation] = useState(() => {
  //   try {
  //     const location = JSON.parse(userPermissionStore.getItem("userLocation"));
  //     if (location && location.coords) {
  //       return { latitude: location.coords.latitude, longitude: location.coords.longitude };
  //     }
  //   } catch (error) {
  //     return { latitude: 10.65709, longitude: 122.948 };
  //   }
  // });

  const bottomSheetRef = useRef(null);

  const [state, setState] = useState({
    sideButtons: "none",
    facilities: "",
    hazards: "",
    bottomSheetButtons: "",
    zoom: 14,
  });

  // USECALLBACK TO AVOID RE-RENDERING OF THE COMPONENT IF THE FUNCTION IS THE SAME
  const handleMapIdle = useCallback((e) => setState((prevState) => ({ ...prevState, zoom: e.zoomLevel })), []);
  const handleButtonPress = useCallback((item) => setState((prevState) => ({ ...prevState, sideButtons: item })), []);
  const handleZoomPress = useCallback(() => {
    setState((prevState) => ({ ...prevState, sideButtons: "zoom", zoom: 14 }));
  }, []);

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

  return (
    <View className="relative flex-1">
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

      {state.sideButtons === "hazards" && <HazardSelectionBottomSheet setState={setState} />}

      {state.sideButtons === "facilities" && <FacilitiesSelectionBottomSheet setState={setState} />}
    </View>
  );
};

export default HazardFacilitiesWidget;
