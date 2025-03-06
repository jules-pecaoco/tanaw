import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { fetchAllFacilities, fetchCriticalFacilitiesInformmation } from "@/services/criticalFacilitiesAPI";
import { fetchNegrosWeather } from "@/services/citiesWeatherAPI";
import { fetchRainViewerData, fetchOpenWeatherData } from "@/services/weatherLayerAPI";
import { icons } from "@/constants/index";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./widgets/BottomSheets";
import { RainViewerLayer, OpenWeatherLayer } from "./widgets/WeatherLayers";
import HazardLayers from "./widgets/HazardLayers";
import CitiesWeatherMarker from "./widgets/CitiesWeatherMarker";
import SideButtons from "./widgets/SideButtons";
import BaseMap from "./widgets/BaseMap";
import accessLocation from "@/utilities/accessLocation";
import CriticalFacilitiesMarker from "./widgets/CriticalFacilitiesMarker";

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
  console.log("RadarScreen");
  const {
    data: userLocation,
    refetch: getUserLocation,
    isLoading,
  } = useQuery({
    queryKey: ["userLocation"],
    queryFn: accessLocation,
    enabled: false,
  });

  const [currentLocation, setCurrentLocation] = useState(() => {
    if (userLocation && userLocation.coords) {
      return { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude };
    } else return { latitude: 10.65709, longitude: 122.948 };
  }, [userLocation]);

  // GLOBAL STATE FOR RADAR
  const [state, setState] = useState({
    activeBottomSheet: "none",
    isHazardLayerActive: {
      renderOnce: true,
      Flood: false,
      Landslide: false,
      StormSurge: false,
    },
    weatherLayer: {
      type: "none",
    },
    isFacilitiesLayerActive: {
      Hospitals: false,
      FireStations: false,
      EvacSites: false,
    },
  });

  const [facilitiesInformation, setFacilitiesInformation] = useState({
    facilityName: "",
    facilityContact: "",
  });

  const handleActiveBottomSheet = useCallback((item) => {
    setState((prevState) => ({ ...prevState, activeBottomSheet: item }));
  }, []);

  // REFERENCE TO MABOX CAMERA
  const cameraRef = useRef(null);

  const handleZoomButton = useCallback(
    (item) => {
      cameraRef.current?.setCamera({
        zoomLevel: 12,
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        animationDuration: 1000,
        pitch: 30,
        heading: 0,
      });

      setState((prevState) => ({
        ...prevState,
        activeBottomSheet: item,
      }));
      getUserLocation();
    },
    [currentLocation]
  );

  // REFERENCE TO BOTTOM SHEET
  const bottomSheetRef = useRef(null);

  const handleSheetChanges = useCallback((index) => {
    if (index > 0) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  // HAZARD LAYER PROPS/PARAMETERS
  const hazardLayerProps = useMemo(() => {
    return {
      Landslide: {
        id: "NegrosIsland_LandslideHazards",
        vectorURL: "mapbox://jules-devs.9zcm6cw2",
        fillLayerSourceID: "landslide_hazards",
        style: { fillColor: ["interpolate", ["linear"], ["get", "LH"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      },
      Flood: {
        id: "NegrosIsland_Flood_100yrs",
        vectorURL: "mapbox://jules-devs.d2mxk33n",
        fillLayerSourceID: "flood_100year",
        style: { fillColor: ["interpolate", ["linear"], ["get", "Var"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      },
      StormSurge: {
        id: "NegrosIsland_StormSurge4",
        vectorURL: "mapbox://jules-devs.98uih7xf",
        fillLayerSourceID: "storm_surge_ssa4",
        style: { fillColor: ["interpolate", ["linear"], ["get", "HAZ"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"], fillOpacity: 0.8 },
      },
    };
  }, [state.isHazardLayerActive.renderOnce]);

  // QUERIES
  const {
    data: negrosWeather,
    isLoading: isLoadingNegrosWeather,
    error: isErrorNegrosWeather,
  } = useQuery({
    queryKey: ["negrosWeatherData"],
    queryFn: fetchNegrosWeather,
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const {
    data: openWeatherTile,
    isLoading: isLoadingOpenWeatherTile,
    error: isErroropenWeatherTile,
  } = useQuery({
    queryKey: ["openWeatherTile"],
    queryFn: () => fetchOpenWeatherData("temp_new"),
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 3,
    persist: false,
  });

  const {
    data: rainViewerTile,
    error: isErrorrainViewerTile,
    isLoading: isLoadingrainViewerTile,
  } = useQuery({
    queryKey: ["rainViewerData"],
    queryFn: fetchRainViewerData,
    gcTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 30,
    persist: false,
  });

  const {
    data: criticalFacilities,
    isLoading: isLoadingCriticalFacilities,
    error: isErrorCriticalFacilities,
  } = useQuery({
    queryKey: ["criticalFacilities", currentLocation],
    queryFn: () => fetchAllFacilities({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const rainViewerMemoized = useMemo(() => {
    return <RainViewerLayer rainViewerTile={rainViewerTile} />;
  }, [rainViewerTile]);

  const openWeatherMemoized = useMemo(() => {
    return <OpenWeatherLayer openWeatherTile={openWeatherTile} />;
  }, [openWeatherTile]);

  const negrosWeatherMemoized = useMemo(() => {
    return <CitiesWeatherMarker negrosWeather={negrosWeather} />;
  }, [negrosWeather]);


  return (
    <View className="relative flex-1">
      {/* BASE MAP */}
      <BaseMap openBottomSheet={openBottomSheet} currentLocation={currentLocation} ref={cameraRef}>
        {/* Hazard Layers */}
        {state.isHazardLayerActive["Flood"] && <HazardLayers props={hazardLayerProps.Flood} />}
        {state.isHazardLayerActive["Landslide"] && <HazardLayers props={hazardLayerProps.Landslide} />}
        {state.isHazardLayerActive["StormSurge"] && <HazardLayers props={hazardLayerProps.StormSurge} />}
        {/* Weather Layers */}
        {state.weatherLayer.type === "Rain" && rainViewerMemoized}
        {state.weatherLayer.type === "HeatIndex" && openWeatherMemoized}
        {state.weatherLayer.type === "HeatIndex" && negrosWeatherMemoized}

        {state.isFacilitiesLayerActive["Hospitals"] && (
          <CriticalFacilitiesMarker
            data={criticalFacilities}
            type={"Hospitals"}
            onPress={openBottomSheet}
            setFacilitiesInformation={setFacilitiesInformation}
          />
        )}
        {state.isFacilitiesLayerActive["FireStations"] && (
          <CriticalFacilitiesMarker
            data={criticalFacilities}
            type={"FireStations"}
            onPress={openBottomSheet}
            setFacilitiesInformation={setFacilitiesInformation}
          />
        )}
        {state.isFacilitiesLayerActive["EvacSites"] && (
          <CriticalFacilitiesMarker
            data={criticalFacilities}
            type={"EvacSites"}
            onPress={openBottomSheet}
            setFacilitiesInformation={setFacilitiesInformation}
          />
        )}
        {/* <FacilitiesMarker coordinates={markerCoordinates} onPress={openBottomSheet} facilityName="UNO-R" facilityContactInfo="09951022578" /> */}
      </BaseMap>

      {/* SIDE BUTTONS */}
      <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
        <SideButtons
          onPress={() => handleActiveBottomSheet("hazards")}
          icon={icons.weatherbuttons}
          isActive={state.activeBottomSheet === "hazards"}
        />
        <SideButtons onPress={() => handleActiveBottomSheet("facilities")} icon={icons.search} isActive={state.activeBottomSheet === "facilities"} />
        <SideButtons onPress={() => handleZoomButton("zoom")} icon={icons.locationpinning} isActive={state.activeBottomSheet === "zoom"} />
      </View>

      {/* BOTTOM SHEET */}
      <FacilitiesMarkerBottomSheet ref={bottomSheetRef} handleSheetChanges={handleSheetChanges} openBottomSheet={openBottomSheet} data={facilitiesInformation} />

      {state.activeBottomSheet === "hazards" && <HazardSelectionBottomSheet state={state} setState={setState} />}
      {state.activeBottomSheet === "facilities" && <FacilitiesSelectionBottomSheet state={state} setState={setState} />}
    </View>
  );
};

export default RadarScreen;
