import { View, Text, FlatList, ScrollView } from "react-native";
import React from "react";
import storage from "@/storage/storage"

import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = ({ notificationData }) => {
  console.log(storage.getItem("react-query-full-cache"));

  return (
    <View className="h-full bg-white">
      <View className="w-full bg-white py-5">
        <Text className="text-center font-rmedium text-3xl">Notifications</Text>
      </View>
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        <View className="w-[95%] h-[100%] flex flex-col gap-5 mt-5">
          <NotificationWidget notificationData={notificationData} />
        </View>
      </View>
    </View>
  );
};

export default NotificationScreen;
