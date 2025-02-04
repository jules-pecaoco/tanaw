import { View, Text, Image, FlatList } from "react-native";
import React from "react";

const Daycast = ({ time, caution, temp, icon }) => {
  return (
    <View className="bg-white w-[95%] p-4 justify-between rounded-xl flex flex-row items-center self-center justify-self-center mb-3">
      <View>
        <Text className="text-2xl font-rsemibold">{time}</Text>
        <Text className="text-md font-rregular">{caution}</Text>
      </View>
      <View className="flex flex-row items-center justify-center gap-4">
        <Text className="font-rmedium text-3xl">{temp}</Text>
        <Image source={icon}></Image>
      </View>
    </View>
  );
};

const Hourcast = ({ time, temp, icon }) => {
  return (
    <View className="flex flex-col items-center justify-center gap-2">
      <Text className="text-md font-rregular">{time}</Text>
      <Image source={icon}></Image>
      <Text className="text-md font-rregular">{temp}</Text>
    </View>
  );
};

const ForecastWidget = ({ data }) => {
  return (
    <>
      {/* HOURLY FORECAST */}
      <View className="flex flex-col items-center justify-around bg-white w-[95%] p-4 gap-3 rounded-xl">
        <View className="flex flex-row items-center w-full gap-3">
          <Image source={data.icons.hour}></Image>
          <Text className="font-rregular text-md">Hourly Forecast</Text>
        </View>
        {/* TIMESTAMP */}
        <View className="flex flex-row items-center justify-around w-full">
          {data.hourCast.map((item) => (
            <Hourcast key={item.id} time={item.time} temp={item.temp} icon={data.icons.heat} />
          ))}
        </View>
      </View>

      {/* DAY FORECAST */}
      <FlatList
        showsVerticalScrollIndicator={false}
        className="w-full flex"
        data={data.dayCast}
        renderItem={({ item }) => <Daycast time={item.time} caution={item.caution} temp={item.temp} icon={data.icons.heatindex} />}
        keyExtractor={(item) => item.id}
      />
    </>
  );
};

export default ForecastWidget;
