import React from "react";
import { View, Text } from "react-native";
import { MarkerView } from "@rnmapbox/maps";

const CitiesWeatherMarker = ({ negrosWeather }) => {
  return (
    <>
      {negrosWeather.map((city) => (
        <MarkerView key={city.id} id={city.name} coordinate={[city.coord.Lon, city.coord.Lat]}>
          <View className="flex flex-row">
            <View className="bg-black">
              <Text className="text-white">{Math.round(city.main.feels_like)}°C</Text>
            </View>
            <View className="bg-primary">
              <Text className="text-black">{city.name}</Text>
            </View>
          </View>
        </MarkerView>
      ))}
    </>
  );
};

export default CitiesWeatherMarker;
