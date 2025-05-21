// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, Image, Alert, Platform } from "react-native";
// import * as ImagePicker from "expo-image-picker"; 
// import Ionicons from "@expo/vector-icons/Ionicons";

// const CameraWidget = ({ onImageCaptured, imageUri }) => {
//   // We need permissions for the camera AND media library (to access the taken photo)
//   const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
//   // Optional: If you want to allow picking from gallery or saving to it after editing
//   // const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

//   // No need for cameraType, isCameraReady, openCamera, cameraRef from expo-camera

//   // Function to launch the native camera
//   const launchNativeCamera = async () => {
//     // Request camera permission if not already granted
//     if (!cameraPermission?.granted) {
//       const permissionResult = await requestCameraPermission();
//       if (!permissionResult.granted) {
//         Alert.alert("Permission Required", "Camera permission is needed to take photos.");
//         return;
//       }
//     }

//     // Optional: Request media library permission if you need to save or edit
//     // if (!mediaLibraryPermission?.granted) {
//     //   const mediaPermissionResult = await requestMediaLibraryPermission();
//     //   if (!mediaPermissionResult.granted) {
//     //     Alert.alert("Permission Required", "Media Library permission is needed.");
//     //     return;
//     //   }
//     // }

//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
//         allowsEditing: false, // Set to true if you want basic editing (cropping)
//         aspect: [4, 3], // Aspect ratio for editing (if allowsEditing is true)
//         quality: 0.7, // Compression quality (0-1)
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         onImageCaptured(result.assets[0].uri);
//       }
//     } catch (error) {
//       console.error("Error launching camera:", error);
//       Alert.alert("Error", "Could not open camera. Please try again.");
//     }
//   };

//   // If no image is captured, show button to open camera
//   if (!imageUri) {
//     // No need to check for permission?.granted here, launchNativeCamera will handle it
//     return (
//       <TouchableOpacity
//         style={{ height: 600 }}
//         className="bg-primary w-full flex-row items-center justify-center rounded-md"
//         onPress={launchNativeCamera} // Directly call launchNativeCamera
//       >
//         <Ionicons name="camera" size={24} color="white" />
//         <Text className="text-white ml-2.5">Take Photo</Text>
//       </TouchableOpacity>
//     );
//   }

//   // If image is captured, show preview
//   // The "close" button should allow taking another picture, so it clears the imageUri
//   return (
//     <View className="w-full rounded-xl overflow-hidden relative" style={{ height: 600 }}>
//       <Image source={{ uri: imageUri }} className="w-full h-full" />
//       <View className="absolute top-0 right-0 left-0 flex-row justify-between p-4">
//         <TouchableOpacity
//           className="bg-black/60 p-2.5 rounded"
//           onPress={() => onImageCaptured(null)} // Clear image to allow retake
//         >
//           <Ionicons name="close" size={24} color="white" />
//         </TouchableOpacity>
//         {/* You could add a "Retake" button here as well if desired */}
//         <TouchableOpacity
//           className="bg-black/60 p-2.5 rounded"
//           onPress={() => {
//             onImageCaptured(null); // Clear current image
//             launchNativeCamera(); // Immediately open camera again
//           }}
//         >
//           <Ionicons name="camera-reverse-outline" size={24} color="white" />
//           {/* Or <Text className="text-white">Retake</Text> */}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default CameraWidget;
