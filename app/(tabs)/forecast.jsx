import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { React, useState } from "react";
import { testicons } from "@/constants/index";

import CustomButton from "@/components/components/CustomButton";
import { ForecastWidget } from "../../components/widgets/ForecastWidget";

const ForecastData = [
  [
    // DAY CAST
    {
      id: "1",
      time: "Today",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heatindex,
    },
    {
      id: "2",
      time: "Tomorrow",
      caution: "Extreme Caution",
      temp: "40C°",
      icon: testicons.heatindex,
    },
    {
      id: "3",
      time: "Jan 24",
      caution: "Normal",
      temp: "24C°",
      icon: testicons.heatindex,
    },
    {
      id: "4",
      time: "Jan 25",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heatindex,
    },
    {
      id: "5",
      time: "Jan 25",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heatindex,
    },
  ],
  [
    // HOUR CAST
    {
      id: "1",
      time: "Today",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heat,
    },
    {
      id: "2",
      time: "Tomorrow",
      caution: "Extreme Caution",
      temp: "40C°",
      icon: testicons.heat,
    },
    {
      id: "3",
      time: "Jan 24",
      caution: "Normal",
      temp: "24C°",
      icon: testicons.heat,
    },
    {
      id: "4",
      time: "Jan 25",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heat,
    },
    {
      id: "5",
      time: "Jan 25",
      caution: "Caution",
      temp: "35C°",
      icon: testicons.heat,
    },
  ],[
    // ICON
    {
      HourcastIcon: testicons.hour
    }
  ]
];

const Forecast = () => {
  const [active, setActive] = useState("forecast");

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="h-full bg-gray-200 gap-5 flex justify-start items-center">
        {/* TOP */}
        <View className="flex flex-col items-center justify-between bg-white w-full p-4 gap-3">
          {/* DATA */}
          <View className="flex flex-row items-center justify-between w-full px-4">
            <View className="flex flex-col items-start justify-center gap-1 w-1/2">
              <Text className="text-4xl font-rregular">Bacolod City</Text>
              <Text className="text-sm font-rlight">Heat Index</Text>
              <Text className="text-8xl font-rregular">30°</Text>
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


        {/* FORECAST */}
        <ForecastWidget data={ForecastData} />


      </View>

      <StatusBar hidden />
    </SafeAreaView>
  );
};

export default Forecast;
