import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { PointAnnotation } from "@rnmapbox/maps";

import { fetchGoogleFacilitiesByType, fetchOpenStreetFacilitiesByType } from "@/services/criticalFacilitiesAPI";
import { fetchNegrosWeather } from "@/services/citiesWeatherAPI";
import { fetchRainViewerData, fetchOpenWeatherData } from "@/services/weatherLayerAPI";
import { FacilitiesSelectionBottomSheet, HazardSelectionBottomSheet, FacilitiesMarkerBottomSheet } from "./widgets/BottomSheets";
import { RainViewerLayer, OpenWeatherLayer } from "./widgets/WeatherLayers";
import HazardLayers from "./widgets/HazardLayers";
import CitiesWeatherMarker from "./widgets/CitiesWeatherMarker";
import SideButtons from "./widgets/SideButtons";
import BaseMap from "./widgets/BaseMap";
import CriticalFacilitiesMarker from "./widgets/CriticalFacilitiesMarker";
import SearchCity from "./widgets/SearchCity";
import HazardMarker from "./widgets/UserReport/UserReportedHazardMarker";
import HeatMapLayer from "./widgets/UserReport/UserReportedHeatMapLayer";
import useHazardReports from "@/hooks/useHazardReports";
import useLocation from "@/hooks/useLocation";

const RadarScreen = () => {
  // Use the location hook
  const { location, loading, getLocation } = useLocation();

  console.log("Location: ", location);
  // Default to Bacolod coordinates if user location not available
  const [currentLocation, setCurrentLocation] = useState(() => {
    if (location) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return { latitude: 10.65709, longitude: 122.948 };
  });

  // Global state for radar features
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
      source: "OpenStreet",
      Hospitals: false,
      FireStations: false,
      EvacSites: false,
    },
  });

  const [facilitiesInformation, setFacilitiesInformation] = useState({
    facilityName: "",
    facilityContact: "",
  });

  const [searchCityDetails, setSearchCityDetails] = useState({
    latitude: "",
    longitude: "",
  });

  const { reports, isLoading, getHeatmapData } = useHazardReports();

  const [showHeatmap, setShowHeatmap] = useState(false);

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  const cameraRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Callback functions
  const handleActiveBottomSheet = useCallback((item) => {
    setState((prevState) => ({ ...prevState, activeBottomSheet: item }));
  }, []);

  const handleZoomButton = useCallback(async () => {
    cameraRef.current?.setCamera({
      zoomLevel: 14,
      centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
      animationDuration: 1000,
      pitch: 30,
      heading: 0,
    });

    setState((prevState) => ({
      ...prevState,
      activeBottomSheet: "zoom",
    }));

    await getLocation();
  }, [currentLocation]);

  const handleSearchZoom = useCallback(
    (longitude, latitude) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [longitude, latitude],
        animationDuration: 1000,
        pitch: 30,
        heading: 0,
      });
    },
    [searchCityDetails]
  );

  const handleSheetChanges = useCallback((index) => {
    if (index > 0) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  // Handle changing the data source
  const handleSourceChange = useCallback((newSource) => {
    setState((prevState) => ({
      ...prevState,
      isFacilitiesLayerActive: {
        ...prevState.isFacilitiesLayerActive,
        source: newSource,
      },
    }));
  }, []);

  // Hazard layer configuration
  const hazardLayerProps = useMemo(
    () => ({
      Landslide: {
        id: "NegrosIsland_LandslideHazards",
        vectorURL: "mapbox://jules-devs.9zcm6cw2",
        fillLayerSourceID: "landslide_hazards",
        style: {
          fillColor: ["interpolate", ["linear"], ["get", "LH"], 1, "#FFFF00", 2, "#FFA500", 3, "#FF4500"],
          fillOpacity: 0.8,
        },
      },
      Flood: {
        id: "NegrosIsland_Flood_100yrs",
        vectorURL: "mapbox://jules-devs.d2mxk33n",
        fillLayerSourceID: "flood_100year",
        style: {
          fillColor: ["interpolate", ["linear"], ["get", "Var"], 1, "#b047ff", 2, "#5a00ff", 3, "#002474"],
          fillOpacity: 0.8,
        },
      },
      StormSurge: {
        id: "NegrosIsland_StormSurge4",
        vectorURL: "mapbox://jules-devs.98uih7xf",
        fillLayerSourceID: "storm_surge_ssa4",
        style: {
          fillColor: ["interpolate", ["linear"], ["get", "HAZ"], 1, "#e3d1ff", 2, "#b047ff", 3, "#5a00ff"],
          fillOpacity: 0.8,
        },
      },
    }),
    [state.isHazardLayerActive.renderOnce]
  );

  // Data queries
  const { data: negrosWeather } = useQuery({
    queryKey: ["negrosWeatherData"],
    queryFn: fetchNegrosWeather,
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 2,
  });

  const { data: openWeatherTile } = useQuery({
    queryKey: ["openWeatherTile"],
    queryFn: () => fetchOpenWeatherData("temp_new"),
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 3,
  });

  const { data: rainViewerTile } = useQuery({
    queryKey: ["rainViewerData"],
    queryFn: fetchRainViewerData,
    gcTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 60,
  });

  // Only fetch Google facilities when Google is selected as the source
  const { data: googleFacilitiesByType } = useQuery({
    queryKey: ["GoogleFacilitiesByType"],
    queryFn: () => fetchGoogleFacilitiesByType({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 12,
    enabled: state.isFacilitiesLayerActive.source === "Google Places",
  });

  const { data: openStreetFacilitiesByType } = useQuery({
    queryKey: ["OpenStreetFacilitiesByType"],
    queryFn: () => fetchOpenStreetFacilitiesByType({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 12,
  });

  // Memoized components
  const negrosWeatherMemoized = useMemo(() => <CitiesWeatherMarker negrosWeather={negrosWeather} />, [negrosWeather]);

  const renderFacilityMarker = useMemo(() => {
    return (type) => {
      if (!state.isFacilitiesLayerActive[type]) return null;

      const facilityData = state.isFacilitiesLayerActive.source === "OpenStreet" ? openStreetFacilitiesByType : googleFacilitiesByType;

      if (!facilityData) return null;

      return (
        <CriticalFacilitiesMarker
          data={facilityData}
          type={type}
          onPress={openBottomSheet}
          setFacilitiesInformation={setFacilitiesInformation}
          source={state.isFacilitiesLayerActive.source}
        />
      );
    };
  }, [state.isFacilitiesLayerActive]);

  if (!location) {
    return <View>Loading...</View>;
  }

  return (
    <View className="relative flex-1">
      {/* SEARCH */}
      {state.activeBottomSheet === "search" && (
        <View className="absolute top-10 left-5 right-0 z-10 w-[90%]">
          <SearchCity currentLocation={currentLocation} setSearchCityDetails={setSearchCityDetails} handleSearchZoom={handleSearchZoom} />
        </View>
      )}

      {/* BASE MAP */}
      <BaseMap openBottomSheet={openBottomSheet} currentLocation={currentLocation} ref={cameraRef}>
        {/* Hazard Layers */}
        {state.isHazardLayerActive.Flood && <HazardLayers props={hazardLayerProps.Flood} />}
        {state.isHazardLayerActive.Landslide && <HazardLayers props={hazardLayerProps.Landslide} />}
        {state.isHazardLayerActive.StormSurge && <HazardLayers props={hazardLayerProps.StormSurge} />}

        {/* Weather Layers */}
        {state.weatherLayer.type === "Rain" && <RainViewerLayer rainViewerTile={rainViewerTile} />}
        {state.weatherLayer.type === "HeatIndex" && (
          <>
            <OpenWeatherLayer openWeatherTile={openWeatherTile} />
            {negrosWeatherMemoized}
          </>
        )}

        {/* Search Result Marker */}
        {state.activeBottomSheet === "search" && searchCityDetails.latitude && (
          <PointAnnotation id="123" coordinate={[searchCityDetails.longitude, searchCityDetails.latitude]}></PointAnnotation>
        )}

        {/* Critical Facilities */}
        {renderFacilityMarker("Hospitals")}
        {renderFacilityMarker("FireStations")}
        {renderFacilityMarker("EvacSites")}

        {/*User Reported Hazard markers */}
        {!isLoading &&
          reports &&
          reports.map((report) => {
            return <HazardMarker key={report.id} report={report} onPress={() => onMarkerPress(report)} />;
          })}

        {/*User Reported Heatmap layer (conditionally rendered) */}
        {showHeatmap && <HeatMapLayer data={getHeatmapData()} />}
      </BaseMap>

      {/* SIDE BUTTONS */}
      <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
        <SideButtons onPress={() => handleActiveBottomSheet("hazards")} iconName="layers" isActive={state.activeBottomSheet === "hazards"} />
        <SideButtons
          onPress={() => handleActiveBottomSheet("facilities")}
          iconName="office-building-marker"
          isActive={state.activeBottomSheet === "facilities"}
        />
        <SideButtons onPress={() => handleActiveBottomSheet("search")} iconName="magnify" isActive={state.activeBottomSheet === "search"} />
        <SideButtons onPress={handleZoomButton} iconName="target" isActive={state.activeBottomSheet === "zoom"} />
      </View>

      {/* BOTTOM SHEETS */}
      <FacilitiesMarkerBottomSheet ref={bottomSheetRef} handleSheetChanges={handleSheetChanges} data={facilitiesInformation} />

      {state.activeBottomSheet === "hazards" && <HazardSelectionBottomSheet state={state} setState={setState} />}
      {state.activeBottomSheet === "facilities" && (
        <FacilitiesSelectionBottomSheet state={state} setState={setState} onSourceChange={handleSourceChange} />
      )}
    </View>
  );
};

export default RadarScreen;
