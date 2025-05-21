// import React, { useState, memo, useEffect, useRef } from "react";
// import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

// // Hooks
// import useLocation from "@/hooks/useLocation";
// import useHazardReports from "@/hooks/useHazardReports";
// import useUserIdentifier from "@/hooks/useUserIdentifier";
// import useGeminiHazardAnalysis from "@/hooks/useImageAnalyzer";

// // Components
// // import CameraView from "./widgets/CameraView"; // Old import
// import CameraWidget from "./widgets/CameraWidget"; // Updated import - make sure path is correct

// const DescriptionInput = memo(({ value }) => {
//   if (!value) return null;

//   if (value.valid === false) {
//     return (
//       <View className="w-full mt-4">
//         {" "}
//         {/* Added some margin for spacing */}
//         <Text className="text-lg font-rbold">AI Analysis Result</Text>
//         <Text className="text-lg font-rmedium text-red-500 mt-2">Invalid Image: {value.invalid_reason || "Unknown reason"}</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="w-full mt-4">
//       {" "}
//       {/* Added some margin for spacing */}
//       <Text className="text-lg font-rbold">AI Hazard Report</Text>
//       <View className="flex-row item-center">
//         <Text className="text-lg font-rmedium">Type: </Text>
//         <Text className="text-lg font-rregular text-gray-500">{value.hazard_type}</Text>
//       </View>
//       <View className="flex-row item-center">
//         <Text className="text-lg font-rmedium">SubType: </Text>
//         <Text className="text-lg font-rregular text-gray-500">{value.hazard_sub_type}</Text>
//       </View>
//       <View className="flex-column item-center">
//         <Text className="text-lg font-rmedium">Description: </Text>
//         <Text className="text-lg font-rregular text-gray-500 w-full text-justify">{value.hazard_description}</Text>
//       </View>
//     </View>
//   );
// });

// const ReportScreen = () => {
//   const { getLocation } = useLocation();
//   const { createReport, isCreating } = useHazardReports();
//   const { uniqueIdentifier } = useUserIdentifier();
//   const [imageUri, setImageUri] = useState(null); // Renamed 'image' to 'imageUri' for clarity with the prop name
//   const [description, setDescription] = useState(""); // This will hold the AI analysis result object
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [reportSubmitted, setReportSubmitted] = useState(false); // Tracks if the report (valid or invalid) has been processed
//   const { analyze, compressImage, result: geminiResult } = useGeminiHazardAnalysis(); // Assuming geminiResult is from the hook

//   const scrollViewRef = useRef(null);

//   // Callback for when CameraWidget captures an image or clears it
//   const handleImageCaptured = (uri) => {
//     setImageUri(uri);
//     if (!uri) {
//       // If image is cleared, reset description and reportSubmitted state if it was based on the previous image
//       setDescription("");
//       // setReportSubmitted(false); // Only reset if you want the submit button to go back to "Submit Report"
//     }
//   };

//   const handleSubmit = async () => {
//     if (!imageUri) {
//       Alert.alert("Error", "Please take a photo of the hazard.");
//       return;
//     }

//     if (!uniqueIdentifier) {
//       Alert.alert("Error", "User identifier is missing. Please restart the app.");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       const currentLocation = await getLocation();
//       if (!currentLocation) {
//         Alert.alert("Error", "Could not determine your location. Please enable location services and try again.");
//         setIsSubmitting(false);
//         return;
//       }

//       const compressed = await compressImage(imageUri); // Use imageUri
//       if (!compressed || !compressed.uri) {
//         throw new Error("Image compression failed.");
//       }

//       const hazardInfo = await analyze(compressed.uri);
//       setDescription(hazardInfo); // Show AI analysis result (valid or invalid)

//       if (hazardInfo.valid === false) {
//         Alert.alert("Invalid Image", `Image analysis failed: ${hazardInfo.invalid_reason || "Unknown reason"}. Please try a different image.`);
//         setReportSubmitted(true); // Mark as submitted (even if invalid) to change button text
//         setIsSubmitting(false);
//         return;
//       }

//       const reportResult = await createReport({
//         hazardData: {
//           hazard_type: hazardInfo.hazard_type,
//           hazard_sub_type: hazardInfo.hazard_sub_type,
//           hazard_description: hazardInfo.hazard_description,
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude,
//         },
//         imageUri: compressed.uri,
//         uniqueIdentifier: uniqueIdentifier,
//       });

//       if (reportResult && reportResult.success === false) {
//         throw new Error(reportResult.error?.message || "Failed to submit report due to a server error.");
//       }

//       Alert.alert("Success", "Your hazard report has been submitted. Thank you for contributing!");
//       setReportSubmitted(true); // Mark as submitted to change button text
//     } catch (error) {
//       // Description might already be set if analysis failed
//       // If it's not set, it means an error happened before/during analysis or during report creation
//       if (!description) {
//         // Provide a generic error if AI analysis didn't run or also failed
//         setDescription({ valid: false, invalid_reason: `Submission Error: ${error.message}` });
//       }
//       Alert.alert("Error", `Failed to submit report: ${error.message}`);
//       console.error("Error submitting report:", error);
//       setReportSubmitted(true); // Still mark as submitted to allow "Submit New Report"
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleNewReport = () => {
//     setImageUri(null); // This will be passed to CameraWidget, causing it to reset
//     setDescription("");
//     setReportSubmitted(false);
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust as needed
//     >
//       <ScrollView
//         ref={scrollViewRef}
//         keyboardShouldPersistTaps="handled"
//         className="flex-1 px-5 h-full" // Removed justify-content-around from ScrollView
//         contentContainerStyle={{ flexGrow: 1, justifyContent: "space-around" }} // Apply to contentContainerStyle
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="flex-1 justify-center gap-y-4 py-5">
//           {" "}
//           {/* Added py-5 for vertical padding */}
//           {/* Use CameraWidget and pass the correct props */}
//           <CameraWidget onImageCaptured={handleImageCaptured} imageUri={imageUri} />
//           {/* DescriptionInput will show AI analysis after submission attempt */}
//           <DescriptionInput value={description} />
//           <TouchableOpacity
//             className={`p-4 rounded-md items-center mt-2.5 ${isSubmitting || isCreating ? "bg-gray-400" : "bg-primary"}`}
//             onPress={reportSubmitted ? handleNewReport : handleSubmit}
//             disabled={isSubmitting || isCreating}
//           >
//             <Text className="text-white font-rsemibold text-xl">
//               {isSubmitting || isCreating ? "Submitting..." : reportSubmitted ? "Submit New Report" : "Submit Report"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default ReportScreen;

import { View, Text } from "react-native";
import React from "react";

const ReportScreen = () => {
  return (
    <View>
      <Text>ReportScreen</Text>
    </View>
  );
};

export default ReportScreen;
