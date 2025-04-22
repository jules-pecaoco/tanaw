import axios from "axios";

import { GEMINI_URL, GEMINI_API_KEY } from "@/tokens/tokens";
/**
 * Send image to Gemini API for hazard analysis
 * @param {string} imageUri - URI of the image to analyze
 * @returns {Promise<Object>} - Hazard information from Gemini
 */
const analyzeImageWithGemini = async (imageUri) => {
  try {
    const imageData = await prepareImageForGemini(imageUri);

    const endpoint = GEMINI_URL;
    const apiKey = GEMINI_API_KEY;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this image and identify any potential hazards. Return only a JSON object with hazard_type, hazard_sub_type, and hazard_description fields. Limit the description to 3 sentences or less. Categorize the hazard type by the following {Typhoon, Flooding, Earthquakes, Volcanic Eruptions, Landslides, Tsunami, Extreme Heat}. Other fields can be descriptive aside from hazard_sub_type which can be a subcategory of a hazard.",
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData,
              },
            },
          ],
        },
      ],
    };

    const response = await axios({
      method: "post",
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      data: payload,
    });

    const data = response.data;

    const textResponse = data.candidates[0].content.parts[0].text;

    const parsedResponse = parseGeminiResponse(textResponse);

    console.log("Parsed Gemini response:", parsedResponse);

    return parsedResponse;
  } catch (error) {
    if (error.response) {
      throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || "Unknown error"}`);
    } else if (error.request) {
      throw new Error("No response received from Gemini API");
    } else {
      throw new Error(`Gemini API request setup failed: ${error.message}`);
    }
  }
};

const parseGeminiResponse = (textResponse) => {
  try {
    // Extract the JSON part from the response
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);

    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("No JSON found in the response");
    }

    // Parse the JSON string into an object
    const parsedData = JSON.parse(jsonMatch[1]);

    // Create the object with the specified structure and fallback values
    const hazardInfo = {
      hazard_type: parsedData.hazard_type || "Unknown",
      hazard_sub_type: parsedData.hazard_sub_type || "Unknown",
      hazard_description: parsedData.hazard_description || "No description provided",
    };

    return hazardInfo;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return default object in case of parsing error
    return {
      hazard_type: "Unknown",
      hazard_sub_type: "Unknown",
      hazard_description: "No description provided",
    };
  }
};

/**
 * Prepare image for sending to Gemini API
 * @param {string} uri - The URI of the image
 * @returns {Promise<string>} - Base64 or prepared image data
 */
const prepareImageForGemini = async (uri) => {
  try {
    const response = await axios({
      method: "get",
      url: uri,
      responseType: "blob",
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    if (error.response) {
      throw new Error(`Failed to fetch image: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("No response received when fetching image");
    } else {
      throw new Error(`Failed to prepare image for Gemini: ${error.message}`);
    }
  }
};

export { analyzeImageWithGemini };
