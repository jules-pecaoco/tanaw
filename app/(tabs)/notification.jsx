import React from "react";

import NotificationScreen from "@/views/Notification/NotificationScreen";
import { SafeAreaView, View, Text } from "react-native";

const Notification = () => {
  return (
    <View className="flex-1 bg-gray-200">
      <View className="w-full bg-white py-5">
        <Text className="text-center font-rmedium text-3xl">Notifications</Text>
      </View>
      <NotificationScreen />
    </View>
  );
};

export default Notification;
