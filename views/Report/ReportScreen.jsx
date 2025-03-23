import React, { useState, memo, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Platform, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import useLocation from "@/hooks/useLocation";
import useHazardReports from "@/hooks/useHazardReports";
import CameraView from "./widgets/CameraView";
import CategorySelector from "./widgets/CategorySelector";

// Define hazard categories
const hazardCategories = [
  { id: "flood", label: "Flood" },
  { id: "fire", label: "Fire" },
  { id: "storm", label: "Storm" },
  { id: "landslide", label: "Landslide" },
  { id: "earthquake", label: "Earthquake" },
  { id: "other", label: "Other" },
];

// Memoized Description Input component to prevent re-renders
const DescriptionInput = memo(({ value, onChangeText }) => {
  return (
    <TextInput
      className="border border-gray-300 rounded-md p-2.5 my-2.5 h-24 text-base"
      placeholder="Describe the hazard..."
      multiline
      numberOfLines={4}
      value={value}
      onChangeText={onChangeText}
      textAlignVertical="top"
    />
  );
});

const ReportScreen = () => {
  const { getLocation } = useLocation();
  const { createReport, isCreating } = useHazardReports();
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

  const scrollViewRef = useRef(null);

  const handleSubmit = async () => {
    // Dismiss keyboard if it's open
    Keyboard.dismiss();

    // Validate form
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a hazard category");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please take a photo of the hazard");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current location
      const currentLocation = await getLocation();

      if (!currentLocation) {
        Alert.alert("Error", "Could not determine your location. Please enable location services and try again.");
        setIsSubmitting(false);
        return;
      }

      // Create hazard report
      const result = await createReport({
        hazardData: {
          hazardType: selectedCategory,
          description,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        imageUri: image,
      });

      // Check the result
      if (result && result.success === false) {
        throw new Error(result.error?.message || "Failed to submit report");
      }

      Alert.alert("Success", "Your hazard report has been submitted. Thank you for contributing!", [{ text: "OK" }]);

      // Reset form
      setImage(null);
      setDescription("");
      setSelectedCategory(null);
      setShowCamera(true);
    } catch (error) {
      Alert.alert("Error", `Failed to submit report: ${error.message}`);
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={120}
      extraHeight={Platform.OS === "ios" ? 150 : 30}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      <View className="flex-1 justify-around">
        {showCamera || image ? (
          <CameraView onImageCaptured={setImage} imageUri={image} onClose={handleCloseCamera} />
        ) : (
          <TouchableOpacity className="bg-primary w-full h-[400px] flex-1 flex-row items-center justify-center rounded-md" onPress={handleOpenCamera}>
            <Text className="text-white">Open Camera</Text>
          </TouchableOpacity>
        )}

        <CategorySelector categories={hazardCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        <DescriptionInput value={description} onChangeText={setDescription} />

        <TouchableOpacity
          className={`p-4 rounded-md items-center mt-2.5 mb-20 ${isSubmitting || isCreating ? "bg-gray-400" : "bg-primary"}`}
          onPress={handleSubmit}
          disabled={isSubmitting || isCreating}
        >
          <Text className="text-white font-bold">{isSubmitting || isCreating ? "Submitting..." : "Submit Report"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ReportScreen;
