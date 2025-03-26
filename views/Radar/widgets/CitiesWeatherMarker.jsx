import React from "react";
import { View, Text } from "react-native";
import { MarkerView } from "@rnmapbox/maps";
import { getHeatIndexColor } from "@/utilities/temperatureColorInterpretation";

const CitiesWeatherMarker = ({ cityWeatherData }) => {
  return (
    <>
      {cityWeatherData.map((city) => {
        return (
          <MarkerView key={city.id} id={city.name} coordinate={[city.coord?.Lon ?? city.coord.lon, city.coord?.Lat ?? city.coord.lat]}>
            <View className="flex flex-column items-center">
              <View className="flex flex-row items-center ">
                <Text className="text-white bg-gray-800 text-sm">{city.main?.feels_like ? Math.round(city.main.feels_like) + "°C" : "N/A"}</Text>
                <Text className="text-black " style={{ backgroundColor: getHeatIndexColor(Math.round(city.main?.feels_like || 0)) }}>
                  {city.name}
                </Text>
              </View>
            </View>
          </MarkerView>
        );
      })}
    </>
  );
};

export default CitiesWeatherMarker;
