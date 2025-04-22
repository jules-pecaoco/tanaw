import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { formatDateTime } from "@/utilities/formatDateTime";

const NotificationCard = ({ item, dateLabel }) => {
  const [press, setPress] = useState(false);

  return (
    <>
      <Text className="font-rregular text-base">
        {dateLabel.date}, {dateLabel.detailed_time}
      </Text>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setPress(!press)}>
        <View className="bg-white flex flex-col items-center justify-between gap-2 rounded-lg p-5 w-[95%] self-end">
          <View className="flex flex-row items-center gap-2 w-full justify-between">
            <View className="flex flex-row items-center gap-2">
              <MaterialCommunityIcons name="weather-sunny" size={24} color="black" />
              <Text className="font-rlight text-5xl">|</Text>
              <Text className="font-rbold text-2xl">{item.title}</Text>
            </View>
            {press ? <Entypo name="chevron-up" size={24} color="black" /> : <Entypo name="chevron-down" size={24} color="black" />}
          </View>
          {press && (
            <View className="flex flex-col gap-2 w-full">
              <Text className="font-rregular text-lg w-full text-justify">{item.body}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
};

const NotificationWidget = ({ notificationData }) => {
  console.log("Notification Data Widget:", notificationData);
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={notificationData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const dateLabel = formatDateTime(item.timestamp);
        console.log(dateLabel.detailed_time);
        // only render a component that is before or on the current date and time
        if (new Date(item.timestamp).getTime() > new Date().getTime()) {
          return null;
        }

        return (
          <View className="flex flex-col gap-4 w-full mb-10">
            <NotificationCard item={item} dateLabel={dateLabel} />
          </View>
        );
      }}
    />
  );
};

export default NotificationWidget;
