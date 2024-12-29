import { Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";

const CustomButton = (props) => {
  const { title, handlePress, containerStyles, textStyles, isLoading } = props;
  const [isFocused, setisFocused] = useState(false)

  return (
    <View
      className={`rounded-xl min-h-[62px] justify-center items-center ${containerStyles}
        ${isLoading ? 'opacity-50' : ''} ${isFocused ? 'bg-orange-100' : ''}
      `}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <Text
        className={`${textStyles}`}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
