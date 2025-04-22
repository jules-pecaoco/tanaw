import uuid from "react-native-uuid";
import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/tokens/tokens";
import { createClient } from "@supabase/supabase-js";
import storage from "@/storage/storage";
import { reverseGeocode } from "@/services/mapbox";

// Initialize Supabase client
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getUserId = () => {
  let userId = storage.getItem("userId");

  if (!userId) {
    userId = uuid.v4();
    storage.setItem("userId", userId);
  }

  return userId;
};

export const fetchHazardReports = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase.from("hazard_reports").select("*").gte("created_at", sevenDaysAgo.toISOString()).eq("active", true);

  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }

  const reportsWithNames = await Promise.all(
    data.map(async (report) => {
      const name = await reverseGeocode(report.latitude, report.longitude);
      return { ...report, name };
    })
  );

  return reportsWithNames;
};

const uploadImage = async (uri, fileName) => {
  try {
    // Create proper form data for the upload
    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      name: fileName,
      type: "image/jpeg",
    });

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

      const { data, error } = await uploadImage(imageUri, fileName);

      if (error) {
        console.error("Error uploading image:", error);
        return { success: false, error };
      }

      imagePath = data.path;
    }


    // Create hazard report
    const { data, error } = await supabase
      .from("hazard_reports")
      .insert([
        {
          user_id: userId,
          hazard_type: hazardData.hazard_type,
          hazard_sub_type: hazardData.hazard_sub_type,
          hazard_description: hazardData.hazard_description,
          latitude: hazardData.latitude,
          longitude: hazardData.longitude,
          image_path: imagePath,
          active: true,
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
