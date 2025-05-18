import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { PointAnnotation } from "@rnmapbox/maps";

// API & Services
import { fetchOpenStreetFacilitiesByType } from "@/services/openstreet";
import { fetchGoogleFacilitiesByType } from "@/services/google";
import { fetchOpenWeatherTile, fetchNegrosWeather, fetchProximityWeather } from "@/services/openweather";
import { fetchRainViewerTile } from "@/services/rainviewer";
import { registerWeatherTask, isWeatherTaskRegistered, setUserLocationForTask } from "@/services/weatherTaskManager";
import { uploadUserIdentifier } from "@/services/supabase";

// Hooks
import useNotification from "@/hooks/useNotification";
import useHazardReports from "@/hooks/useHazardReports";
import useLocation from "@/hooks/useLocation";
import useDirections from "@/hooks/useDirections";
import useUserIdentifier from "@/hooks/useUserIdentifier";

// Components
import { RainViewerLayer, OpenWeatherLayer } from "./widgets/WeatherLayers";
import {
  FacilitiesSelectionBottomSheet,
  HazardSelectionBottomSheet,
  FacilitiesMarkerBottomSheet,
  UserReportBottomSheet,
} from "./widgets/BottomSheets";
import HazardLayers from "./widgets/HazardLayers";
import WeatherMarker from "./widgets/WeatherMarker";
import SideButtons from "./widgets/SideButtons";
import BaseMap from "./widgets/BaseMap";
import CriticalFacilitiesMarker from "./widgets/CriticalFacilitiesMarker";
import SearchCity from "./widgets/SearchCity";
import HazardMarker from "./widgets/UserReport/UserReportedHazardMarker";
import RouteDisplay from "./widgets/RouteDisplay";
import RainViewerTimestampSlider from "./widgets/RainViewerTimestampSlider";

const RadarScreen = () => {
  // ref
  const cameraRef = useRef(null);
  const facilitiesMarkerBottomSheetRef = useRef(null);
  const userReportBottomSheetRef = useRef(null);

  //  hooks
  const { location, getLocation } = useLocation();
  const { pushToken, sendNotificationIfNeeded } = useNotification();
  const { uniqueIdentifier } = useUserIdentifier();
  const {
    origin,
    route,
    distance,
    duration,
    routeIsLoading,
    routeError,
    findRoute,
    resetRoute,
    setOrigin,
    hasClickedGetDirections,
    setHasClickedGetDirections,
  } = useDirections();

  const { reports, reportsIsLoading } = useHazardReports();

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
      type: "HeatIndex",
      radius: "Proximity",
    },
    isFacilitiesLayerActive: {
      source: "OpenStreet",
      Hospitals: false,
      FireStations: false,
      EvacSites: false,
    },
  });

  //states
  const [userDestination, setUserDestination] = useState(null);
  const [userSelectedReport, setUserSelectedReport] = useState(null);

  const [facilitiesInformation, setFacilitiesInformation] = useState({
    facilityName: "",
    facilityContact: "",
  });

  const [searchCityDetails, setSearchCityDetails] = useState({
    latitude: "",
    longitude: "",
  });

  const [rainViewerPath, setRainViewerPath] = useState();

  useEffect(() => {
    const setupBackgroundTask = async () => {
      setOrigin(currentLocation);
      try {
        const isTaskRegistered = await isWeatherTaskRegistered();

        if (!isTaskRegistered) {
          console.log("Registering background weather task");
          await registerWeatherTask(currentLocation, sendNotificationIfNeeded);
        } else {
          console.log("Background task already registered");
          setUserLocationForTask(currentLocation);
        }
      } catch (error) {
        console.error("Error setting up background task:", error);
      }
    };

    const uploadUserIdentification = async () => {
      await uploadUserIdentifier(uniqueIdentifier, currentLocation, pushToken);
    };

    if (currentLocation) {
      setupBackgroundTask();
      uploadUserIdentification();
    } else {
      console.warn("Cannot setup background task: location not available");
    }
  }, [currentLocation]);

  // Callback functions
  const handleActiveBottomSheet = useCallback((item) => {
    setState((prevState) => ({ ...prevState, activeBottomSheet: item }));
  }, []);

  const handleTimestampChange = useCallback((path) => {
    setRainViewerPath(path);
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

  const handleFacilitiesMarkerBottomSheet = useCallback((index) => {
    if (index > 0) {
      facilitiesMarkerBottomSheetRef.current?.close();
    }
  }, []);

  const openFacilitiesMarkerBottomSheet = useCallback(() => {
    facilitiesMarkerBottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleUserReportBottomSheet = useCallback((index) => {
    if (index > 0) {
      userReportBottomSheetRef.current?.close();
    }
  }, []);

  const openUserReportBottomSheet = useCallback(() => {
    userReportBottomSheetRef.current?.snapToIndex(0);
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
  const { data: negrosWeather, isLoading: negrosWeatherIsLoading } = useQuery({
    queryKey: ["negrosWeatherData"],
    queryFn: fetchNegrosWeather,
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 2,
  });

  const { data: proximityWeather, isLoading: proximityWeatherIsLoading } = useQuery({
    queryKey: ["proximityWeatherData"],
    queryFn: () => fetchProximityWeather({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 2,
  });

  const { data: openWeatherTile } = useQuery({
    queryKey: ["openWeatherTile"],
    queryFn: () => fetchOpenWeatherTile(),
    gcTime: 0,
    staleTime: 0,
    refetchInterval: 1000 * 60,
  });

  const { data: rainViewerData } = useQuery({
    queryKey: ["rainViewerData"],
    queryFn: fetchRainViewerTile,
    gcTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 20,
    refetchInterval: 1000 * 60 * 20,
  });

  const { data: googleFacilitiesByType } = useQuery({
    queryKey: ["GoogleFacilitiesByType"],
    queryFn: () => fetchGoogleFacilitiesByType({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 12,
  });

  const { data: openStreetFacilitiesByType } = useQuery({
    queryKey: ["OpenStreetFacilitiesByType"],
    queryFn: () => fetchOpenStreetFacilitiesByType({ currentLocation }),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 12,
  });

  // Memoized components
  const WeatherMarkerMemoized = useMemo(
    () => <WeatherMarker negrosWeather={negrosWeather} proximityWeather={proximityWeather} radius={state.weatherLayer.radius} />,
    [state.weatherLayer.radius, negrosWeather, proximityWeather]
  );

  const renderFacilityMarker = useMemo(() => {
    return (type) => {
      if (!state.isFacilitiesLayerActive[type]) return null;

      const facilityData = state.isFacilitiesLayerActive.source === "OpenStreet" ? openStreetFacilitiesByType : googleFacilitiesByType;

      if (!facilityData) return null;

      return (
        <CriticalFacilitiesMarker
          data={facilityData}
          type={type}
          onPress={openFacilitiesMarkerBottomSheet}
          setFacilitiesInformation={setFacilitiesInformation}
          source={state.isFacilitiesLayerActive.source}
        />
      );
    };
  }, [state.isFacilitiesLayerActive]);

  const renderRainViewerLayer = useMemo(() => {
    if (state.weatherLayer.type === "Rain" && rainViewerPath) {
      return <RainViewerLayer key={rainViewerPath} rainViewerPath={rainViewerPath} />;
    }
    return null;
  }, [state.weatherLayer.type, rainViewerPath]);

  if (!location || negrosWeatherIsLoading || proximityWeatherIsLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} color={"#F47C25"}></ActivityIndicator>
      </View>
    );
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
      <BaseMap currentLocation={currentLocation} ref={cameraRef}>
        {/* Hazard Layers */}
        {state.isHazardLayerActive.Flood && <HazardLayers props={hazardLayerProps.Flood} />}
        {state.isHazardLayerActive.Landslide && <HazardLayers props={hazardLayerProps.Landslide} />}
        {state.isHazardLayerActive.StormSurge && <HazardLayers props={hazardLayerProps.StormSurge} />}

        {/* Weather Layers */}
        {renderRainViewerLayer}
        {state.weatherLayer.type === "HeatIndex" && (
          <>
            <OpenWeatherLayer openWeatherTile={openWeatherTile} />
            {WeatherMarkerMemoized}
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
        {!reportsIsLoading &&
          reports &&
          reports.map((report) => {
            return <HazardMarker key={report.id} report={report} onPress={openUserReportBottomSheet} setUserSelectedReport={setUserSelectedReport} />;
          })}

        {hasClickedGetDirections && !routeIsLoading && <RouteDisplay route={route} origin={origin} destination={userDestination} />}
      </BaseMap>

      {/* RAIN VIEWER TIMESTAMP SLIDER */}
      {state.weatherLayer.type === "Rain" && <RainViewerTimestampSlider timestamps={rainViewerData} onTimestampChange={handleTimestampChange} />}

      {/* SIDE BUTTONS */}
      <View className="absolute bottom-[20%] right-10 flex justify-between flex-col gap-6">
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
      <FacilitiesMarkerBottomSheet
        ref={facilitiesMarkerBottomSheetRef}
        handleSheetChanges={handleFacilitiesMarkerBottomSheet}
        data={facilitiesInformation}
        findRoute={findRoute}
        resetRoute={resetRoute}
        routeIsLoading={routeIsLoading}
        routeError={routeError}
        hasClickedGetDirections={hasClickedGetDirections}
        distance={distance}
        duration={duration}
        setUserDestination={setUserDestination}
        destination={userDestination}
        setHasClickedGetDirections={setHasClickedGetDirections}
      />

      <UserReportBottomSheet
        ref={userReportBottomSheetRef}
        item={userSelectedReport}
        handleSheetChanges={handleUserReportBottomSheet}
      ></UserReportBottomSheet>

      {state.activeBottomSheet === "hazards" && <HazardSelectionBottomSheet state={state} setState={setState} />}
      {state.activeBottomSheet === "facilities" && (
        <FacilitiesSelectionBottomSheet state={state} setState={setState} onSourceChange={handleSourceChange} />
      )}
    </View>
  );
};

export default RadarScreen;
