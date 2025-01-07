import { View, Text, TouchableOpacity } from "react-native";

import { userPermissionStore } from "@/context/userPermissionStore";


const Radar = () => {
  const location = userPermissionStore.getItem("location");
  const expoPushToken = userPermissionStore.getItem("expoPushToken");

  return (
    <View className="h-full flex items-center justify-center bg-white">
      <Text>{location}</Text>
      <Text>{expoPushToken}</Text>
      
    </View>
  );
};

export default Radar;
