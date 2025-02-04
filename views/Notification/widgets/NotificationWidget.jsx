import { View, Text, Image, Pressable, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";

import Entypo from "@expo/vector-icons/Entypo";

const NotificationInfo = ({ data, icon }) => {
  const [press, setPress] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => setPress(!press)}>
      <View className="bg-white flex flex-col items-center justify-between gap-2 rounded-lg p-5 w-[95%] self-end">
        <View className="flex flex-row items-center gap-2 w-full justify-between">
          <View className="flex flex-row items-center gap-2">
            <Image source={icon} />
            <Text className="font-rlight text-5xl">|</Text>
            <Text className="font-rbold text-2xl">{data.title}</Text>
            <Text className="font-rbold text-2xl">:</Text>
            <Text className="font-rsemibold text-2xl">{data.temperature}</Text>
          </View>
          {press ? <Entypo name="chevron-up" size={24} color="black" /> : <Entypo name="chevron-down" size={24} color="black" />}
        </View>
        {press && (
          <View className="flex flex-col gap-2 w-full">
            <Text className="font-rregular text-lg w-full text-justify">{data.information}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const NotificationWidget = ({ notificationData }) => {
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={notificationData}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => {
        const currentItemDate = new Date(item.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        const currentDate = new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });

        const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });
        return (
          <View className="flex flex-col gap-4 w-full mb-10">
            <Text className="font-rregular text-base">
              {(currentItemDate === currentDate ? "Today, " : currentItemDate === yesterdayDate ? "Yesterday, " : "") + currentItemDate}
            </Text>
            {item.notifications.map((data) => (
              <NotificationInfo key={data.id} data={data} icon={item.icon} />
            ))}
          </View>
        );
      }}
    />
  );
};

export default NotificationWidget;
