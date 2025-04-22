import React, { useState, memo, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

// Hooks
import useLocation from "@/hooks/useLocation";
import useHazardReports from "@/hooks/useHazardReports";
import useGeminiHazardAnalysis from "@/hooks/useImageAnalyzer";

// Components
import CameraView from "./widgets/CameraView";
import { ActivityIndicator } from "react-native-web";
// import CategorySelector from "./widgets/CategorySelector";

// Define hazard categories
const hazardCategories = [
  { id: "flood", label: "Flood" },
  { id: "fire", label: "Fire" },
  { id: "storm", label: "Storm" },
  { id: "landslide", label: "Landslide" },
  { id: "earthquake", label: "Earthquake" },
  { id: "other", label: "Other" },
];

const DescriptionInput = memo(({ value }) => (
  <View className="w-full">
    <Text className="text-lg font-rbold">AI Hazard Report</Text>
    <View className="flex-row item-center">
      <Text className="text-lg font-rmedium">Type: </Text>
      <Text className="text-lg font-rregular text-gray-500">{value.hazard_type}</Text>
    </View>
    <View className="flex-row item-center">
      <Text className="text-lg font-rmedium">SubType: </Text>
      <Text className="text-lg font-rregular text-gray-500">{value.hazard_sub_type}</Text>
    </View>
    <View className="flex-column item-center">
      <Text className="text-lg font-rmedium">Description: </Text>
      <Text className="text-lg font-rregular text-gray-500 w-full text-justify">
        {value.hazard_description}
      </Text>
    </View>
  </View>
));

const ReportScreen = () => {
  const { getLocation } = useLocation();
  const { createReport, isCreating } = useHazardReports();
  const [image, setImage] = useState(null);
  // const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const { analyze, compressImage, result } = useGeminiHazardAnalysis();

  const scrollViewRef = useRef(null);



  const handleSubmit = async () => {

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
      const compressed = await compressImage(image);
      const hazardInfo = await analyze(compressed.uri);

      const hazard_type = hazardInfo.hazard_type;
      const hazard_sub_type = hazardInfo.hazard_sub_type;
      const hazard_description = hazardInfo.hazard_description;

      const result = await createReport({
        hazardData: {
          hazard_type,
          hazard_sub_type,
          hazard_description,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        imageUri: compressed.uri,
      });

      if (result && result.success === false) {
        throw new Error(result.error?.message || "Failed to submit report");
      }

      Alert.alert("Success", "Your hazard report has been submitted. Thank you for contributing!", [{ text: "OK" }]);

      setDescription(hazardInfo);

      setReportSubmitted(true);
    } catch (error) {
      Alert.alert("Error", `Failed to submit report: ${error.message}`);
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewReport = () => {
    setImage(null);
    setDescription("");
    setReportSubmitted(false);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      className="flex-1 justify-content-around px-5 h-full"
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 justify-content-around gap-2">
        <CameraView onImageCaptured={setImage} imageUri={image} />

        <DescriptionInput value={description} />

        <TouchableOpacity
          className={`p-4 rounded-md items-center mt-2.5 mb-20 ${isSubmitting || isCreating ? "bg-gray-400" : "bg-primary"}`}
          onPress={reportSubmitted ? handleNewReport : handleSubmit}
          disabled={isSubmitting || isCreating}
        >
          <Text className="text-white font-rsemibold text-xl">
            {isSubmitting || isCreating ? "Submitting..." : reportSubmitted ? "Submit New Report" : "Submit Report"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ReportScreen;
