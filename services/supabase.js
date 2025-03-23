import uuid from "react-native-uuid";
import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/tokens/tokens";
import { createClient } from "@supabase/supabase-js";
import userStorage from "@/storage/userStorage";

// Replace with your Supabase URL and anon key
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Local storage for user ID

// Get or create user ID
export const getUserId = () => {
  let userId = userStorage.getItem("userId");

  if (!userId) {
    userId = uuid.v4();
    userStorage.setItem("userId", userId);
  }

  return userId;
};

// Fetch hazard reports with filters
export const fetchHazardReports = async () => {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase.from("hazard_reports").select("*").gte("created_at", sevenDaysAgo.toISOString()).eq("active", true);

  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }

  return data;
};

const compressHazardImage = async (uri) => {
  try {
    // 0.65 quality provides good compression while keeping important details visible
    // 1000px width is sufficient for most hazard documentation
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1000 } }], {
      compress: 0.65,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    console.log(`Original image compressed: ${uri} -> ${result.uri}`);
    return { uri: result.uri, error: null };
  } catch (error) {
    console.error("Image compression failed:", error);
    return { uri: null, error };
  }
};

const uploadImage = async (uri, fileName) => {
  const { uri: compressedUri, error: compressionError } = await compressHazardImage(uri);

  if (compressionError) {
    console.warn("Compression failed, using original image:", compressionError);
  }

  try {
    // Create proper form data for the upload
    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : compressedUri,
      name: fileName,
      type: "image/jpeg", // Adjust based on your image type
    });

    // For React Native, we may need to add specific headers
    const { data, error } = await supabase.storage.from("hazard-images").upload(fileName, formData, {
      contentType: "multipart/form-data",
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error("Image upload process failed:", error);
    return { data: null, error };
  }
};

// Updated uploadHazardReport function with better error handling
export const uploadHazardReport = async (hazardData, imageUri) => {
  try {
    const userId = getUserId();

    // Upload image first
    let imagePath = null;
    if (imageUri) {
      const fileName = `${userId}_${new Date().getTime()}.jpg`;
      console.log("Uploading image with filename:", fileName);

      const { data, error } = await uploadImage(imageUri, fileName);

      if (error) {
        console.error("Error uploading image:", error);
        return { success: false, error };
      }

      imagePath = data.path;
      console.log("Image uploaded successfully to path:", imagePath);
    }

    // Create hazard report
    console.log("Creating hazard report with image path:", imagePath);
    const { data, error } = await supabase
      .from("hazard_reports")
      .insert([
        {
          user_id: userId,
          hazard_type: hazardData.hazardType,
          description: hazardData.description,
          latitude: hazardData.latitude,
          longitude: hazardData.longitude,
          image_path: imagePath,
          active: true, // Make sure to set active status
        },
      ])
      .select();

    if (error) {
      console.error("Error creating report:", error);
      return { success: false, error };
    }

    console.log("Report created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error in uploadHazardReport:", error);
    return { success: false, error: { message: "Unexpected error occurred" } };
  }
};
// Get public URL for an image
export const getImageUrl = (path) => {
  if (!path) return null;

  const { data } = supabase.storage.from("hazard-images").getPublicUrl(path);
  return data?.publicUrl || null;
};
