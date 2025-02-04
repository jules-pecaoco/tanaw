import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import Mapbox, { MapView, Camera, UserLocation, MarkerView, VectorSource, FillExtrusionLayer } from "@rnmapbox/maps";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { icons } from "@/constants/index";
import userPermissionStore from "@/context/userPermissionStore";
import KEY from "@/constants/keys";

Mapbox.setAccessToken(KEY.MAPBOX_PUBLIC_TOKEN);

const HazardBottomSheet = ({ setShowButtomSheet }) => {
  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Hazard Type</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setShowButtomSheet(false)}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-2">
        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg flex-1 justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="fire" size={25} color="black" />
            <Text className="text-xs">Fire</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg flex-1 justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="water" size={25} color="black" />
            <Text className="text-xs">Flood</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg flex-1 justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="wind" size={25} color="black" />
            <Text className="text-xs">Wind</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg flex-1 justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="cloud-showers-heavy" size={25} color="black" />
            <Text className="text-xs">Rain</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View className="bg-black h-[1px] my-5"></View>
      <View>
        <Text className="text-lg font-rregular">Heat Index Source</Text>
      </View>
      <View className="flex flex-row justify-around items-center mt-5 gap-2">
        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg grow justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="thermometer-half" size={25} color="black" />
            <Text className="text-xs">PAGASA</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg grow justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="thermometer-half" size={25} color="black" />
            <Text className="text-xs">OpenWeather</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.5} className="p-5 bg-white rounded-md shadow-lg grow justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="thermometer-half" size={25} color="black" />
            <Text className="text-xs">Other</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmergencyBottomSheet = ({ setShowButtomSheet }) => {
  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Emergency Facilities</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setShowButtomSheet(false)}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-5">
        <TouchableOpacity activeOpacity={0.5} className="flex-1 p-5 bg-white rounded-md shadow-lg h-fit flex justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="hospital" size={40} color="black" />
            <Text className="text-xs">Hospitals</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} className=" flex-1 p-5 bg-white rounded-md shadow-lg h-fit flex justify-center items-center">
          <View className="flex flex-col items-center gap-1">
            <FontAwesome5 name="fire-extinguisher" size={40} color="black" />
            <Text className="text-xs">Fire Stations</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.5} className="flex-1 p-5 bg-white rounded-md shadow-lg h-fit flex justify-center items-center">
          <View>
            <FontAwesome5 name="house-damage" size={40} color="black" />
            <Text className="text-xs">Evac Sites</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Marker = ({ coordinates }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <MarkerView coordinate={coordinates}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setShowInfo(showInfo ? false : true);
        }}
      >
        <View className="flex flex-col items-center gap-2">
          {!showInfo && <View className="bg-primary size-10 rounded-full" />}
          {showInfo && (
            <View className="bg-white p-2 rounded-lg">
              <Text className="text-black">UNO-R</Text>
              <Text className="text-black">Lizares Street</Text>
              <Text className="text-black">None</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </MarkerView>
  );
};

const Radar = () => {
  const expoPushToken = userPermissionStore.getItem("expoPushToken");
  const userLocation = JSON.parse(userPermissionStore.getItem("location"));
  const [zoom, setZoom] = useState(10);
  const [active, setActive] = useState(null);
  const [showEmergencyBottomSheet, setShowEmergencyBottomSheet] = useState(false);
  const [showHazardBottomSheet, setShowHazardBottomSheet] = useState(false);

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
          {/* 3D BUILDING
          <VectorSource id="buildingSource" url="mapbox://mapbox.mapbox-streets-v8">
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
          <Camera zoomLevel={zoom} centerCoordinate={[userLocation.coords.longitude, userLocation.coords.latitude]} />
          {/* POINT ANNOTATION */}
          <Marker coordinates={[122.948, 10.65709]} />
        </MapView>

        {/* SIDE BUTTONS */}
        <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActive("hazard");
              setShowHazardBottomSheet(true);
            }}
          >
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.weatherbuttons} className="size-6" tintColor={`${active == "hazard" ? "#F47C25" : "#94a3b8"}`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActive("facilities");
              setShowEmergencyBottomSheet(true);
            }}
          >
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.search} className="size-6" tintColor={`${active == "facilities" ? "#F47C25" : "#94a3b8"}`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActive("zoom");
              setZoom(14);
            }}
          >
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.locationpinning} className="size-6" tintColor={`${active == "zoom" ? "#F47C25" : "#94a3b8"}`} />
            </View>
          </TouchableOpacity>
        </View>

        {/*EMERGENCY BOTTOM SHEET */}
        {showEmergencyBottomSheet && <EmergencyBottomSheet setShowButtomSheet={setShowEmergencyBottomSheet} />}

        {/*HAZARD BOTTOM SHEET */}
        {showHazardBottomSheet && <HazardBottomSheet setShowButtomSheet={setShowHazardBottomSheet} />}
      </View>
      <StatusBar hidden />
    </SafeAreaView>
  );
};

export default Radar;
