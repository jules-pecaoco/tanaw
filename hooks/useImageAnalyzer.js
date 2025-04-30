import { useState, useCallback } from "react";
import * as ImageManipulator from "expo-image-manipulator";

import { analyzeImageWithGemini } from "@/services/gemini";

/**
 * 
 * @returns {{
 *   analyze: (imageUri: string) => Promise<void>,
 *   compressImage: (imageUri: string) => Promise<{uri: string | null, error: Error | null}>,
 *   result: Object | null,
 *   error: string | null,
 *   loading: boolean
 * }}
 */
const useGeminiHazardAnalysis = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  
  /** 
    *@param {string} imageUri - the image directory  
    * 
  */
  const compressImage = useCallback(async (imageUri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 1000 } }], {
        compress: 0.65,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return { uri: result.uri, error: null };
    } catch (error) {
      console.error("Image compression failed:", error);
      setError(error.message || "Failed to compress image.");
      return { uri: null, error };
    }
  }, []);

  const analyze = useCallback(
    async (imageUri) => {
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        // Option to use compressed image first

        const hazardInfo = await analyzeImageWithGemini(imageUri);
        setResult(hazardInfo);
        return hazardInfo;
      } catch (err) {
        setError(err.message || "Something went wrong during image analysis.");
      } finally {
        setLoading(false);
      }
    },
    [compressImage]
  );

  return { analyze, compressImage, result, error, loading };
};

export default useGeminiHazardAnalysis;
