import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const CustomButton = (props) => {
  const { title, handlePress, containerStyles, textStyles, disabled } = props;

  return (
    <View className={`${containerStyles}`}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={disabled}>
        {disabled ? <ActivityIndicator size="small" color="#000" className={`${textStyles} h-[3.2rem]`}/> : <Text className={`${textStyles}`}>{title}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
