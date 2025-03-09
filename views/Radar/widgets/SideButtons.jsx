import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';


const SideButtons = React.memo(({ onPress, icon, isActive }) => {

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View className="p-4 bg-white rounded-full shadow-lg h-fit flex justify-center items-center">
        <Image source={icon} className="size-6" tintColor={`${isActive ? "#F47C25" : "#94a3b8"}`} />
      </View>
    </TouchableOpacity>
  );
});

export default SideButtons;