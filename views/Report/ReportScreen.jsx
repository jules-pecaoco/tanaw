import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";

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

const ReportScreen = () => {
  const { refreshLocation } = useLocation();
  const { createReport, isCreating } = useHazardReports();
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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
      const currentLocation = await refreshLocation();

      if (!currentLocation) {
        Alert.alert("Error", "Could not determine your location. Please enable location services and try again.");
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting report with category:", selectedCategory);
      console.log("Description:", description);
      console.log("Image URI:", image);
      console.log("Location:", currentLocation);

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
    } catch (error) {
      Alert.alert("Error", `Failed to submit report: ${error.message}`);
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-around p-4">
      <CameraView onImageCaptured={setImage} imageUri={image} />

      <CategorySelector categories={hazardCategories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <TextInput
        className="border border-gray-300 rounded-md p-2.5 my-2.5 h-24 text-base"
        placeholder="Describe the hazard..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />

      <TouchableOpacity
        className={`p-4 rounded-md items-center mt-2.5 ${isSubmitting || isCreating ? "bg-gray-400" : "bg-primary"}`}
        onPress={handleSubmit}
        disabled={isSubmitting || isCreating}
      >
        <Text className="text-white font-bold">{isSubmitting || isCreating ? "Submitting..." : "Submit Report"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReportScreen;
