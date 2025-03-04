import { View, Text, Image, FlatList } from "react-native";
import React from "react";


const CitiesComponent = ({ city, temp, warning, icon }) => {
  return (
    <View className="bg-white w-[95%] p-4 justify-between rounded-xl flex flex-row items-center self-center mb-3">
      <View>
        <Text className="text-2xl font-rsemibold">{city}</Text>
        <Text className="text-md font-rregular">{warning}</Text>
      </View>
      <View className="flex flex-row items-center justify-center gap-4">
        <Text className="font-rmedium text-3xl">{Math.round(temp)}°C</Text>
        <Image className="w-12 h-12" source={{ uri: icon }} />
      </View>
    </View>
  );
};

const TrendsWidget = ({ data }) => {
  if (data.negrosWeather) {
    data.negrosWeather.sort((a, b) => b.main.feels_like - a.main.feels_like);
  }
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={data.negrosWeather}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CitiesComponent
          city={item.name}
          temp={item.main.feels_like}
          warning={item.weather[0]?.description || "No data"}
          icon={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}.png`}
        />
      )}
    />
  );
};

export default TrendsWidget;
