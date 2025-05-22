import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Vibration, AppState } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";

const WeatherAlert = () => {
  const { data: paramString } = useLocalSearchParams();

  const data = useMemo(() => {
    try {
      return paramString ? JSON.parse(paramString) : null;
    } catch (e) {
      console.error("Failed to parse alert data:", e);
      return null;
    }
  }, [paramString]);

  const [soundObject, setSoundObject] = useState(null); // Used by handleDismiss
  const soundInstanceRef = useRef(null); // Manages the sound instance within useEffect lifecycle

  // Define a stable vibration pattern
  const VIBRATION_PATTERN = useMemo(() => [500, 1000], []);

  useEffect(() => {
    // If no data, do nothing further.
    // Active sound/vibration from a previous `data` state would be
    // handled by the cleanup function of *that* effect run.
    if (!data) {
      if (soundObject !== null) {
        setSoundObject(null);
      }
      return;
    }

    let isMounted = true;

    const playAlertEffects = async () => {
      if (!isMounted) return;

      Vibration.vibrate(VIBRATION_PATTERN, true);

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Crucial for alerts
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/alert_sound.mp3"),
          { shouldPlay: false } // Load but don't play immediately
        );

        if (isMounted) {
          soundInstanceRef.current = sound; // Store in ref for effect-internal operations
          setSoundObject(sound); // Set state for handleDismiss

          await sound.setIsLoopingAsync(true);
          await sound.playAsync();
        } else {
          // Component unmounted before sound could be fully set up
          await sound.unloadAsync();
        }
      } catch (error) {
        console.error("Failed to load or play sound", error);
        // Vibration is already looping as a fallback.
      }
    };

    playAlertEffects();

    const handleAppStateChange = (nextAppState) => {
      const currentSound = soundInstanceRef.current;

      if (nextAppState.match(/inactive|background/)) {
        if (currentSound) {
          currentSound.stopAsync().catch((e) => console.error("Error stopping sound on app background:", e));
        }
        Vibration.cancel();
      } else if (nextAppState === "active") {
        // App came to foreground. Resume if alert is still active (not dismissed).
        if (isMounted && data && currentSound) {
          // `data` is from the effect's closure
          currentSound
            .getStatusAsync()
            .then((status) => {
              if (status.isLoaded && !status.isPlaying) {
                // If sound is loaded but not playing (e.g., stopped by backgrounding)
                currentSound.playAsync().catch((e) => console.error("Error resuming sound on app active:", e));
                Vibration.vibrate(VIBRATION_PATTERN, true);
              } else if (status.isLoaded && status.isPlaying) {
                // If sound somehow continued playing, ensure vibration is also active
                Vibration.vibrate(VIBRATION_PATTERN, true);
              }
              // If not loaded (e.g., unloaded by dismiss), do nothing.
            })
            .catch((e) => console.error("Error getting sound status on app active:", e));
        }
      }
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    // Cleanup function: runs when component unmounts or dependencies (data) change
    return () => {
      isMounted = false;
      appStateSubscription.remove();
      Vibration.cancel();

      const soundToUnload = soundInstanceRef.current;
      if (soundToUnload) {
        soundToUnload
          .stopAsync()
          .then(() => soundToUnload.unloadAsync())
          .catch((error) => console.error("Error unloading sound on effect cleanup:", error));
      }
      soundInstanceRef.current = null;
      // `setSoundObject(null)` is not called here to avoid potential loops if it were a dependency.
      // `handleDismiss` or the `!data` block handles clearing `soundObject` state.
    };
  }, [data, VIBRATION_PATTERN]); // Effect runs if `data` or `VIBRATION_PATTERN` changes

  const handleDismiss = async () => {
    Vibration.cancel();

    // Use the soundObject from state
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (error) {
        console.error("Error stopping/unloading sound on dismiss:", error);
      }
    }
    setSoundObject(null);

    // If the ref was pointing to the same sound, clear it too, though cleanup should also handle it.
    if (soundInstanceRef.current === soundObject) {
      soundInstanceRef.current = null;
    }

    router.back();
  };

  // If data is null (e.g., after parsing or if paramString is null), render nothing.
  // The useEffect handles clearing soundObject state if data becomes null.
  if (!data) {
    return null;
  }

  const getAlertStyles = () => {
    switch (data?.data?.weatherType) {
      case "rain":
        return { backgroundColor: "#3498db", icon: "rainy-outline", iconColor: "white" };
      case "heat":
      default:
        return { backgroundColor: "#F47C25", icon: "sunny-outline", iconColor: "white" };
    }
  };

  const alertStyles = getAlertStyles();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: alertStyles.backgroundColor }}>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: alertStyles.backgroundColor }}>
            <Ionicons name={alertStyles.icon} size={40} color={alertStyles.iconColor} />
          </View>
        </View>
        <Text className="text-white text-3xl font-bold text-center">{data.title || "Weather Alert"}</Text>
        <Text className="text-white text-center mt-6 text-base">
          {data.body || "Please check weather conditions and take appropriate precautions."}
        </Text>
      </View>
      <View className="p-6">
        <TouchableOpacity className="bg-white py-4 rounded-lg items-center" onPress={handleDismiss}>
          <Text className="font-bold text-lg" style={{ color: alertStyles.backgroundColor }}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WeatherAlert;
