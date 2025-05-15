import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { formatDateTime, convertUnixToISO } from "@/utilities/formatDateTime";

const RainViewerTimestampSlider = ({ timestamps, onTimestampChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    onTimestampChange(`https://tilecache.rainviewer.com${timestamps[0].path}/256/{z}/{x}/{y}/2/1_1.png`);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onTimestampChange(`https://tilecache.rainviewer.com${timestamps[newIndex].path}/256/{z}/{x}/{y}/2/1_1.png`);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < timestamps.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onTimestampChange(`https://tilecache.rainviewer.com${timestamps[newIndex].path}/256/{z}/{x}/{y}/2/1_1.png`);
    }
  }, [currentIndex]);

  return (
    <View className="absolute bottom-20 right-[21%] flex-row items-center">
      <TouchableOpacity style={styles.button} onPress={handleNext} disabled={currentIndex === timestamps.length - 1}>
        <Text style={styles.buttonText}>{"<"}</Text>
      </TouchableOpacity>
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>
          {timestamps.length > 0 ? formatDateTime(convertUnixToISO(timestamps[currentIndex].time)).detailed_time : "Loading..."}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePrev} disabled={currentIndex === 0}>
        <Text style={styles.buttonText}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  timestampContainer: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
  },
  timestampText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RainViewerTimestampSlider;
