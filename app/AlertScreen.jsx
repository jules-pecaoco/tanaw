// import React, { useEffect, useState, useMemo } from "react";
// import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Vibration, AppState } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams } from "expo-router";
// // import { Audio } from "expo-av";

// const WeatherAlert = () => {
//   const { data: paramString } = useLocalSearchParams();

//   const data = useMemo(() => {
//     try {
//       return paramString ? JSON.parse(paramString) : null;
//     } catch (e) {
//       console.error("Failed to parse alert data:", e);
//       return null;
//     }
//   }, [paramString]);

//   const [soundObject, setSoundObject] = useState(null);
//   const [hasPlayedAlert, setHasPlayedAlert] = useState(false);

//   useEffect(() => {
//     let isMounted = true;
//     let currentSoundInstance = null;

//     const playAlertEffects = async () => {
//       if (!isMounted || !data || hasPlayedAlert) {
//         return;
//       }

//       setHasPlayedAlert(true);
//       Vibration.vibrate([500, 500, 500]);

//       // console.log('Loading Sound...'); // Keep for debugging if issues persist
//       try {
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: false,
//           playsInSilentModeIOS: true,
//           shouldDuckAndroid: true,
//           playThroughEarpieceAndroid: false,
//         });

//         const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/alert-sound.mp3"), { shouldPlay: false });

//         if (isMounted) {
//           currentSoundInstance = sound;
//           setSoundObject(sound);
//           // console.log('Playing Sound'); // Keep for debugging
//           await sound.setIsLoopingAsync(false);
//           await sound.playAsync();
//         } else {
//           // console.log('Component unmounted before sound could play, unloading.'); // Keep for debugging
//           await sound.unloadAsync();
//         }
//       } catch (error) {
//         console.error("Failed to load or play sound", error);
//       }
//     };

//     playAlertEffects();

//     const handleAppStateChange = (nextAppState) => {
//       if (nextAppState.match(/inactive|background/) && currentSoundInstance) {
//         // console.log('App went to background, stopping sound.'); // Keep for debugging
//         currentSoundInstance.stopAsync().catch((e) => console.error("Error stopping sound on app background:", e));
//       }
//     };

//     const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

//     return () => {
//       isMounted = false;
//       appStateSubscription.remove();
//       // console.log('Unloading Sound on component unmount'); // Keep for debugging
//       const soundToUnload = currentSoundInstance || soundObject;
//       if (soundToUnload) {
//         soundToUnload
//           .stopAsync()
//           .then(() => soundToUnload.unloadAsync())
//           // .then(() => console.log('Sound unloaded successfully')) // Keep for debugging
//           .catch((error) => console.error("Error unloading sound:", error));
//       }
//       setHasPlayedAlert(false);
//     };
//   }, [data]);

//   const handleDismiss = async () => {
//     Vibration.cancel();
//     if (soundObject) {
//       // console.log('Dismissing: Stopping and unloading sound.'); // Keep for debugging
//       try {
//         await soundObject.stopAsync();
//         await soundObject.unloadAsync();
//         setSoundObject(null);
//       } catch (error) {
//         console.error("Error stopping/unloading sound on dismiss:", error);
//       }
//     }
//     router.back();
//   };

//   if (!data) {
//     return null;
//   }

//   const getAlertStyles = () => {
//     switch (data?.data?.weatherType) {
//       case "rain":
//         return { backgroundColor: "#3498db", icon: "rainy-outline", iconColor: "white" };
//       case "heat":
//       default:
//         return { backgroundColor: "#F47C25", icon: "sunny-outline", iconColor: "white" };
//     }
//   };

//   const alertStyles = getAlertStyles();

//   return (
//     <SafeAreaView className="flex-1" style={{ backgroundColor: alertStyles.backgroundColor }}>
//       <StatusBar barStyle="light-content" />
//       <View className="flex-1 items-center justify-center px-6">
//         <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-8">
//           <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: alertStyles.backgroundColor }}>
//             <Ionicons name={alertStyles.icon} size={40} color={alertStyles.iconColor} />
//           </View>
//         </View>
//         <Text className="text-white text-3xl font-bold text-center">{data.title || "Weather Alert"}</Text>
//         <Text className="text-white text-center mt-6 text-base">
//           {data.body || "Please check weather conditions and take appropriate precautions."}
//         </Text>
//       </View>
//       <View className="p-6">
//         <TouchableOpacity className="bg-white py-4 rounded-lg items-center" onPress={handleDismiss}>
//           <Text className="font-bold text-lg" style={{ color: alertStyles.backgroundColor }}>
//             Dismiss
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default WeatherAlert;

import { View, Text } from 'react-native'
import React from 'react'

const AlertScreen = () => {
  return (
    <View>
      <Text>AlertScreen</Text>
    </View>
  )
}

export default AlertScreen