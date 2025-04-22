import { Image, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "@/views/components/CustomButton";

const IndexScreen = ({ title, titleDescription, description, textGuide ,logo, handlePress }) => {
  return (
      <LinearGradient locations={[0.05, 0.1, 0.4, 0.6]} className="h-full" colors={["#E84E4C", "#f47c25", "#FFFFFF", "#3c454c"]}>
        <View className="h-full">
          <View className="h-2/5"></View>
          <View className="h-2/4 flex items-center justify-center gap-5 mt-10">
            <Image source={logo} resizeMethod="contain"></Image>
            <View className="gap-3 flex mb-16">
              <Text className="text-gray-400  font-rbold text-sm text-center">{title}</Text>
              <Text className="text-white font-rbold text-4xl text-center">{titleDescription}</Text>
              <Text className="text-gray-400 font-rregular text-center text-sm px-5">{description}</Text>
              <Text className="text-gray-400 font-rregular text-center text-sm">{textGuide}</Text>
            </View>

            <CustomButton
              title="Let's Start"
              handlePress={handlePress}
              containerStyles="h-fit w-10/12"
              textStyles="bg-white text-center py-3 rounded-xl font-semibold"
            ></CustomButton>
          </View>
        </View>
        <StatusBar backgroundColor="#E84E4C" style="light"></StatusBar>
      </LinearGradient>
  );
};

export default IndexScreen;
