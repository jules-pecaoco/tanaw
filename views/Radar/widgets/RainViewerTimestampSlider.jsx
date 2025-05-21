import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatDateTime, convertUnixToISO } from "@/utilities/formatDateTime";

const RainViewerTimestampSlider = ({ timestamps, onTimestampChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (timestamps.length > 0) {
      setCurrentIndex(0);
      onTimestampChange(`https://tilecache.rainviewer.com${timestamps[0].path}/256/{z}/{x}/{y}/2/1_1.png`);
    }
  }, [timestamps, onTimestampChange]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onTimestampChange(`https://tilecache.rainviewer.com${timestamps[newIndex].path}/256/{z}/{x}/{y}/2/1_1.png`);
    }
  }, [currentIndex, timestamps, onTimestampChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < timestamps.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onTimestampChange(`https://tilecache.rainviewer.com${timestamps[newIndex].path}/256/{z}/{x}/{y}/2/1_1.png`);
    }
  }, [currentIndex, timestamps, onTimestampChange]);

  if (!timestamps || timestamps.length === 0) {
    return null;
  }

  return (
    <View className="absolute bottom-[5%] left-5 right-5 flex-row items-center justify-center rounded-full py-2 px-4 shadow-lg">
      <TouchableOpacity
        className={`h-10 w-10 rounded-full bg-black/50 items-center justify-center ${
          currentIndex === timestamps.length - 1 ? "opacity-50" : "active:bg-primary"
        }`}
        onPress={handleNext}
        disabled={currentIndex === timestamps.length - 1}
        activeOpacity={0.8}
      >
        <Text className="text-white text-xl font-rbold">{"<"}</Text>
      </TouchableOpacity>
      <View className="mx-4 py-1 px-4 bg-black/50 rounded-full">
        <Text className="text-white text-base font-rmedium text-center">
          {timestamps.length > 0 ? formatDateTime(convertUnixToISO(timestamps[currentIndex].time)).detailed_time : "Loading..."}
        </Text>
      </View>

      <TouchableOpacity
        className={`h-10 w-10 rounded-full bg-black/50 items-center justify-center ${currentIndex === 0 ? "opacity-50" : "active:bg-primary"}`}
        onPress={handlePrev}
        disabled={currentIndex === 0}
        activeOpacity={0.8}
      >
        <Text className="text-white text-xl font-rbold">{">"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RainViewerTimestampSlider;
