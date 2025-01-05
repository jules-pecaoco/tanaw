import { View, Text } from "react-native";
import React from "react";

import { userPermissionStore } from "@/context/userPermissionStore";

const Radar = () => {
  const location = userPermissionStore.getItem("location");
  const expoPushToken = userPermissionStore.getItem("expoPushToken");
 
  return (
    <View className="h-full flex items-center justify-center bg-white">
      <Text className="text-center">{expoPushToken}</Text>
      <Text className="text-center">{location}</Text>
      <Text>Radar</Text>
    </View>
  );
};

export default Radar;
