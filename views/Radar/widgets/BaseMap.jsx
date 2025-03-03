import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import React, { useEffect, forwardRef } from "react";
import { View } from "react-native";

import { MAPBOX_PUBLIC_TOKEN } from "@/tokens/tokens";

// MAPBOX is a library that provides a map rendering service
// ACCESS TOKEN is your own unique key to access the mapbox
// TELEMETRY is used to track the data of the user
Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const BaseMap = React.forwardRef(({ currentLocation, children }, ref) => {

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Camera pitch={30} zoomLevel={14} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} ref={ref} />
      <UserLocation visible animated />
      {children}
    </MapView>
  );
});

export default BaseMap;
