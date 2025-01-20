import { Image, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { icons } from "@/constants/index";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Location from "expo-location";

import { userPermissionStore } from "@/context/userPermissionStore";
import CustomButton from "@/components/components/CustomButton";

const Geolocation = () => {
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      userPermissionStore.setItem("location", "false");
      router.push("/notification");
      return;
    }

    // CURRENT LCOATION
    let location = await Location.getCurrentPositionAsync({});
    userPermissionStore.setItem("location", JSON.stringify(location));
    router.push("/notification");
  };

  return (
    <>
      <SafeAreaView className="h-full">
        <LinearGradient locations={[0, 0.4]} className="h-full" colors={["#FFFFFF", "#3c454c"]}>
          <View className="h-full">
            <View className="h-2/5"></View>
            <View className="h-2/4 flex items-center justify-center gap-5 mt-10 ">
              <Image source={icons.gps} resizeMethod="contain"></Image>
              <View className="gap-3 flex mb-16">
                <Text className="text-gray-400  font-rbold text-sm text-center">LOCATION PERMISSION</Text>
                <Text className="text-white font-rbold text-4xl text-center">Enable Location for Hyper-Local Updates</Text>
                <Text className="text-gray-400 font-rregular text-center text-sm px-5">
                  We need your location to provide accurate, real-time updates for your area. From monitoring current conditions to alerting you about
                  risks nearby, it’s all about keeping you safe. Don't worry, your location stays private and secure with us!
                </Text>
                <View className="flex gap-3 justify-center items-center flex-row">
                  <View className="bg-white w-10 h-1 rounded-md"></View>
                  <View className="bg-gray-500 w-10 h-1 rounded-md"></View>
                </View>
              </View>

              <CustomButton
                handlePress={() => getCurrentLocation()}
                title="Next"
                containerStyles="h-fit w-10/12"
                textStyles="bg-white text-center py-3 rounded-xl font-semibold bg"
              />
            </View>
          </View>
        </LinearGradient>
        <StatusBar backgroundColor="#ffffff" style="light"></StatusBar>
      </SafeAreaView>
    </>
  );
};

export default Geolocation;
