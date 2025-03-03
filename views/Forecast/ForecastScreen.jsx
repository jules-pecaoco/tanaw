import { View, Text, Image } from "react-native";
import { React, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { testicons } from "@/constants/index";
import { AnalyticsData, ForecastData, CurrentLocation } from "@/data/sampleData";
import { fetchUserWeather } from "@/services/userWeatherAPI";
import CustomButton from "@/views/components/CustomButton";
import ForecastWidget from "@/views/Forecast/widgets/ForecastWidget";
import AnalyticsWidget from "@/views/Forecast/widgets/AnalyticsWidget";
import TrendsWidget from "@/views/Forecast/widgets/TrendsWidget";
import userStorage from "@/storage/userStorage";

const ForecastScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const location = JSON.parse(userStorage.getItem("userLocation"));
      if (location && location.coords) {
        return { latitude: location.coords.latitude, longitude: location.coords.longitude };
      }
    } catch (error) {
      return { latitude: 10.65709, longitude: 122.948 };
    }
  });

  const [active, setActive] = useState("forecast");
  ForecastData.icons = {
    heat: testicons.heat,
    heatindex: testicons.heatindex,
    hour: testicons.hour,
  };

  const {
    data: userWeather,
    isLoading: isLoadingUserWeather,
    error: isErrorUserWeather,
  } = useQuery({
    queryKey: ["userWeather"],
    queryFn: () => fetchUserWeather({ currentLocation }),
  });

  

  return (
    <View className="flex-1 bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        {/* TOP */}
        <View className="flex flex-col items-center justify-between bg-white w-full p-4 gap-3">
          {/* DATA */}
          <View className="flex flex-row items-center justify-between w-full px-4">
            <View className="flex flex-col items-start justify-center gap-1 w-1/2">
              <Text className="text-4xl font-rregular">{CurrentLocation.location}</Text>
              <Text className="text-sm font-rlight">Heat Index</Text>
              <Text className="text-8xl font-rregular">{CurrentLocation.weather}</Text>
            </View>
            <View className="flex flex-col items-end gap-1 w-1/2">
              <Image source={testicons.sun} className="w-24 h-24"></Image>
            </View>
          </View>

          {/* FILTERS */}
          <View className="flex flex-row items-center justify-between w-full px-4 self-end justify-self-end gap-2 ">
            <CustomButton
              title="Forecast"
              handlePress={() => setActive("forecast")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "forecast" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>

            <CustomButton
              title="Analytics"
              handlePress={() => setActive("analytics")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "analytics" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>

            <CustomButton
              title="Trends"
              handlePress={() => setActive("map")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "map" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>
          </View>
        </View>

        {/* FILTERS */}
        {active == "forecast" ? (
          <ForecastWidget data={{userWeather}} />
        ) : active == "analytics" ? (
          <AnalyticsWidget data={AnalyticsData} />
        ) : (
          <TrendsWidget data="Bacolod City" />
        )}
      </View>
    </View>
  );
};

export default ForecastScreen;
