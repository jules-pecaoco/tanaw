import React, { useEffect, useState, useCallback, useMemo } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image } from "react-native";
import Mapbox, { MapView, Camera, UserLocation, MarkerView, VectorSource, FillExtrusionLayer } from "@rnmapbox/maps";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { icons } from "@/constants/index";
import userPermissionStore from "@/context/userPermissionStore";
import KEY from "@/constants/keys";

Mapbox.setAccessToken(KEY.MAPBOX_PUBLIC_TOKEN);

const SheetButton = ({ title, onPress, child }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-5 bg-white rounded-lg shadow-lg h-fit flex justify-center items-center">
        {child}
        {title && <Text className="text-xs">{title}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const HazardBottomSheet = ({ setShowButtomSheet }) => {
  const hazardButtons = ["Fire", "Flood", "Wind", "Rain"];
  const hazardButtonsIcons = ["fire", "water", "wind", "cloud-showers-heavy"];

  const heatIndexSources = ["PAGASA", "OpenWeather", "Other"];
  const heatIndexIcons = ["thermometer-half", "thermometer-half", "thermometer-half"];

  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Hazard Type</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setShowButtomSheet(false)}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-2">
        {hazardButtons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            child={<FontAwesome5 name={hazardButtonsIcons[index]} size={25} color="black" />}
            onPress={() => console.log(button)}
          />
        ))}
      </View>
      <View className="bg-black h-[1px] my-5"></View>
      <View>
        <Text className="text-lg font-rregular">Heat Index Source</Text>
      </View>
      <View className="flex flex-row justify-around items-center mt-5 gap-2">
        {heatIndexSources.map((source, index) => (
          <SheetButton
            key={index}
            title={source}
            child={<FontAwesome5 name={heatIndexIcons[index]} size={25} color="black" />}
            onPress={() => console.log(source)}
          />
        ))}
      </View>
    </View>
  );
};

const EmergencyBottomSheet = ({ setShowButtomSheet }) => {
  const emergencyButtons = ["Hospitals", "Fire Stations", "Evac Sites"];
  const emergencyButtonsIcons = ["hospital", "fire-extinguisher", "house-damage"];

  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Emergency Facilities</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setShowButtomSheet(false)}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-5">
        {emergencyButtons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            child={<FontAwesome5 name={emergencyButtonsIcons[index]} size={25} color="black" />}
            onPress={() => console.log(button)}
          />
        ))}
      </View>
    </View>
  );
};

const Marker = ({ coordinates, facilityName, facilityContactInfo }) => {
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
              <Text className="text-black">{facilityName}</Text>
              <Text className="text-black">{facilityContactInfo}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </MarkerView>
  );
};

const RadarButtons = ({ onPress, icon, active, label }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
        <Image source={icon} className="size-6" tintColor={`${active === label ? "#F47C25" : "#94a3b8"}`} />
      </View>
    </TouchableOpacity>
  );
};

// MEMOIZED AND CALLBACKS

const HazardFacilitiesWidget = () => {
  const userLocation = JSON.parse(userPermissionStore.getItem("location"))
    ? JSON.parse(userPermissionStore.getItem("location"))
    : { coords: { latitude: 10.65709, longitude: 122.948 } };
  const [zoom, setZoom] = useState(10);
  const [active, setActive] = useState(false);

  const label = ["hazard", "facilities"];
  const icon = [icons.weatherbuttons, icons.search];

  useEffect(() => {
    Mapbox.setTelemetryEnabled(false);
  }, []);

  const handleMapIdle = useCallback((event) => {
    setZoom(event.zoomLevel);
  }, []);

  const EmergencySheet = useMemo(() => <EmergencyBottomSheet setShowButtomSheet={setActive} />, []);
  const HazardSheet = useMemo(() => <HazardBottomSheet setShowButtomSheet={setActive} />, []);
  const markerCoordinates = useMemo(() => [122.948, 10.65709], []);

  return (
    <SafeAreaView className="flex-1 bg-white flex justify-center items-center">
      <View className="relative h-full w-full">
        <MapView style={{ flex: 1 }} onMapIdle={handleMapIdle}>
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
          </VectorSource>
          <UserLocation/>
          <Camera pitch={30} zoomLevel={zoom} centerCoordinate={[userLocation.coords.longitude, userLocation.coords.latitude]} />
          <Marker coordinates={markerCoordinates} facilityName="UNO-R" facilityContactInfo="09951022578" />
        </MapView>

        {/* SIDE BUTTONS */}
        <View className="absolute bottom-20 right-10 flex justify-between flex-col gap-6">
          {label.map((item, index) => (
            <RadarButtons key={index} onPress={() => setActive(item)} icon={icon[index]} active={active} label={item} />
          ))}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setZoom(14);
              setActive("zoom");
            }}
          >
            <View className="p-5 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
              <Image source={icons.locationpinning} className="size-6" tintColor={`${active === "zoom" ? "#F47C25" : "#94a3b8"}`} />
            </View>
          </TouchableOpacity>
        </View>

        {/*FACILITY BOTTOM SHEET */}
        {active === "facilities" && EmergencySheet}

        {/*HAZARD BOTTOM SHEET */}
        {active === "hazard" && HazardSheet}
      </View>
    </SafeAreaView>
  );
};

export default HazardFacilitiesWidget;
