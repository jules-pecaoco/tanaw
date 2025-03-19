import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

const CameraWidget = ({ onImageCaptured, imageUri }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  // Take picture
  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        onImageCaptured(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  // Flip camera
  const flipCamera = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  // Retry photo
  const retakePhoto = () => {
    onImageCaptured(null);
  };

  console.log("imageUri", imageUri);
  console.log("permission", permission);

  // If no image is captured and camera is not visible, show button to open camera
  if (!imageUri && !permission?.granted) {
    return (
      <TouchableOpacity className="bg-primary w-full h-20 flex-row items-center justify-center rounded-md my-2.5" onPress={requestPermission}>
        <Ionicons name="camera" size={24} color="white" />
        <Text className="text-white ml-2.5">Take Photo</Text>
      </TouchableOpacity>
    );
  }

  // If image is captured, show preview
  if (imageUri) {
    return (
      <View className="w-full rounded-lg overflow-hidden mb-4 relative" style={{ height: 400 }}>
        <Image source={{ uri: imageUri }} className="w-full h-full" />
        <TouchableOpacity className="absolute bottom-4 right-4 bg-black/60 p-2.5 rounded" onPress={retakePhoto}>
          <Text className="text-white">Retake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show camera view
  return (
    <View className="flex-1 w-full rounded-lg">
      {permission === null && <Text>Requesting camera permission...</Text>}

      {permission === false && <Text>No access to camera</Text>}

      {permission && (
        <CameraView ref={cameraRef} className="flex-1" style={{ height: 400 }} facing={cameraType} onCameraReady={() => setIsCameraReady(true)}>
          <View className="flex-1 h flex-row items-end justify-around mb-5">
            <TouchableOpacity className="p-4" onPress={flipCamera}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[70px] h-[70px] rounded-full bg-white/30 items-center justify-center" onPress={takePicture}>
              <View className="w-[60px] h-[60px] rounded-full bg-white" />
            </TouchableOpacity>

            <View className="w-[52px]" />
          </View>
        </CameraView>
      )}
    </View>
  );
};

export default CameraWidget;
