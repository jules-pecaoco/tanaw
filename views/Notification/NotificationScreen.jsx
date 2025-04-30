import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";

// Context
import { useNotification } from "@/context/NotificationContext";

// Service
import { clearAllNotifications, fetchNotifications } from "@/services/sqlite";
import { isWeatherTaskRegistered } from "@/services/weatherTaskManager";

// Components
import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = () => {
  const { getNotificationFromDatabase, getPendingNotifications, cancelAllNotifications, setNotification } = useNotification();
  const [notificationData, setNotificationData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setRefreshing(true);
    try {
      const notifications = await getNotificationFromDatabase();
      setNotificationData(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleClearAllNotifications = async () => {
    await cancelAllNotifications();
    await clearAllNotifications();
    loadNotifications();
  };

  const notificationLogs = async () => {
    const logs = await getPendingNotifications();
    const sqliteLogs = await fetchNotifications();
    const weatherTaskRegistered = await isWeatherTaskRegistered();
    console.log("Weather Task Registered: ", weatherTaskRegistered);
    console.log("Sqlites Notifications: ", sqliteLogs);
    console.log("Notification Logs: ", logs);
  };

  const addNotificationAlert = async () => {
    const currentDate = new Date();
    const notificationDate = new Date(currentDate.getTime() +  10 * 1000); 
    const isoDate = notificationDate.toISOString();
    await setNotification(
      "Extreme Caution Alert",
      "This is Alert for Extreme Caution",
      { offsetHours: 0, data: { type: "alert", weatherType: "heat" } },
      isoDate
    );
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
        <TouchableOpacity className=" bg-blue-500 p-2 rounded-full" onPress={addNotificationAlert}>
          <Text className="text-white text-sm">Test Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationScreen;
