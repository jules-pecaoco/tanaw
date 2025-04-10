import { View, Text, Image, FlatList } from "react-native";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import formatDateTime from "@/utilities/formatDateTime";

const Daycast = ({ time, caution, temp, icon }) => {
  return (
    <View className="bg-white w-[95%] p-4 rounded-xl flex flex-row items-center justify-between self-center mb-3">
      <View>
        <Text className="text-2xl font-rmedium">{time}</Text>
        <Text className="text-md font-rregular">{caution}</Text>
      </View>
      <View className="flex flex-row items-center gap-4">
        <Text className="text-4xl font-rregular">{temp}°C</Text>
        {icon && <Image className="size-16" source={{ uri: icon }} />}
      </View>
    </View>
  );
};

const Hourcast = ({ time, temp, icon }) => {
  return (
    <View className="flex flex-col items-center justify-center gap-2 mr-8">
      <Text className="text-md font-rregular">{time}</Text>
      {icon && <Image className="size-10" source={{ uri: icon }} />}
      <Text className="text-md font-rregular">{temp}°C</Text>
    </View>
  );
};

const ForecastWidget = ({ data }) => {
  console.log("ForecastWidget data: ", data);
  if (!data) return null; // Return null if data is not available
  return (
    <>
      {/* HOURLY FORECAST */}
      <View className="flex flex-col items-center justify-around bg-white w-[95%] p-4 gap-3 rounded-xl">
        <View className="flex flex-row items-center w-full gap-3">
          <MaterialCommunityIcons name="clock-time-eight-outline" size={24} color="black" />
          <Text className="font-rregular text-md">Hourly Forecast</Text>
        </View>
        {/* TIMESTAMP */}
        <View className="flex flex-row items-center justify-around w-full">
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            className="w-full flex"
            data={data?.userWeatherOneCall?.hourly}
            renderItem={({ item }) => {
              const label = formatDateTime(item.time).time;
              return (
                <Hourcast
                  time={label}
                  temp={Math.round(item.heat_index)}
                  icon={`https://openweathermap.org/img/wn/${item.weather?.icon}.png`}
                ></Hourcast>
              );
            }}
            keyExtractor={(item) => item.time}
          />
        </View>
      </View>

      {/* /* DAY FORECAST */}
      <FlatList
        showsVerticalScrollIndicator={false}
        className="w-full flex"
        data={data?.userWeatherOneCall?.daily}
        renderItem={({ item }) => {
          const label = formatDateTime(item.time).date;
          return (
            <Daycast
              time={label}
              caution={item.weather?.description || "No data"}
              temp={Math.round(item.heat_index)}
              icon={`https://openweathermap.org/img/wn/${item.weather?.icon}.png`}
            />
          );
        }}
        keyExtractor={(item) => item.time}
      />
    </>
  );
};

export default ForecastWidget;
