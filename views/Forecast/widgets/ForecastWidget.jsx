import { View, Text, Image, FlatList } from "react-native";
import React from "react";

const Daycast = ({ time, caution, temp, icon }) => {
  return (
    <View className="bg-white w-[95%] p-4 rounded-xl flex flex-row items-center justify-between self-center mb-3">
      <View>
        <Text className="text-2xl font-semibold">{time}</Text>
        <Text className="text-md font-regular">{caution}</Text>
      </View>
      <View className="flex flex-row items-center gap-4">
        <Text className="text-3xl font-medium">{temp}°C</Text>
        {icon && <Image source={{ uri: icon }} style={{ width: 40, height: 40 }} />}
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
        {/* <View className="flex flex-row items-center w-full gap-3">
          <Image source={data.icons.hour}></Image>
          <Text className="font-rregular text-md">Hourly Forecast</Text>
        </View> */}
        {/* TIMESTAMP */}
        {/* <View className="flex flex-row items-center justify-around w-full">
          {data.hourCast.map((item) => (
            <Hourcast key={item.id} time={item.time} temp={item.temp} icon={data.icons.heat} />
          ))}
        </View> */}
      </View>

      {console.log(data)}

      {/* DAY FORECAST */}
      <FlatList
        showsVerticalScrollIndicator={false}
        className="w-full flex"
        data={data?.forecast} 
        renderItem={({ item }) => (
          <Daycast
            time={new Date(item.dt * 1000).toLocaleDateString()} 
            caution={item.weather[0]?.description || "No data"}
            temp={Math.round(item.temp.day)}
            icon={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}.png`}
          />
        )}
        keyExtractor={(item) => item.dt.toString()} 
      />
    </>
  );
};

export default ForecastWidget;
