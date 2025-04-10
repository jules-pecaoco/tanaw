import { View, Text, FlatList, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";

import { useNotification } from "@/context/NotificationContext";

import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = () => {
  const { getNotificationFromDatabase, setNotification } = useNotification();
  const [notificationData, setNotificationData] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifications = await getNotificationFromDatabase();
      setNotificationData(notifications);
    };

    fetchNotifications();
  }, []);

  const addNotification = async () => {
    await setNotification("Heads up!", "A storm warning is in your area 5 seconds interval", {
      schedule: { seconds: 15 },
      data: { type: "hazard", level: "storm" },
    });

    await setNotification("Heads up!", "A storm warning is in your area 1 minute inverval", {
      schedule: { seconds: 60 },
      data: { type: "hazard", level: "storm" },
    });
  };

  const showNotifications = async () => {
    const notifications = await getNotificationFromDatabase();
    setNotificationData(notifications);
    console.log("Notifications:", notifications);
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
      <TouchableOpacity className="absolute bottom-10 right-10 bg-blue-500 p-3 rounded-full" onPress={addNotification}>
        <Text className="text-white">Add Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity className="absolute bottom-10 left-10 bg-blue-500 p-3 rounded-full" onPress={showNotifications}>
        <Text className="text-white">Show Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationScreen;
