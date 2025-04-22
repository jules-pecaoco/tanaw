import React from "react";
import { View, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const SideButtons = React.memo(({ onPress, isActive, iconName }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-4 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
        <MaterialCommunityIcons name={iconName} size={24} color={`${isActive ? "#F47C25" : "#94a3b8"}`} />
      </View>
    </TouchableOpacity>
  );
});

export default SideButtons;
