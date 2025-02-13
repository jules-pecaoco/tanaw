import { View, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const buttonConfig = {
  hazard: {
    buttons: ["Heat Index", "Flood", "Landslide", "Storm Surge"],
    icons: ["thermostat", "flood", "landslide", "tsunami"],
  },
  emergency: {
    buttons: ["Hospitals", "Fire Stations", "Evac Sites"],
    icons: ["local-hospital", "fire-truck", "night-shelter"],
  },
};

const SheetButton = ({ title, onPress, child, isactive, customStyle }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`${
        isactive ? "border border-primary border-solid" : ""
      } ${customStyle} p-5 bg-white rounded-lg shadow-lg flex justify-center items-center border-[1px]`}
    >
      {child}
      {title && <Text className="text-sm">{title}</Text>}
    </TouchableOpacity>
  );
};

const HazardSelectionBottomSheet = ({ state, setState }) => {
  return (
    <View className="absolute bottom-0 w-full bg-white p-5">
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Hazard Type</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setState({ ...state, sideButtons: "none" })}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-3 flex-wrap w-full">
        {buttonConfig.hazard.buttons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            isactive={state.hazards === button}
            child={<MaterialIcons name={buttonConfig.hazard.icons[index]} size={24} color="black" />}
            onPress={() => {
              setState({ ...state, hazards: button });
            }}
            customStyle={`w-[48%]`}
          />
        ))}
      </View>
    </View>
  );
};

const FacilitiesSelectionBottomSheet = ({ state, setState }) => {
  return (
    <View className={`absolute bottom-0 w-full bg-white p-5`}>
      <View className="flex justify-between items-center flex-row">
        <Text className="text-lg font-rregular">Emergency Facilities</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={() => setState({ ...state, sideButtons: "none" })}>
          <Feather name="x" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-around items-center mt-5 gap-5 w-full">
        {buttonConfig.emergency.buttons.map((button, index) => (
          <SheetButton
            key={index}
            title={button}
            isactive={state.facilities === button}
            child={<MaterialIcons name={buttonConfig.emergency.icons[index]} size={25} color="black" />}
            onPress={() => setState({ ...state, facilities: button })}
            customStyle={``}
          />
        ))}
      </View>
    </View>
  );
};

const FacilitiesMarkerBottomSheet = React.forwardRef(({ data, handleSheetChanges }, ref) => {
  // SNAP POINTS = HEIGHT OF BOTTOM SHEET

  // Function to open the dialer with the contact number
  const handleCallPress = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) => {
      console.error("Error opening dialer:", err);
    });
  };
  return (
    <BottomSheet
      ref={ref}
      index={-1}
      onChange={handleSheetChanges}
      snapPoints={["28%"]}
      enablePanDownToClose={true}
      enableOverDrag={false}
      animateOnMount={true}
    >
      <BottomSheetView className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-5 text-[#F47C25]">Facilities Information</Text>
        <View className="bg-white p-2 rounded-lg">
          <Text className="text-black font-bold">UNO-R</Text>
          <Text className="text-black mb-2">09951022578</Text>

          <TouchableOpacity className="bg-blue-500 p-2 rounded-md" onPress={() => handleCallPress("09951022578")}>
            <Text className="text-white text-center">Call Now</Text>
          </TouchableOpacity>
        </View>
        
      </BottomSheetView>
    </BottomSheet>
  );
});

export { HazardSelectionBottomSheet, FacilitiesSelectionBottomSheet, FacilitiesMarkerBottomSheet };
