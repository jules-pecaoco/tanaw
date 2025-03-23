import React, { useState, memo, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
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

const DescriptionInput = memo(({ value, onChangeText }) => (
  <TextInput
    style={{
      textAlignVertical: "top",
    }}
    className="border border-gray-200 rounded-md align-text-top h-[100px] p-3"
    placeholder="Describe the hazard..."
    multiline
    numberOfLines={4}
    value={value}
    onChangeText={onChangeText}
  />
));

const ReportScreen = () => {
  const { getLocation } = useLocation();
  const { createReport, isCreating } = useHazardReports();
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // Scroll to the top when the keyboard is dismissed
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return () => {
      keyboardHideListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    Keyboard.dismiss();

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

      if (result && result.success === false) {
        throw new Error(result.error?.message || "Failed to submit report");
      }

      Alert.alert("Success", "Your hazard report has been submitted. Thank you for contributing!", [{ text: "OK" }]);

      setImage(null);
      setDescription("");
      setSelectedCategory(null);
    } catch (error) {
      Alert.alert("Error", `Failed to submit report: ${error.message}`);
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <ScrollView
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        className="flex-1 justify-content-around px-5"
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-content-around gap-2">
          <CameraView onImageCaptured={setImage} imageUri={image} />

          <CategorySelector categories={hazardCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          <DescriptionInput value={description} onChangeText={setDescription} />

          <TouchableOpacity
            className={`p-4 rounded-md items-center mt-2.5 mb-20 ${isSubmitting || isCreating ? "bg-gray-400" : "bg-primary"}`}
            onPress={handleSubmit}
            disabled={isSubmitting || isCreating}
          >
            <Text className="text-white font-rsemibold text-xl">{isSubmitting || isCreating ? "Submitting..." : "Submit Report"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReportScreen;
