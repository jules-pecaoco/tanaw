import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import React, { useMemo } from "react";

import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";
import HazardLayers from "./HazardLayers";
import FacilitiesMarker from "./FacilitiesMarker";


// MAPBOX IS A LIBRARY USED FOR RENDERING MAPS
// ACCESS TOKEN REFERS TO PUBLIC TOKEN GIVEN BY MAPBOX API
// TELEMETRY REFERS TO THE COLLECTION OF DATA

// rn-mapbox is a library used for rendering maps in React Native
// MapView is the main component for rendering maps
// Camera is used to control the position of the camera
// UserLocation is used to display the user's location on the map

// Refer to the FacilitiesMarker component for the rendering of facilities markers
// Refer to the HazardLayers component for the rendering of hazard layers

Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const BaseMap = ({ state, handleMapIdle, currentLocation, markerCoordinates, openBottomSheet }) => {
  Mapbox.setTelemetryEnabled(false);

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

  return (
    <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle} styleURL="mapbox://styles/mapbox/light-v10">
      <Camera pitch={30} zoomLevel={state.zoom} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} />
      <UserLocation visible animated />
      <FacilitiesMarker coordinates={markerCoordinates} onPress={openBottomSheet} facilityName="UNO-R" facilityContactInfo="09951022578" />

      {/* Hazard Layers */}
      {state.hazards === "Flood" && <HazardLayers {...hazardLayerProps} />}
      {state.hazards === "Landslide" && <HazardLayers {...hazardLayerProps} />}
      {state.hazards === "Storm Surge" && <HazardLayers {...hazardLayerProps} />}
    </MapView>
  );
};

export default BaseMap;
