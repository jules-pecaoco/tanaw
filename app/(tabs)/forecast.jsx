import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import {React, useState} from "react";
import { data_icons } from "@/constants/index";

const Forecast = () => {
  const [active, setActive] = useState('forecast');

  return (
    <SafeAreaView >
      <View className="h-full flex items-center justify-between bg-gray-200 mt-5">

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
              <Image source={data_icons.sun} className="w-24 h-24"></Image>
            </View>
          </View>

          {/* FILTERS */}
          <View className="flex flex-row items-center justify-between w-full px-4 self-end justify-self-end gap-2 ">

            {/* Custom Button | FORECAST*/}
            <View className={`h-fit w-[30%]`}>
              <TouchableOpacity className="" activeOpacity={0.7} onPress={() => setActive("forecast")}>
                <Text className={`text-center py-3 rounded-xl text-white font-rmedium ${active == 'forecast' ? 'bg-primary' : 'bg-secondary'}`}>Forecast</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Button | FORECAST*/}
            <View className={`h-fit w-[30%]`}>
              <TouchableOpacity className="" activeOpacity={0.7} onPress={() => setActive("analytics")}>
                <Text className={`text-center py-3 rounded-xl text-white font-rmedium ${active == 'analytics' ? 'bg-primary' : 'bg-secondary'}`}>Analytics</Text>
              </TouchableOpacity>
            </View>


            {/* Custom Button | FORECAST*/}
            <View className={`h-fit w-[30%]`}>
              <TouchableOpacity className="" activeOpacity={0.7} onPress={() => setActive("cities")}>
                <Text className={`text-center py-3 rounded-xl text-white font-rmedium ${active == 'cities' ? 'bg-primary' : 'bg-secondary'}`}>Cities</Text>
              </TouchableOpacity>
            </View>


          </View>
        </View>

        {/* HOURLY FORECAST */}
        <View>
          
        </View>

        {/* DAY FORECAST */}
      </View>
      <StatusBar backgroundColor="#ffffff" style="light"></StatusBar>
    </SafeAreaView>
  );
};

export default Forecast;
