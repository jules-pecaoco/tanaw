import Mapbox, { MapView, Camera, UserLocation, MarkerView } from "@rnmapbox/maps";
import React, { useMemo, useEffect } from "react";
import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";

import HazardLayers from "./HazardLayers";
import FacilitiesMarker from "./FacilitiesMarker";
import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";
import { RainViewerLayer, OpenWeatherLayer } from "./WeatherLayers";
import { fetchNearbyCities } from "@/services/citiesAPI";
import { fetchRainViewerData, fetchOpenWeatherData } from "@/services/weatherAPI";

// MAPBOX IS A LIBRARY USED FOR RENDERING MAPS
// ACCESS TOKEN REFERS TO PUBLIC TOKEN GIVEN BY MAPBOX API
// TELEMETRY REFERS TO THE COLLECTION OF DATA
Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const BaseMap = ({ state, handleMapIdle, currentLocation, markerCoordinates, openBottomSheet }) => {
  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
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
    data: nearbyCities,
    isLoading: isLoadingNearbyCities,
    error: isErrorNearbyCities,
  } = useQuery({
    queryKey: ["nearbyCities", currentLocation.latitude, currentLocation.longitude],
    queryFn: () => fetchNearbyCities(currentLocation.latitude, currentLocation.longitude),
    enabled: !!currentLocation.latitude && !!currentLocation.longitude,
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
    <View className="flex-1">
      <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle} styleURL="mapbox://styles/mapbox/light-v10">
        <Camera pitch={30} zoomLevel={state.zoom} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} />
        <UserLocation visible animated />
        <FacilitiesMarker coordinates={markerCoordinates} onPress={openBottomSheet} facilityName="UNO-R" facilityContactInfo="09951022578" />

        {/* Weather Layers */}
        {state.weather === "Rain" && <RainViewerLayer rainViewerTile={rainViewerTile} />}
        {state.weather === "Heat Index" && <OpenWeatherLayer openWeatherTile={openWeatherTile} />}
        {state.weather === "Heat Index" &&
          nearbyCities.map((city) => (
            <MarkerView key={city.id} id={city.name} coordinate={[city.coord.lon, city.coord.lat]}>
              <View className="p-1 bg-primary">
                <Text className="font-rthin text-xs text-white">
                  {city.name}: {Math.round(city.main.temp)}°C
                </Text>
              </View>
            </MarkerView>
          ))}

        {/* Hazard Layers */}
        {state.hazards === "Flood" && <HazardLayers {...hazardLayerProps} />}
        {state.hazards === "Landslide" && <HazardLayers {...hazardLayerProps} />}
        {state.hazards === "Storm Surge" && <HazardLayers {...hazardLayerProps} />}
      </MapView>
    </View>
  );
};

export default BaseMap;
