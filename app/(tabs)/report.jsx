import { View, Text } from "react-native";
import React from "react";

import ReportScreen from "@/views/Report/ReportScreen";

const report = () => {
  return (
    <View className="flex-1 bg-white">
      <ReportScreen />
    </View>
  );
};

export default report;
