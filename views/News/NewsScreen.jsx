// src/screens/ViewReportScreen.js
import React, { useState, useCallback } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getImageUrl } from "@/services/supabase";
import useHazardReports from "@/hooks/useHazardReports";

const NewsScreen = () => {
  const { reports, reportsIsLoading, refetch } = useHazardReports();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refetch) {
      try {
        await refetch();
      } catch (error) {
        console.error("Error refetching reports:", error);
      } finally {
        setRefreshing(false);
      }
    } else {
      console.warn("Refetch function is not available on useHazardReports. Refresh functionality may be limited.");
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [refetch]);

  if (reportsIsLoading && (!reports || reports.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center">
        {" "}
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const getBadgeColor = (hazardType) => {
    const colors = {
      typhoon: "#0D47A1",
      flooding: "#1976D2",
      earthquake: "#FFA000",
      "volcanic eruption": "#D32F2F",
      landslide: "#795548",
      tsunami: "#006064",
      "extreme heat": "#FF6F00",
      other: "#607D8B",
    };
    return colors[hazardType.toLowerCase()] || colors.other;
  };

  const getTextColorClass = (hazardType) => {
    const darkBackgrounds = ["typhoon", "flooding", "volcanic eruption", "landslide", "tsunami"];
    return darkBackgrounds.includes(hazardType.toLowerCase()) ? "text-white" : "text-gray-800";
  };

  const renderItem = ({ item }) => {
    const hazardType = item.hazard_type.toLowerCase();
    const badgeColor = getBadgeColor(hazardType);
    const textColorClass = getTextColorClass(hazardType);

    return (
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        {item.image_path && <Image source={{ uri: getImageUrl(item.image_path) }} className="w-full h-48" resizeMode="cover" />}

        <View className="p-4">
          <View className="flex-col mb-2">
            <View className="flex-row items-center justify-between w-full mb-2">
              <View style={{ backgroundColor: badgeColor }} className="px-3 py-1 rounded-full flex-row items-center">
                <Text className={`font-rmedium ${textColorClass}`}>{item.hazard_type.charAt(0).toUpperCase() + item.hazard_type.slice(1)}</Text>
              </View>
              <Text className="text-gray-500 text-sm">{getTimeAgo(item.created_at)}</Text>
            </View>
            <Text className="text-gray-500 text-sm text-left w-full ps-2">
              {item.hazard_sub_type.charAt(0).toUpperCase() + item.hazard_sub_type.slice(1)}
            </Text>
          </View>

          <Text className="text-gray-700 mb-3 text-justify px-2">{item.hazard_description || "No description provided."}</Text>

          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text className="text-gray-600 text-sm ml-1">
              Location: {item.name.locality || "Unknown"}, {item.name.region || "Unknown"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="pb-36">
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F47C25"]} tintColor={"#F47C25"} />}
      />
    </View>
  );
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const reportDate = new Date(dateString);
  const diffMs = now - reportDate;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
};

export default NewsScreen;
