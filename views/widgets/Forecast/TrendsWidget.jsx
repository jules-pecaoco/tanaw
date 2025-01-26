import { View, Text, Image } from "react-native";
import React from "react";

const Location = ({ location }) => {
  return (
    <View className="bg-white w-[95%] p-4 justify-between rounded-xl flex flex-row items-center self-center justify-self-center mb-3">
      <View>
        <Text className="text-2xl font-rsemibold">City</Text>
        <Text className="text-md font-rregular">Warning</Text>
      </View>
      <View className="flex flex-row items-center justify-center gap-4">
        <Text className="font-rmedium text-3xl">Temperature</Text>
        <Image source={""} alt="Icon"></Image>
      </View>
    </View>
  );
};

const TrendsWidget = ({ data }) => {
  return (
    <>
      <Location location={data} />
    </>
  );
};
export default TrendsWidget;
