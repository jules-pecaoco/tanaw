import React from "react";
import { View } from "react-native";

import HazardFacilitiesWidget from "./widgets/HazardFacilitiesWidget";

const RadarScreen = () => {
  return (
    <View className="flex-1">
      <HazardFacilitiesWidget />
    </View>
  );
};

export default RadarScreen;
