import React, { useState, useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { icons } from "@/constants/index";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./widgets/BottomSheets";
import userPermissionStore from "@/context/userPermissionStore";
import accessLocation from "@/utilities/accessLocation";
import SideButtons from "./widgets/SideButtons";
import BaseMap from "./widgets/BaseMap";

// REFER TO BaseMap for Map Rendering
// BottomSheets includes a BottomSheet Library by Gorhom

// This is the main Radar Screen, it compiles all the widgets BaseMap, SideButtons, Bottomsheets, etc.
// It also handles the state of the SideButtons and BottomSheets
// It also handles the current location of the user
// It also handles the zoom level of the map

// FUTURE IMPROVEMENTS:
// - Add a search bar for the user to search a location
// - Add color coding for the markers, and hazards
// - Add a legend for the color coding
// - If React 19 in Expo is stable, remove callbacks and memoization

const RadarScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const location = JSON.parse(userPermissionStore.getItem("userLocation"));
      if (location && location.coords) {
        return { latitude: location.coords.latitude, longitude: location.coords.longitude };
      }
    } catch (error) {
      return { latitude: 10.65709, longitude: 122.948 };
    }
  });

  const [state, setState] = useState({
    sideButtons: "none",
    facilities: "",
    hazards: "",
    bottomSheetButtons: "",
    zoom: 14,
  });

  const handleMapIdle = useCallback((e) => setState((prevState) => ({ ...prevState, zoom: e.zoomLevel })), []);
  const handleSideButtonPress = useCallback((item) => setState((prevState) => ({ ...prevState, sideButtons: item })), []);
  const handleZoomPress = useCallback(() => {
    setState((prevState) => ({ ...prevState, sideButtons: "zoom", zoom: 14 }));
  }, []);

  const bottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback((index) => {
    if (index > 0) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const markerCoordinates = useMemo(() => [122.948, 10.65709], []);

  return (
    <View className="relative flex-1">
      {/* BASE MAP */}
      <BaseMap
        state={state}
        openBottomSheet={openBottomSheet}
        markerCoordinates={markerCoordinates}
        handleMapIdle={handleMapIdle}
        currentLocation={currentLocation}
      />

      {/* SIDE BUTTONS */}
      <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
        <SideButtons onPress={() => handleSideButtonPress("hazards")} icon={icons.weatherbuttons} isActive={state.sideButtons === "hazards"} />
        <SideButtons onPress={() => handleSideButtonPress("facilities")} icon={icons.search} isActive={state.sideButtons === "facilities"} />
        <SideButtons onPress={handleZoomPress} icon={icons.locationpinning} isActive={state.sideButtons === "zoom"} />
      </View>

      {/* BOTTOM SHEET */}
      <FacilitiesMarkerBottomSheet ref={bottomSheetRef} index={0} onChange={handleSheetChanges} state={state} setState />

      {state.sideButtons === "hazards" && <HazardSelectionBottomSheet state={state} setState={setState} />}

      {state.sideButtons === "facilities" && <FacilitiesSelectionBottomSheet state={state} setState={setState} />}
    </View>
  );
};

export default RadarScreen;
