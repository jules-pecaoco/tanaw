import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import Mapbox, { MapView, Camera, UserLocation } from "@rnmapbox/maps";
import Constants from "expo-constants";

import userPermissionStore from "@/context/userPermissionStore";
import CustomButton from "@//views/components/CustomButton";
import { icons } from "@/constants/index";

const MAPBOX_PUBLIC_TOKEN = Constants.expoConfig.extra.mapboxToken
Mapbox.setAccessToken(MAPBOX_PUBLIC_TOKEN);

const Radar = () => {
  const expoPushToken = userPermissionStore.getItem("expoPushToken");
  const userLocation = JSON.parse(userPermissionStore.getItem("location"));
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white flex justify-center items-center">
      <View className="relative h-full w-full">
        <MapView
          style={{ flex: 1 }}
          onMapIdle={(event) => {
            setZoom(event.zoomLevel);
          }}
        >
          <UserLocation visible={true} />
          <Camera zoomLevel={zoom} centerCoordinate={[userLocation.coords.longitude, userLocation.coords.latitude]} />

          {/* 3D BUILDING */}
          {/* <VectorSource id="buildingSource" url="mapbox://mapbox.mapbox-streets-v8">
            <FillExtrusionLayer
              id="3d-buildings"
              sourceLayerID="building"
              style={{
                fillExtrusionColor: "#aaa",
                fillExtrusionOpacity: 0.6,
                fillExtrusionHeight: ["get", "height"],
                fillExtrusionBase: ["get", "min_height"],
              }}
            />
          </VectorSource> */}
        </MapView>

        <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
          <TouchableOpacity activeOpacity={0.7}>
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.weatherbuttons} className="size-6" tintColor={"#F47C25"} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5}>
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.search} className="size-6" tintColor={"#F47C25"} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} onPress={() => setZoom(14)}>
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.locationpinning} className="size-6" tintColor={"#F47C25"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar hidden />
    </SafeAreaView>
  );
};

export default Radar;
