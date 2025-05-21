// import React, { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Vibration } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams } from "expo-router";
// import { Audio } from 'expo-audio';

// const WeatherAlert = () => {
//   const { data: param } = useLocalSearchParams();
//   const data = param ? JSON.parse(param) : null;
//   const [sound, setSound] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     let activeSound = null;

//     const playAlertEffects = async () => {
//       Vibration.vibrate();

//       console.log('Loading Sound with expo-audio...');
//       try {
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: false,
//           playsInSilentModeIOS: true,
//           playThroughEarpieceAndroid: false,
//         });

//         const { sound: newSound } = await Audio.Sound.createAsync(
//            require('../../assets/sounds/alert-sound.mp3') // << --- ADJUST THIS PATH
//         );

//         if (isMounted) {
//           activeSound = newSound;
//           setSound(newSound);
//           console.log('Playing Sound');
//           await newSound.playAsync();
//         } else {
//           console.log('Component unmounted before sound could play, unloading.');
//           await newSound.unloadAsync();
//         }
//       } catch (error) {
//         console.error("Failed to load or play sound with expo-audio", error);
//       }
//     };

//     if (data) {
//       playAlertEffects();
//     }

//     return () => {
//       isMounted = false;
//       console.log('Unloading Sound (expo-audio)');
//       const soundToUnload = activeSound || sound;
//       if (soundToUnload) {
//         soundToUnload.unloadAsync()
//           .then(() => {
//             console.log('Sound unloaded successfully');
//             if (activeSound === soundToUnload) activeSound = null;
//           })
//           .catch(error => {
//             console.error('Error unloading sound:', error);
//           });
//       }
//     };
//   }, [data]);

//   if (!data) {
//     return null;
//   }

//   console.log("Weather Alert Data:", data);

//   const getAlertStyles = () => {
//     switch (data?.data?.weatherType) {
//       case "rain":
//         return {
//           backgroundColor: "#3498db",
//           icon: "rainy-outline",
//           iconColor: "white",
//         };
//       case "heat":
//       default:
//         return {
//           backgroundColor: "#F47C25",
//           icon: "sunny-outline",
//           iconColor: "white",
//         };
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
//         <TouchableOpacity className="bg-white py-4 rounded-lg items-center" onPress={router.back}>
//           <Text className="font-bold text-lg" style={{ color: alertStyles.backgroundColor }}>
//             Dismiss
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default WeatherAlert;

import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const WeatherAlert = () => {
  const { data: param } = useLocalSearchParams();

  const data = param ? JSON.parse(param) : null;

  if (!data) {
    return null;
  }

  console.log("Weather Alert Data:", data);
  // Define styles and icons based on weatherType
  const getAlertStyles = () => {
    switch (data?.data?.weatherType) {
      case "rain":
        return {
          backgroundColor: "#3498db", // Blue for rain
          icon: "rainy-outline",
          iconColor: "white",
        };
      case "heat":
      default: // Default to heat styles
        return {
          backgroundColor: "#F47C25", // Orange for heat
          icon: "sunny-outline",
          iconColor: "white",
        };
    }
  };

  const alertStyles = getAlertStyles();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: alertStyles.backgroundColor }}>
      <StatusBar barStyle="light-content" />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Alert Icon */}
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-8">
          <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: alertStyles.backgroundColor }}>
            <Ionicons name={alertStyles.icon} size={40} color={alertStyles.iconColor} />
          </View>
        </View>

        {/* Alert Title */}
        <Text className="text-white text-3xl font-rbold text-center">{data.title || "Weather Alert"}</Text>

        {/* Alert Message */}
        <Text className="text-white text-center mt-6 text-base">
          {data.body || "Please check weather conditions and take appropriate precautions."}
        </Text>
      </View>

      {/* Action Button */}
      <View className="p-6">
        <TouchableOpacity className="bg-white py-4 rounded-xl items-center" onPress={router.back}>
          <Text className="font-rbold text-lg" style={{ color: alertStyles.backgroundColor }}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WeatherAlert;



