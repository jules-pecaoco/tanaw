import { Text, TouchableOpacity, View } from "react-native";
import React from "react";

const CustomButton = (props) => {
  const { title, handlePress, containerStyles, textStyles, isLoading } = props;

  return (
    <View className={`${containerStyles}`}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={isLoading}>
        <Text className={`${textStyles}`}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
