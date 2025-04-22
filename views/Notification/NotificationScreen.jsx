import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Context
import { useNotification } from "@/context/NotificationContext";

// Service
import { clearAllNotifications } from "@/services/sqlite";

// Components
import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = () => {
  const { getNotificationFromDatabase, getPendingNotifications, cancelAllNotifications } = useNotification();

  const { data: notificationData = [] } = useQuery({
    queryKey: ["notificationData"],
    queryFn: getNotificationFromDatabase,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const notificationLogs = async () => {
    const logs = await getPendingNotifications();
    console.log("Notification Logs: ", logs);
  };

  return (
    <View className="h-full bg-white">
      <View className="w-full bg-white py-5">
        <Text className="text-center font-rmedium text-3xl">Notifications</Text>
      </View>
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        <View className="w-[95%] h-[90%] flex flex-col gap-5 mt-5">
          <NotificationWidget notificationData={notificationData} />
        </View>
      </View>
      <View className="absolute bottom-10 right-10 flex flex-row gap-5">
        <TouchableOpacity className=" bg-blue-500 p-1 rounded-full" onPress={clearAllNotifications}>
          <Text className="text-white text-sm">Clear SQLite</Text>
        </TouchableOpacity>
        <TouchableOpacity className=" bg-blue-500 p-1 rounded-full" onPress={cancelAllNotifications}>
          <Text className="text-white text-sm">Clear Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity className=" bg-blue-500 p-1 rounded-full" onPress={notificationLogs}>
          <Text className="text-white text-sm">Log Notification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationScreen;
