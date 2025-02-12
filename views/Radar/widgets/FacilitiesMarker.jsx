import React from "react";
import { MarkerView } from "@rnmapbox/maps";
import { View, TouchableOpacity } from "react-native";

const Marker = React.memo(({ coordinates,  onPress }) => {

  return (
    <MarkerView coordinate={coordinates}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View className="flex flex-col items-center gap-2">
          <View className="bg-primary size-10 rounded-full" />
        </View>
      </TouchableOpacity>
    </MarkerView>
  );
});



export default Marker;
