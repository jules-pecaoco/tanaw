import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import React, { useEffect } from "react";
import { View } from "react-native";


import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";

// MAPBOX is a library that provides a map rendering service
// ACCESS TOKEN is your own unique key to access the mapbox
// TELEMETRY is used to track the data of the user
Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const BaseMap = ({ state, handleMapIdle, currentLocation, children }) => {
  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  return (
    <View className="flex-1">
      <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle} styleURL="mapbox://styles/mapbox/light-v10">
        <Camera pitch={30} zoomLevel={state.zoom} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} />
        <UserLocation visible animated />
        {/* <FacilitiesMarker coordinates={markerCoordinates} onPress={openBottomSheet} facilityName="UNO-R" facilityContactInfo="09951022578" /> */}

        {children}
      </MapView>
    </View>
  );
};

export default BaseMap;
