import { View, Text, Image, ActivityIndicator } from "react-native";
import { React, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchNegrosWeather } from "@/services/citiesWeatherAPI";
import { fetchUserWeather } from "@/services/userWeatherAPI";
import CustomButton from "@/views/components/CustomButton";
import ForecastWidget from "@/views/Forecast/widgets/ForecastWidget";
import AnalyticsWidget from "@/views/Forecast/widgets/AnalyticsWidget";
import TrendsWidget from "@/views/Forecast/widgets/TrendsWidget";
import userStorage from "@/storage/userStorage";

const ForecastScreen = () => {
  console.log("ForecastScreen");
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

  const {
    data: userWeather,
    isLoading: isLoadingUserWeather,
    error: isErrorUserWeather,
  } = useQuery({
    queryKey: ["userWeather"],
    queryFn: () => fetchUserWeather({ currentLocation }),
    staleTime: 1000 * 60 * 60 * 3,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  const {
    data: negrosWeather,
    isLoading: isLoadingNegrosWeather,
    error: isErrorNegrosWeather,
  } = useQuery({
    queryKey: ["negrosWeatherData"],
    queryFn: fetchNegrosWeather,
    gcTime: 1000 * 60 * 60 * 6,
    staleTime: 1000 * 60 * 60 * 3,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  let closestHour = null;

  if (!isLoadingUserWeather && userWeather) {
    const userCurrentHour = new Date().getHours();

    closestHour = userWeather.hourly.list.reduce((prev, curr) => {
      const currHour = new Date(curr.dt * 1000).getHours();
      return Math.abs(currHour - userCurrentHour) < Math.abs(new Date(prev.dt * 1000).getHours() - userCurrentHour) ? curr : prev;
    });
  }

  if (isLoadingUserWeather || isLoadingNegrosWeather) return <ActivityIndicator size="large" color="#000" className="flex-1" />;

  return (
    <View className="flex-1 bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        {/* TOP */}
        <View className="flex flex-col items-center justify-between bg-white w-full p-4 gap-3">
          {/* DATA */}
          <View className="flex flex-row items-center justify-between w-full px-4">
            <View className="flex flex-col items-start justify-center gap-1 w-1/2">
              <Text className="text-4xl font-rregular">{userWeather?.hourly.city.name}</Text>
              <Text className="text-sm font-rlight">Heat Index</Text>
              <Text className="text-7xl font-rregular">
                {Math.round(closestHour?.main?.feels_like ?? userWeather?.hourly?.list[0]?.main?.feels_like)}°C
              </Text>
            </View>
            <View className="flex flex-col items-end gap-1 w-1/2">
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${closestHour?.weather[0].icon ?? userWeather?.hourly.list[0]?.weather[0].icon}.png`,
                }}
                className="size-32"
              ></Image>
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
          <ForecastWidget data={{ userWeather }} />
        ) : active == "analytics" ? (
          <AnalyticsWidget data={{}} />
        ) : (
          <TrendsWidget data={{ negrosWeather }} />
        )}
      </View>
    </View>
  );
};

export default ForecastScreen;
