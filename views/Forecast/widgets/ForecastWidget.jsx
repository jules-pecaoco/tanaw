import { View, Text, Image, FlatList } from "react-native";
import React from "react";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
            data={data?.userWeather?.hourly.list}
            renderItem={({ item }) => {
              const forecastDate = new Date(item.dt * 1000);
              const formattedTime = forecastDate.toLocaleTimeString("en-US", {
                hour: "numeric",
              });

              return (
                <Hourcast
                  time={formattedTime}
                  temp={Math.round(item.main.feels_like)}
                  icon={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}.png`}
                ></Hourcast>
              );
            }}
            keyExtractor={(item) => item.dt.toString()}
          />
        </View>
      </View>

      {/* /* DAY FORECAST */}
      <FlatList
        showsVerticalScrollIndicator={false}
        className="w-full flex"
        data={data?.userWeather?.forecast.list}
        renderItem={({ item }) => {
          const forecastDate = new Date(item.dt * 1000);

          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          const options = { month: "short", day: "numeric" };
          let formattedDate = forecastDate.toLocaleDateString("en-US", options);

          let label = "";
          if (forecastDate.toDateString() === today.toDateString()) {
            label = "Today";
          } else if (forecastDate.toDateString() === tomorrow.toDateString()) {
            label = "Tomorrow";
          } else {
            label = formattedDate;
          }
          return (
            <Daycast
              time={label}
              caution={item.weather[0]?.description || "No data"}
              temp={Math.round(item.feels_like.day)}
              icon={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}.png`}
            />
          );
        }}
        keyExtractor={(item) => item.dt.toString()}
      />
    </>
  );
};

export default ForecastWidget;
