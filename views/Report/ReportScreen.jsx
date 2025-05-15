import React, { useState, memo, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

// Hooks
import useLocation from "@/hooks/useLocation";
import useHazardReports from "@/hooks/useHazardReports";
import useUserIdentifier from "@/hooks/useUserIdentifier"
import useGeminiHazardAnalysis from "@/hooks/useImageAnalyzer";

// Components
import CameraView from "./widgets/CameraView";

const DescriptionInput = memo(({ value }) => {
  if (!value) return null;

  if (value.valid === false) {
    return (
      <View className="w-full">
        <Text className="text-lg font-rbold">AI Analysis Result</Text>
        <Text className="text-lg font-rmedium text-red-500 mt-2">Invalid Image: {value.invalid_reason || "Unknown reason"}</Text>
      </View>
    );
  }

  return (
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
        <Text className="text-lg font-rregular text-gray-500 w-full text-justify">{value.hazard_description}</Text>
      </View>
    </View>
  );
});

const ReportScreen = () => {
  const { getLocation } = useLocation();
  const { createReport, isCreating } = useHazardReports();
  const { uniqueIdentifier } = useUserIdentifier();
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

      const currentLocation = await getLocation();
      if (!currentLocation) {
        Alert.alert("Error", "Could not determine your location. Please enable location services and try again.");
        setIsSubmitting(false);
        return;
      }

      const compressed = await compressImage(image);
      const hazardInfo = await analyze(compressed.uri);

      if (hazardInfo.valid === false) {
        setDescription(hazardInfo);
        Alert.alert("Invalid Image", `Image analysis failed: ${hazardInfo.invalid_reason}`);
        setReportSubmitted(true);
        setIsSubmitting(false);
        return;
      }

      const result = await createReport({
        hazardData: {
          hazard_type: hazardInfo.hazard_type,
          hazard_sub_type: hazardInfo.hazard_sub_type,
          hazard_description: hazardInfo.hazard_description,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        imageUri: compressed.uri,
        uniqueIdentifier: uniqueIdentifier,
      });

      if (result && result.success === false) {
        throw new Error(result.error?.message || "Failed to submit report");
      }

      Alert.alert("Success", "Your hazard report has been submitted. Thank you for contributing!");
      setDescription(hazardInfo);
      setReportSubmitted(true);
    } catch (error) {
      setReportSubmitted(true);
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
