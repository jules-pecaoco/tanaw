import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Context
import { useNotification } from "@/context/NotificationContext";

// Components
import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = () => {
  const { getNotificationFromDatabase } = useNotification();

  const { data: notificationData = [] } = useQuery({
    queryKey: ["notificationData"],
    queryFn: getNotificationFromDatabase,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

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
    </View>
  );
};

export default NotificationScreen;
