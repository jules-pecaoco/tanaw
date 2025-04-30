import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import React, { useEffect, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";

import { sources } from "@/constants/index";
import { getImageUrl } from "@/services/supabase";

const buttonConfig = {
  weather: {
    buttons: ["Rain", "HeatIndex"],
    icons: ["cloudy-snowing", "thermostat"],
    radius: ["City", "Proximity"],
    radiusIcons: ["location-city", "radar"],
  },
  hazard: {
    buttons: ["Flood", "Landslide", "StormSurge"],
    icons: ["flood", "landslide", "tsunami"],
  },
  emergency: {
    buttons: ["Hospitals", "FireStations", "EvacSites"],
    icons: ["local-hospital", "fire-truck", "night-shelter"],
    source: ["OpenStreet", "Google Places"],
    sourcesIcons: ["openstreet", "google"],
  },
};

const SheetButton = ({ title, onPress, isactive, customStyle, children }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`${
        isactive ? "border border-primary border-solid" : ""
      } ${customStyle} p-5 bg-white rounded-lg shadow-lg flex justify-center items-center border-[1px]`}
    >
      {children}
      {title && <Text className="text-xs">{title}</Text>}
    </TouchableOpacity>
  );
};

const SourcesButton = ({ title, onPress, isactive, customStyle, children, tooltipContent }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip((prevState) => !prevState);
  };

  return (
    <View className="relative">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className={`${
          isactive ? "border border-primary border-solid" : ""
        } ${customStyle} p-5 bg-white rounded-lg shadow-lg flex justify-center items-center border-[1px]`}
      >
        {/* Info icon in top right corner */}
        {tooltipContent && (
          <TouchableOpacity onPress={toggleTooltip} className="absolute top-2 right-2 z-10">
            <MaterialIcons name="info-outline" size={24} color="black" />
          </TouchableOpacity>
        )}

        {children}
        {title && <Text className="text-xs">{title}</Text>}
      </TouchableOpacity>

      {/* Tooltip box that appears when info icon is clicked */}
      {showTooltip && tooltipContent && (
        <View className="absolute top-12 right-0 bg-white p-3 rounded-md shadow-md border border-gray-200 z-20 w-48">
          <Text className="text-xs text-gray-700">{tooltipContent}</Text>
          <TouchableOpacity onPress={toggleTooltip} className="absolute top-1 right-1">
            <Text className="text-xs font-bold text-gray-500">✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const HazardSelectionBottomSheet = ({ state, setState }) => {
  return (
    <View className="absolute bottom-0 w-full bg-white p-5">
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Weather Type</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setState({ ...state, activeBottomSheet: "none" })}>
          <MaterialIcons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-2 flex-wrap w-full">
        {buttonConfig.weather.buttons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            isactive={state.weatherLayer.type === button}
            onPress={() => {
              setState({
                ...state,
                weatherLayer: {
                  type: state.weatherLayer.type === button ? "none" : button,
                },
              });
            }}
            customStyle={`flex-1`}
          >
            {<MaterialIcons name={buttonConfig.weather.icons[index]} size={24} color="black" />}
          </SheetButton>
        ))}
      </View>

      {state.weatherLayer.type === "HeatIndex" && (
        <>
          <View className="w-full bg-black h-[2px] my-5"></View>

          <View className="flex justify-between items-center flex-row">
            <Text className="text-lg font-rregular">Radius</Text>
          </View>

          <View className="flex flex-row justify-around items-center mt-5 gap-2 flex-wrap w-full">
            {buttonConfig.weather.radius.map((button, index) => {
              console.log(state.weatherLayer.radius, button);
              return (
                <SheetButton
                  key={index}
                  title={button}
                  isactive={state.weatherLayer.radius === button}
                  onPress={() => {
                    setState({
                      ...state,
                      weatherLayer: {
                        ...state.weatherLayer,
                        radius: button,
                      },
                    });
                  }}
                  customStyle={`flex-1`}
                >
                  {<MaterialIcons name={buttonConfig.weather.radiusIcons[index]} size={24} color="black" />}
                </SheetButton>
              );
            })}
          </View>
        </>
      )}

      <View className="w-full bg-black h-[2px] my-5"></View>

      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Hazard Type</Text>
      </View>
      <View className="flex flex-row justify-around items-center mt-5 gap-2 flex-wrap w-full">
        {buttonConfig.hazard.buttons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            isactive={state.isHazardLayerActive[button]}
            onPress={() => {
              setState({
                ...state,
                isHazardLayerActive: {
                  ...state.isHazardLayerActive,
                  [button]: !state.isHazardLayerActive[button],
                },
              });
            }}
            customStyle={`flex-1`}
          >
            {<MaterialIcons name={buttonConfig.hazard.icons[index]} size={24} color="black" />}
          </SheetButton>
        ))}
      </View>
    </View>
  );
};

const FacilitiesSelectionBottomSheet = ({ state, setState, onSourceChange }) => {
  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Emergency Facilities</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setState({ ...state, activeBottomSheet: "none" })}>
          <MaterialIcons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-5 w-full">
        {buttonConfig.emergency.buttons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            isactive={state.isFacilitiesLayerActive[button]}
            onPress={() =>
              setState({
                ...state,
                isFacilitiesLayerActive: {
                  ...state.isFacilitiesLayerActive,
                  [button]: !state.isFacilitiesLayerActive[button], // Toggle current value
                },
              })
            }
            customStyle={``}
          >
            {<MaterialIcons name={buttonConfig.emergency.icons[index]} size={25} color="black" />}
          </SheetButton>
        ))}
      </View>
      <View className="w-full bg-black h-[2px] my-5"></View>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Source Type</Text>
      </View>
      <View className="flex flex-row justify-around items-center mt-5 gap-5 w-full">
        {buttonConfig.emergency.source.map((button, index) => {
          return (
            <SourcesButton
              key={index}
              title={button}
              isactive={state.isFacilitiesLayerActive.source === button}
              onPress={() => onSourceChange(button)}
              customStyle={`flex-1`}
            >
              {<Image source={sources[buttonConfig.emergency.sourcesIcons[index]]} className="size-8" resizeMode="contain"></Image>}
            </SourcesButton>
          );
        })}
      </View>
    </View>
  );
};

const FacilitiesMarkerBottomSheet = React.forwardRef(
  (
    {
      data,
      handleSheetChanges,
      findRoute,
      resetRoute,
      routeIsLoading,
      routeError,
      hasClickedGetDirections,
      distance,
      duration,
      setUserDestination,
      userDestination,
      setHasClickedGetDirections,
    },
    ref
  ) => {
    const [isCurrentRouteActive, setIsCurrentRouteActive] = useState();

    useEffect(() => {
      setIsCurrentRouteActive(data.location === userDestination);
    }, [data]);

    // Function to open the dialer with the contact number
    const handleCallPress = (phoneNumber) => {
      const phoneUrl = `tel:${phoneNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error("Error opening dialer:", err);
      });
    };

    // Function to handle route finding
    const handleFindRoute = () => {
      console.log("handleFindRoute called, data:", data);
      if (data?.location) {
        setUserDestination(data.location);
        findRoute(data.location);
        setHasClickedGetDirections(true);
        setIsCurrentRouteActive(true);
      }
    };

    // Function to handle reset route
    const handleResetRoute = () => {
      if (resetRoute) {
        resetRoute();
        setHasClickedGetDirections(false);
        setIsCurrentRouteActive(false);
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        onChange={handleSheetChanges}
        // 47, 37
        snapPoints={isCurrentRouteActive ? ["50%", "47%"] : ["50%", "37%"]}
        enablePanDownToClose={true}
        enableOverDrag={false}
        animateOnMount={true}
      >
        <BottomSheetView className="flex-1 p-5">
          <Text className="text-2xl font-bold mb-5 text-[#F47C25]">Facilities Information</Text>
          <View className="bg-white p-2 rounded-lg">
            <Text className="text-black font-bold">{data.name}</Text>
            <Text className="text-black mb-2">{data.phone}</Text>
            {isCurrentRouteActive && hasClickedGetDirections && !routeIsLoading && routeError === null && (
              <View className="mt-2 mb-2">
                <Text className="text-black font-bold">Direction Detail:</Text>
                <Text className="text-black font-bold">Distance: {distance} km</Text>
                <Text className="text-black font-bold">Duration: {duration} minutes</Text>
              </View>
            )}
            <View>
              <TouchableOpacity className="bg-primary p-2 rounded-md mb-2" onPress={() => handleCallPress(data.phone)}>
                <Text className="text-white text-center">Call Now</Text>
              </TouchableOpacity>

              {!isCurrentRouteActive || !hasClickedGetDirections ? (
                <TouchableOpacity className="bg-green-500 p-2 rounded-md mb-2" onPress={handleFindRoute} disabled={routeIsLoading}>
                  <Text className="text-white text-center">{routeIsLoading ? "Loading..." : "Get Directions"}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity className="bg-red-500 p-2 rounded-md mb-2" onPress={handleResetRoute}>
                  <Text className="text-white text-center">Remove Route</Text>
                </TouchableOpacity>
              )}

              {routeError && <Text className="text-red-500 mt-2">Error: {routeError}</Text>}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const UserReportBottomSheet = React.forwardRef(({ item, handleSheetChanges }, ref) => {
  if (!item) return null;
  const hazardType = item.hazard_type.toLowerCase();
  const badgeColor = getBadgeColor(hazardType);
  const textColorClass = getTextColorClass(hazardType);
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      onChange={handleSheetChanges}
      snapPoints={["75%", "70%"]}
      enablePanDownToClose={true}
      enableOverDrag={false}
      animateOnMount={true}
    >
      <BottomSheetView className="flex-1 p-5">
        <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          {/* Hazard Image */}
          {item.image_path && <Image source={{ uri: getImageUrl(item.image_path) }} className="w-full h-48" resizeMode="cover" />}

          {/* Hazard Info Container */}
          <View className="p-4">
            {/* Hazard Type and Timestamp */}
            <View className="flex-column mb-2">
              <View className="flex-row items-center justify-between w-full mb-2">
                <View style={{ backgroundColor: badgeColor }} className="px-3 py-1 rounded-full flex-row items-center">
                  <Text className={`font-medium ${textColorClass}`}>{item.hazard_type.charAt(0).toUpperCase() + item.hazard_type.slice(1)}</Text>
                </View>
                <Text className="text-gray-500 text-sm">{getTimeAgo(item.created_at)}</Text>
              </View>
              <Text className="text-gray-500 text-sm text-left w-full ps-2">
                {item.hazard_sub_type.charAt(0).toUpperCase() + item.hazard_sub_type.slice(1)}
              </Text>
            </View>

            {/* Hazard Description */}
            <Text className="text-gray-700 mb-3 text-justify px-2">{item.hazard_description || "No description provided."}</Text>

            {/* Location Info */}
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text className="text-gray-600 text-sm ml-1">
                Location: {item.name.locality || "Unknown"}, {item.name.region || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const getTimeAgo = (dateString) => {
  const now = new Date();
  const reportDate = new Date(dateString);
  const diffMs = now - reportDate;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
};

/**
 * Helper: Get badge color based on hazard type
 * @param {string} hazardType - The type of natural hazard
 * @returns {string} - Hex color code for the badge
 */
const getBadgeColor = (hazardType) => {
  const colors = {
    typhoon: "#0D47A1", // Dark blue
    flooding: "#1976D2", // Blue
    earthquake: "#FFA000", // Amber
    "volcanic eruption": "#D32F2F", // Red
    landslide: "#795548", // Brown
    tsunami: "#006064", // Dark cyan
    "extreme heat": "#FF6F00", // Orange
    other: "#607D8B", // Blue grey
  };
  return colors[hazardType.toLowerCase()] || colors.other;
};

/**
 * Helper: Get text color class based on hazard type background color
 * @param {string} hazardType - The type of natural hazard
 * @returns {string} - CSS class for text color
 */
const getTextColorClass = (hazardType) => {
  const darkBackgrounds = ["typhoon", "flooding", "volcanic eruption", "landslide", "tsunami"];
  return darkBackgrounds.includes(hazardType.toLowerCase()) ? "text-white" : "text-gray-800";
};

export { HazardSelectionBottomSheet, FacilitiesSelectionBottomSheet, FacilitiesMarkerBottomSheet, UserReportBottomSheet };
