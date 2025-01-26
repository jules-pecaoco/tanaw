import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import CustomButton from "@/views/components/CustomButton";

const PermissionScreen = ({
  icon,
  permissionTitle,
  permissionTitleDescription,
  permissionDescription,
  handlePress,
  gradient,
  statusBarColor,
  permissionType,
  buttonText,
}) => {
  return (
    <>
      <SafeAreaView className="h-full">
        <LinearGradient locations={[0, 0.4]} className="h-full" colors={[gradient.first, gradient.second]}>
          <View className="h-full">
            <View className="h-2/5"></View>
            <View className="h-2/4 flex items-center justify-center gap-5 mt-10 ">
              {/* ICON */}
              <Image source={icon} resizeMethod="contain"></Image>
              <View className="gap-3 flex mb-16">
                {/* PERMISSION TITLE */}
                <Text className="text-gray-400  font-rbold text-sm text-center">{permissionTitle}</Text>
                {/* PERMISSION DESCRIPTION TITLE */}
                <Text className="text-white font-rbold text-4xl text-center">{permissionTitleDescription}</Text>
                {/* PERMISSION DESCRIPTION */}
                <Text className="text-gray-400 font-rregular text-center text-sm px-5">{permissionDescription}</Text>
                <View className="flex gap-3 justify-center items-center flex-row">
                  <View className="bg-white w-10 h-1 rounded-md"></View>
                  {permissionType === "notification" ? (
                    <View className="bg-white w-10 h-1 rounded-md"></View>
                  ) : (
                    <View className="bg-gray-500 w-10 h-1 rounded-md bg-opacity-50"></View>
                  )}
                </View>
              </View>

              <CustomButton
                handlePress={handlePress}
                title={buttonText}
                containerStyles="h-fit w-10/12"
                textStyles="bg-white text-center py-3 rounded-xl font-semibold bg"
              />
            </View>
          </View>
        </LinearGradient>
        <StatusBar backgroundColor={statusBarColor} style="light"></StatusBar>
      </SafeAreaView>
    </>
  );
};

export default PermissionScreen;
