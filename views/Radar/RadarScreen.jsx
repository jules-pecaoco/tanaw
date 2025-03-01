import React, { useState, useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchNegrosWeather } from "@/services/citiesAPI";
import { fetchRainViewerData, fetchOpenWeatherData } from "@/services/weatherAPI";
import { icons } from "@/constants/index";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./widgets/BottomSheets";
import { RainViewerLayer, OpenWeatherLayer } from "./widgets/WeatherLayers";
import userPermissionStore from "@/storage/userPermissionStore";
import accessLocation from "@/utilities/accessLocation";
import HazardLayers from "./widgets/HazardLayers";
import CitiesWeatherMarker from "./widgets/CitiesWeatherMarker";
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
    weather: "",
    facilities: "",
    hazards: "",
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

  const hazardLayerProps = useMemo(() => {
    if (state.hazards === "Landslide") {
      return {
        vectorID: "NegrosIsland_LandslideHazards",
        vectorURL: "mapbox://jules-devs.9zcm6cw2",
        fillLayerID: "NegrosIsland_LandslideHazards",
        fillLayerSourceID: "landslide_hazards",
        style: { fillColor: ["interpolate", ["linear"], ["get", "LH"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    } else if (state.hazards === "Flood") {
      return {
        vectorID: "NegrosIsland_Flood_100yrs",
        vectorURL: "mapbox://jules-devs.d2mxk33n",
        fillLayerID: "NegrosIsland_Flood_100yrs",
        fillLayerSourceID: "flood_100year",
        style: { fillColor: ["interpolate", ["linear"], ["get", "Var"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    } else if (state.hazards === "Storm Surge") {
      return {
        vectorID: "NegrosIsland_StormSurge4",
        vectorURL: "mapbox://jules-devs.98uih7xf",
        fillLayerID: "NegrosIsland_StormSurge4",
        fillLayerSourceID: "storm_surge_ssa4",
        style: { fillColor: ["interpolate", ["linear"], ["get", "HAZ"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      };
    }

    return null;
  }, [state.hazards]);

  const {
    data: negrosWeather,
    isLoading: isLoadingNegrosWeather,
    error: isErrorNegrosWeather,
  } = useQuery({
    queryKey: ["negrosWeatherData"],
    queryFn: fetchNegrosWeather,
  });

  const {
    data: openWeatherTile,
    isLoading: isLoadingOpenWeatherTile,
    error: isErroropenWeatherTile,
  } = useQuery({
    queryKey: ["openWeatherTile", "temp_new"],
    queryFn: () => fetchOpenWeatherData("temp_new"),
  });

  const {
    data: rainViewerTile,
    error: isErrorrainViewerTile,
    isLoading: isLoadingrainViewerTile,
  } = useQuery({
    queryKey: ["rainViewerData"],
    queryFn: fetchRainViewerData,
  });

  return (
    <View className="relative flex-1">
      {/* BASE MAP */}
      <BaseMap state={state} openBottomSheet={openBottomSheet} handleMapIdle={handleMapIdle} currentLocation={currentLocation}>
        {/* Hazard Layers */}
        {state.hazards === "Flood" && <HazardLayers {...hazardLayerProps} />}
        {state.hazards === "Landslide" && <HazardLayers {...hazardLayerProps} />}
        {state.hazards === "Storm Surge" && <HazardLayers {...hazardLayerProps} />}

        {/* Weather Layers */}
        {state.weather === "Rain" && <RainViewerLayer rainViewerTile={rainViewerTile} />}
        {state.weather === "Heat Index" && <OpenWeatherLayer openWeatherTile={openWeatherTile} />}
        {state.weather === "Heat Index" && <CitiesWeatherMarker negrosWeather={negrosWeather} />}
      </BaseMap>

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
