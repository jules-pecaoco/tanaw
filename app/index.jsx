import { Image, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { images } from "../constants/index";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { userPermissionStore } from "@/context/userPermissionStore";
import { useEffect } from "react";
// import CustomButton from "@/components/CustomButton";

export default function Index() {
  // TODO--------------
  // Render directly to home after first permissions

  useEffect(() => {
    const checkPermissions = () => {
      const location = userPermissionStore.getItem("location");
      const expoPushToken = userPermissionStore.getItem("expoPushToken");

      console.log(location, expoPushToken);
      if (location || expoPushToken) {
        router.replace("/radar");
      }
    };

    setTimeout(checkPermissions, 0);
  }, []);

  return (
    <>
      <SafeAreaView>
        <LinearGradient locations={[0.05, 0.1, 0.4, 0.6]} className="h-full" colors={["#E84E4C", "#f47c25", "#FFFFFF", "#3c454c"]}>
          <View className="h-full">
            <View className="h-2/5"></View>
            <View className="h-2/4 flex items-center justify-center gap-5 mt-10">
              <Image source={images.tanawLogoWhite} resizeMethod="contain"></Image>
              <View className="gap-3 flex mb-16">
                <Text className="text-gray-400  font-rbold text-sm text-center">WELCOME</Text>
                <Text className="text-white font-rbold text-4xl text-center">On top of the risks, so you don’t have to be!</Text>
                <Text className="text-gray-400 font-rregular text-center text-sm px-5">
                  Welcome to Tanaw, your essential tool for monitoring heat index levels and flood risks in your area. Be prepared, stay informed, and
                  protect your community.
                </Text>
                <Text className="text-gray-400 font-rregular text-center text-sm">Start you setup in 2 easy steps</Text>
              </View>

              {/* Custom Button */}
              <View className={`h-fit w-10/12`}>
                <TouchableOpacity className="" onPress={() => router.push("/geolocation")} activeOpacity={0.7}>
                  <Text className={`bg-white text-center py-3 rounded-xl font-semibold`}>Let's Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
        <StatusBar backgroundColor="#E84E4C" style="light"></StatusBar>
      </SafeAreaView>
    </>
  );
}
