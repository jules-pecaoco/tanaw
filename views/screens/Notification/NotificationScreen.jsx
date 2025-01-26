import { View, Text, FlatList, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

import NotificationWidget from "@/views/widgets/Notification/NotificationWidget";

const NotificationScreen = ({ notificationData }) => {
  return (
    <SafeAreaView className="h-full bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        <View className="w-full bg-white py-5">
          <Text className="text-center font-rmedium text-3xl">Notifications</Text>
        </View>
        <View className="w-[95%] h-[90%] flex flex-col gap-5">
          <NotificationWidget notificationData={notificationData} />
        </View>
      </View>
      <StatusBar hidden />
    </SafeAreaView>
  );
};

export default NotificationScreen;
