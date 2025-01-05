import { Image, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { icons } from "@/constants/index";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { registerForPushNotificationsAsync } from "@/services/registerNotification";
import { userPermissionStore } from "@/context/userPermissionStore";


const Notification = () => {

  async function getNotificationPermission() {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      // setExpoPushToken(token);
      userPermissionStore.setItem("expoPushToken",token);
      router.replace("/radar");
      return; 
    }
    
    router.replace("/radar");
  }

  return (
    <>
      <SafeAreaView>
        <LinearGradient locations={[0, 0.4]} className="h-full" colors={["#E8434C", "#3c454c"]}>
          <View className="h-full">
            <View className="h-2/5"></View>
            <View className="h-2/4 flex items-center justify-center gap-5 mt-10">
              <Image source={icons.notifications} resizeMethod="contain"></Image>
              <View className="gap-3 flex mb-16">
                <Text className="text-white font-rbold text-4xl text-center"></Text>
                <Text className="text-gray-400  font-rbold text-sm text-center">NOTIFICATION PERMISSION</Text>
                <Text className="text-white font-rbold text-4xl text-center">Turn On Notifications for Alerts</Text>
                <Text className="text-gray-400 font-rregular text-center text-sm px-5">
                  Turn on notifications to stay informed about important updates, whether it’s changes in local conditions or urgent alerts. We’ll
                  only notify you when it’s truly necessary—no unnecessary buzzing, just peace of mind!
                </Text>
                <View className="flex gap-3 justify-center items-center flex-row">
                  <View className="bg-white w-10 h-1 rounded-md"></View>
                  <View className="bg-white w-10 h-1 rounded-md"></View>
                </View>
              </View>

              {/* Custom Button */}
              <View className={`h-fit w-fit`}>
                <TouchableOpacity className="" onPress={getNotificationPermission} activeOpacity={0.7}>
                  <Text className={`bg-white text-center px-36 py-3 rounded-xl font-semibold`}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
        <StatusBar backgroundColor="#E8434C" style="light"></StatusBar>
      </SafeAreaView>
    </>
  );
};

export default Notification;
