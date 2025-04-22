import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HeatIndexAlert = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#F47C25]">
      <StatusBar barStyle="light-content" />

      {/* Back Button */}
      <TouchableOpacity className="flex-row items-center p-4" onPress={() => console.log("Go back")}>
        <Ionicons name="chevron-back" size={24} color="white" />
        <Text className="text-white text-lg ml-1">Back</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Alert Icon */}
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-8">
          <View className="w-20 h-20 rounded-full bg-[#F47C25] items-center justify-center">
            <Ionicons name="warning-outline" size={40} color="white" />
          </View>
        </View>

        {/* Alert Title */}
        <Text className="text-white text-3xl font-bold text-center">
          High{"\n"}Heat Index{"\n"}Detected
        </Text>

        {/* Alert Message */}
        <Text className="text-white text-center mt-6 text-base">
          The heat index is dangerously high. Stay hydrated, avoid outdoor activities, wear light clothing, and seek cool or shaded areas.
        </Text>
      </View>

      {/* Action Button */}
      <View className="p-6">
        <TouchableOpacity className="bg-white py-4 rounded-lg items-center" onPress={() => console.log("Action taken")}>
          <Text className="text-[#F47C25] font-bold text-lg">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HeatIndexAlert;
