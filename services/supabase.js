import { Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/tokens/tokens";
import { reverseGeocode } from "@/services/mapbox";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== FETCH REPORTS ========== //
const fetchHazardReports = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 10);

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

// ========== UPLOAD IMAGE ========== //
const uploadImage = async (uri, fileName) => {
  try {
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Image upload failed:", error);
    return { data: null, error };
  }
};

// ========== UPLOAD REPORT ========== //
const uploadHazardReport = async (hazardData, imageUri, uniqueIdentifier) => {
  try {
    const userId = uniqueIdentifier || null;
    let imagePath = null;

    if (imageUri) {
      const fileName = `${userId}_${Date.now()}.jpg`;
      const { data, error } = await uploadImage(imageUri, fileName);
      if (error) return { success: false, error };
      imagePath = data.path;
    }

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

    reverseGeocode(hazardData.latitude, hazardData.longitude);
    notifyNearbyUsers(hazardData.latitude, hazardData.longitude, uniqueIdentifier, hazardData.hazard_type, hazardData.hazard_description, location);

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: "Unexpected error occurred" } };
  }
};

const notifyNearbyUsers = async (latitude, longitude, uniqueIdentifier, hazardType, hazardDescription, location) => {
  const body = {
    lat: latitude,
    lon: longitude,
    uuid: uniqueIdentifier,
    hazard_type: hazardType,
    hazard_description: hazardDescription,
    location: location,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "x-secret-key": "tanaw",
  };

  try {
    const response = axios.post("https://dyankftudmfpxqwqkynf.supabase.co/functions/v1/notify_nearby_users", body, { headers });
    console.log("Notification response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error notifying nearby users:", error);
  }
};

// ========== PUBLIC IMAGE URL ========== //
const getImageUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from("hazard-images").getPublicUrl(path);
  return data?.publicUrl || null;
};

// ========== UPLOAD USER LOCATION + PUSH TOKEN ========== //
const uploadUserIdentifier = async (uniqueIdentifier, location, pushToken) => {
  console.log("Uploading user identifier...");
  console.log("UUID:", uniqueIdentifier);
  console.log("Location:", location);
  console.log("Expo Push Token:", pushToken);
  try {
    const { error } = await supabase.from("users_identifier").upsert(
      {
        uuid: uniqueIdentifier,
        latitude: location.latitude,
        longitude: location.longitude,
        push_token: pushToken,
      },
      { onConflict: ["uuid"] }
    );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Failed to upload user device info:", error);
    return { success: false, error };
  }
};

export { fetchHazardReports, uploadHazardReport, getImageUrl, uploadUserIdentifier, supabase };
