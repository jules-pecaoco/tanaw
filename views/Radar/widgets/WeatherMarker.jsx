import React from "react";
import { View, Text } from "react-native";
import { MarkerView } from "@rnmapbox/maps";
import { getHeatIndexColor } from "@/utilities/temperatureColorInterpretation";

const WeatherMarker = ({ negrosWeather, proximityWeather, radius }) => {
  const data = radius === "Proximity" ? proximityWeather : negrosWeather;
  return (
    <>
      {data.map((city) => {
        return (
          <MarkerView key={city.id} id={city.city} coordinate={[city.coords.lon, city.coords.lat]}>
            <View className="flex flex-column items-center">
              <View className="flex flex-row items-center ">
                <Text className="text-white bg-gray-800 text-sm">{Math.round(city.heat_index) + "°C"}</Text>
                <Text className="text-black w-fit" style={{ backgroundColor: getHeatIndexColor(Math.round(city.heat_index)) }}>
                  {city.city}
                </Text>
              </View>
            </View>
          </MarkerView>
        );
      })}
    </>
  );
};

export default WeatherMarker;
