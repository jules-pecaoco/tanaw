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
    <View className="bg-gray-200 h-full flex items-center justify-center">
      <NotificationWidget notificationData={notificationData} onRefresh={loadNotifications} refreshing={refreshing} />
    </View>
  );
};

export default NotificationScreen;
