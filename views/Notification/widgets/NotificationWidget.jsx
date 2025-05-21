import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { formatDateTime } from "@/utilities/formatDateTime";

const NotificationCard = ({ item, dateLabel }) => {
  const [expanded, setExpanded] = useState(false);

  const getIconForWeatherType = (weatherType) => {
    switch (weatherType?.toLowerCase()) {
      case "heat":
        return <MaterialCommunityIcons name="weather-sunny-alert" size={24} color="#FFA500" />;
      case "rain":
        return <MaterialCommunityIcons name="weather-pouring" size={24} color="#3B82F6" />;
      default:
        return <MaterialCommunityIcons name="bell-ring-outline" size={24} className="text-blue-500" />;
    }
  };
  const iconToRender = getIconForWeatherType(item.data?.weatherType);

  return (
    <View className="bg-white rounded-xl shadow-sm mx-1 mb-4">
      <TouchableOpacity activeOpacity={0.8} onPress={() => setExpanded(!expanded)} className="p-4">
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="mr-3 p-2 bg-blue-50 rounded-full">{iconToRender}</View>

            <View className="flex-1">
              <Text className="font-rbold text-base text-gray-800" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="font-rregular text-xs text-gray-500 mt-1">
                {dateLabel.date}, {dateLabel.detailed_time}
              </Text>
            </View>
          </View>
          {expanded ? (
            <Entypo name="chevron-up" size={24} className="text-gray-500" />
          ) : (
            <Entypo name="chevron-down" size={24} className="text-gray-500" />
          )}
        </View>

        {expanded && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="font-rregular text-sm text-gray-700 text-justify leading-relaxed">{item.body}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const NotificationWidget = ({ notificationData, onRefresh, refreshing }) => {
  if (!notificationData) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const activeNotifications = notificationData
    .filter((item) => new Date(item.timestamp).getTime() <= new Date().getTime())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const renderItem = ({ item }) => {
    const dateLabel = formatDateTime(item.timestamp);
    return <NotificationCard item={item} dateLabel={dateLabel} />;
  };

  return (
    <FlatList
      data={activeNotifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 90 }}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center mt-52">
          <MaterialCommunityIcons name="bell-off-outline" size={48} className="text-gray-400 mb-3" />
          <Text className="font-rmedium text-lg text-gray-600">No Notifications</Text>
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#F47C25"]} tintColor={"#F47C25"} />}
    />
  );
};

export default NotificationWidget;
