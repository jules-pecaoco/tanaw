import { View, Text, Image, ActivityIndicator } from "react-native";
import { React, useState, useEffect } from "react"; // Import useEffect
import { useQuery } from "@tanstack/react-query";

// API Services
import { fetchOneCallWeather } from "@/services/openweather";

// Components
import CustomButton from "@/views/components/CustomButton";
import ForecastWidget from "@/views/Forecast/widgets/ForecastWidget";
import AnalyticsWidget from "@/views/Forecast/widgets/AnalyticsWidget";
import UserReportWidget from "@/views/Forecast/widgets/UserReportWidget";
import useLocation from "@/hooks/useLocation";

const ForecastScreen = () => {
  const { location } = useLocation();
  const [currentLocation, setCurrentLocation] = useState(() => {
    if (location) {
      return { latitude: location.latitude, longitude: location.longitude };
    }
    return { latitude: 10.65709, longitude: 122.948 };
  });

  const [active, setActive] = useState("forecast");

  const {
    data: userWeatherOneCall,
    isLoading: isLoadingUserWeatherOneCall,
    error: isErrorUserWeatherOneCall,
  } = useQuery({
    queryKey: ["userWeatherOneCall"],
    queryFn: () => fetchOneCallWeather({ currentLocation }),
    staleTime: 1000 * 60 * 60 * 3, //3 hours
    gcTime: 1000 * 60 * 60 * 6, //6 hours
  });

  if (isLoadingUserWeatherOneCall) return <ActivityIndicator size="large" color="#FF8C00" className="flex-1" />;
  console.log("User Weather OneCall: ", userWeatherOneCall);

  return (
    <View className="flex-1 bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        {/* TOP */}
        <View className="flex flex-col items-center justify-between bg-white w-full p-4 gap-3">
          {/* DATA */}
          <View className="flex flex-row items-center justify-between w-full px-4">
            <View className="flex flex-col items-start justify-center gap-1 w-1/2">
              <Text className="text-4xl font-rregular">
                {userWeatherOneCall?.name?.locality ?? "Bacolod"}, {userWeatherOneCall?.name?.region ?? "Negros Occidental"}
              </Text>
              <Text className="text-sm font-rlight">Heat Index</Text>
              <Text className="text-7xl font-rregular">{Math.round(userWeatherOneCall?.current?.heat_index) ?? "-"}°C</Text>
            </View>
            <View className="flex flex-col items-end gap-1 w-1/2">
              {userWeatherOneCall?.current?.weather?.icon && (
                <Image
                  source={{
                    uri: userWeatherOneCall?.current?.weather?.icon,
                  }}
                  className="size-32"
                />
              )}
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
              title="User Report"
              handlePress={() => setActive("userreport")}
              containerStyles="h-fit w-[30%]"
              textStyles={`text-center py-3 rounded-xl text-white font-rmedium ${active == "userreport" ? "bg-primary" : "bg-secondary"}`}
            ></CustomButton>
          </View>
        </View>

        {/* FILTERS */}
        <View className="flex-1">
          {active == "forecast" ? (
            <ForecastWidget data={{ userWeatherOneCall }} />
          ) : active == "analytics" ? (
            <AnalyticsWidget data={{}} />
          ) : active == "userreport" ? (
            <UserReportWidget data={{}} />
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default ForecastScreen;
