import { View, Text } from "react-native";
import React from "react";

import NewsScreen from "@/views/News/NewsScreen";

const News = () => {
  return (
    <View>
      <View className="w-full bg-white py-5">
        <Text className="text-center font-rmedium text-3xl">News</Text>
      </View>
      <NewsScreen />
    </View>
  );
};

export default News;
