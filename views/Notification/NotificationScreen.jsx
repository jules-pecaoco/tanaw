import { View, Text, TouchableOpacity, RefreshControl } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import useNotification from "@/hooks/useNotification";
import { clearAllNotifications, fetchNotifications } from "@/services/sqlite";
import { isWeatherTaskRegistered } from "@/services/weatherTaskManager";
import NotificationWidget from "./widgets/NotificationWidget";

const NotificationScreen = () => {
  const { getNotificationFromDatabase, getPendingNotifications, cancelAllNotifications, setNotification } = useNotification();
  const [notificationData, setNotificationData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      const notifications = await getNotificationFromDatabase();
      setNotificationData(notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getNotificationFromDatabase]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  const addExtremeHeatAlert = async () => {
    const currentDate = new Date();
    const notificationDate = new Date(currentDate.getTime() + 10 * 1000);
    const isoDate = notificationDate.toISOString();
    await setNotification(
      "Extreme Caution Alert",
      "This is an Alert for Extreme Caution. Please take necessary precautions immediately.",
      { offsetHours: 0, data: { type: "alert", weatherType: "heat" } },
      isoDate
    );
  };

  const addExtremeRainAlert = async () => {
    const currentDate = new Date();
    const notificationDate = new Date(currentDate.getTime() + 10 * 1000);
    const isoDate = notificationDate.toISOString();
    await setNotification(
      "Extreme Rainfall Alert",
      "This is an Alert for Extreme Rainfall. Please take necessary precautions immediately.",
      { offsetHours: 0, data: { type: "alert", weatherType: "rain" } },
      isoDate
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white px-4 py-5 items-center justify-center">
        <Text className="font-rmedium text-2xl text-gray-800">Notifications</Text>
      </View>

      <View className="flex-1 bg-gray-100 px-3 pt-4">
        <NotificationWidget notificationData={notificationData} onRefresh={loadNotifications} refreshing={refreshing} />
      </View>

      <TouchableOpacity
        className="absolute bottom-6 right-5 bg-primary p-4 rounded-full shadow-lg active:bg-primary"
        onPress={addExtremeHeatAlert}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons name="alert" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        className="absolute bottom-6 right-24 bg-blue-500 p-4 rounded-full shadow-lg active:bg-blue-600"
        onPress={addExtremeRainAlert}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons name="alert" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NotificationScreen;
