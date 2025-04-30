import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

const CameraWidget = ({ onImageCaptured, imageUri }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
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


  // If no image is captured and camera is not visible, show button to open camera
  if ((!imageUri && !permission?.granted) || !openCamera) {
    const onClick = () => {
      requestPermission();
      setOpenCamera(true);
    };
    return (
      <TouchableOpacity style={{ height: 600 }} className="bg-primary w-full flex-row items-center justify-center rounded-md" onPress={onClick}>
        <Ionicons name="camera" size={24} color="white" />
        <Text className="text-white ml-2.5">Take Photo</Text>
      </TouchableOpacity>
    );
  }

  // If image is captured, show preview
  if (imageUri) {
    return (
      <View className="w-full rounded-lg overflow-hidden relative" style={{ height: 600 }}>
        <Image source={{ uri: imageUri }} className="w-full h-full" />
        <View className="absolute top-0 right-0 left-0 flex-row justify-between p-4">
          <TouchableOpacity className="bg-black/60 p-2.5 rounded" onPress={() => setOpenCamera(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
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

      {openCamera && (
        <CameraView
          ref={cameraRef}
          className="flex-1 rounded-md"
          style={{ height: 600, borderRadius: 5 }}
          facing={cameraType}
          onCameraReady={() => setIsCameraReady(true)}
        >
          <View className="flex-1 h flex-row items-end justify-around mb-4">
            <TouchableOpacity className="p-4" onPress={flipCamera}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[70px] h-[70px] rounded-full bg-white/30 items-center justify-center" onPress={takePicture}>
              <View className="w-[60px] h-[60px] rounded-full bg-white" />
            </TouchableOpacity>

            <TouchableOpacity className="p-4" onPress={() => setOpenCamera(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
};

export default CameraWidget;
