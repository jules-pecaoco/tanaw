import axios from "axios";
import { GEMINI_URL, GEMINI_API_KEY } from "@/tokens/tokens";

/**
 * Send image to Gemini API for hazard analysis
 * @param {string} imageUri - URI of the image to analyze
 * @returns {Promise<Object>} - Hazard information or invalid reason from Gemini
 */
const analyzeImageWithGemini = async (imageUri) => {
  try {
    const imageData = await prepareImageForGemini(imageUri);

    const endpoint = GEMINI_URL;
    const apiKey = GEMINI_API_KEY;

    const prompt = `
Analyze the following image and determine whether it depicts any identifiable natural hazards. 
If hazards are detected, return a JSON array of objects describing each one. 
Each object must include: 
- "hazard_type" (one of: Typhoon, Flooding, Earthquakes, Volcanic Eruptions, Landslides, Tsunami, Extreme Heat),
- "hazard_sub_type" (a more specific classification),
- "hazard_description" (max 3 sentences).

If the image is invalid or unrelated to natural hazards (e.g. blurry, crowd scene, unrelated indoor activity), 
return a JSON object with:
- "valid": false,
- "invalid_reason": string describing the issue.

**Example of analyzing an image and finding a flood:**
\`\`\`json
[
  {
    "hazard_type": "Flooding",
    "hazard_sub_type": "Urban street flooding",
    "hazard_description": "The image shows a city street submerged in murky water. Cars are partially underwater, and water levels reach near the ground floor of buildings.",
    "confidence_level": "High"
  }
]
\`\`\`

**Example of analyzing a blurry image:**
\`\`\`json
{
  "valid": false,
  "invalid_reason_code": "BLURRY_IMAGE",
  "invalid_reason_description": "Image is too blurry to analyze."
}
`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
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

    const textResponse = response.data.candidates[0].content.parts[0].text;
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

/**
 * Parses Gemini response which may be a hazard array or an invalid object
 * @param {string} textResponse
 * @returns {Object}
 */
const parseGeminiResponse = (textResponse) => {
  try {
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) throw new Error("No JSON found in the response");

    const parsed = JSON.parse(jsonMatch[1]);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const item = parsed[0];
      return {
        valid: true,
        hazard_type: item.hazard_type || "Unknown",
        hazard_sub_type: item.hazard_sub_type || "Unknown",
        hazard_description: item.hazard_description || "No description provided",
      };
    } else if (parsed.valid === false && parsed.invalid_reason) {
      return {
        valid: false,
        invalid_reason: parsed.invalid_reason,
      };
    } else {
      throw new Error("Unexpected JSON structure");
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      valid: false,
      invalid_reason: "Failed to parse Gemini response",
    };
  }
};

/**
 * Prepare image for sending to Gemini API
 * @param {string} uri - The URI of the image
 * @returns {Promise<string>} - Base64-encoded image data
 */
const prepareImageForGemini = async (uri) => {
  try {
    const response = await axios({ method: "get", url: uri, responseType: "blob" });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
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
