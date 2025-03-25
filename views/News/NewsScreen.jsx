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
        <Text>Loading reports...</Text>
      </View>
    );
  }

  // Helper: Get badge color based on hazard type
  const getBadgeColor = (hazardType) => {
    const colors = {
      flood: "#1976D2",
      fire: "#D32F2F",
      storm: "#7B1FA2",
      landslide: "#795548",
      earthquake: "#FFA000",
      other: "#607D8B",
    };
    return colors[hazardType] || colors.other;
  };

  const getTextColorClass = (hazardType) => {
    const darkBackgrounds = ["fire", "storm", "landslide"];
    return darkBackgrounds.includes(hazardType.toLowerCase()) ? "text-white" : "text-gray-800";
  };

  const renderItem = ({ item }) => {
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
          <View className="flex-row justify-between items-center mb-2">
            <View style={{ backgroundColor: badgeColor }} className="px-3 py-1 rounded-full">
              <Text className={`font-medium ${textColorClass}`}>{item.hazard_type.charAt(0).toUpperCase() + item.hazard_type.slice(1)}</Text>
            </View>
            <Text className="text-gray-500 text-sm">{getTimeAgo(item.created_at)}</Text>
          </View>

          {/* Hazard Description */}
          <Text className="text-gray-700 mb-3">{item.description || "No description provided."}</Text>

          {/* Location Info */}
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text className="text-gray-600 text-sm ml-1">
              Location: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={reports}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerClassName="p-4"
      showsVerticalScrollIndicator={false}
    />
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
