// src/screens/ViewReportScreen.js
import React from "react";
import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getImageUrl } from "@/services/supabase";
import useHazardReports from "@/hooks/useHazardReports";

const NewsScreen = () => {
  const { reports, isLoading } = useHazardReports();

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  /**
   * Helper: Get badge color based on hazard type
   * @param {string} hazardType - The type of natural hazard
   * @returns {string} - Hex color code for the badge
   */
  const getBadgeColor = (hazardType) => {
    const colors = {
      typhoon: "#0D47A1", // Dark blue
      flooding: "#1976D2", // Blue
      earthquake: "#FFA000", // Amber
      "volcanic eruption": "#D32F2F", // Red
      landslide: "#795548", // Brown
      tsunami: "#006064", // Dark cyan
      "extreme heat": "#FF6F00", // Orange
      other: "#607D8B", // Blue grey
    };
    return colors[hazardType.toLowerCase()] || colors.other;
  };

  /**
   * Helper: Get text color class based on hazard type background color
   * @param {string} hazardType - The type of natural hazard
   * @returns {string} - CSS class for text color
   */
  const getTextColorClass = (hazardType) => {
    const darkBackgrounds = ["typhoon", "flooding", "volcanic eruption", "landslide", "tsunami"];
    return darkBackgrounds.includes(hazardType.toLowerCase()) ? "text-white" : "text-gray-800";
  };

  const renderItem = async ({ item }) => {
    const hazardType = item.hazard_type.toLowerCase();
    const badgeColor = getBadgeColor(hazardType);
    const textColorClass = getTextColorClass(hazardType);

    return (
      <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
        {/* Hazard Image */}
        {item.image_path && <Image source={{ uri: getImageUrl(item.image_path) }} className="w-full h-48" resizeMode="cover" />}

        {/* Hazard Info Container */}
        <View className="p-4">
          {/* Hazard Type and Timestamp */}
          <View className="flex-column mb-2">
            <View className="flex-row items-center justify-between w-full mb-2">
              <View style={{ backgroundColor: badgeColor }} className="px-3 py-1 rounded-full flex-row items-center">
                <Text className={`font-medium ${textColorClass}`}>{item.hazard_type.charAt(0).toUpperCase() + item.hazard_type.slice(1)}</Text>
              </View>
              <Text className="text-gray-500 text-sm">{getTimeAgo(item.created_at)}</Text>
            </View>
            <Text className="text-gray-500 text-sm text-left w-full ps-2">
              {item.hazard_sub_type.charAt(0).toUpperCase() + item.hazard_sub_type.slice(1)}
            </Text>
          </View>

          {/* Hazard Description */}
          <Text className="text-gray-700 mb-3 text-justify px-2">{item.hazard_description || "No description provided."}</Text>

          {/* Location Info */}
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
      />
    </View>
  );
};

// Helper: Get time ago format
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
