import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "./ApiError.js";

// Initialize Gemini AI lazily
const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Gemini API Key is missing in process.env");
    throw new ApiError(500, "Gemini API key not configured on server");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Analyze video mood/segments from transcription or description
export const analyzeVideoMood = async (transcription, duration) => {
  const model = getGeminiModel();
  
  const prompt = `Analyze this video transcription and identify mood segments. For each segment, provide:
- startTime (in seconds)
- endTime (in seconds)  
- mood (one of: action, funny, chill, horror, intense, emotional)
- color (red for action, yellow for funny, blue for chill, black for horror, orange for intense, purple for emotional)

Transcription: "${transcription}"
Total video duration: ${duration} seconds

Return ONLY valid JSON array like:
[{"startTime": 0, "endTime": 30, "mood": "chill", "color": "#3B82F6"}]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Gemini mood analysis error:", error);
    return [];
  }
};

// Translate text to target language
export const translateText = async (text, targetLanguage) => {
  const model = getGeminiModel();
  
  const prompt = `Translate the following text to ${targetLanguage}. 
Keep the same tone and style. Return ONLY the translated text, nothing else.

Text: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw new ApiError(500, "Failed to translate text");
  }
};

// Transcribe audio description (simulated - would need actual audio processing)
export const generateTranscriptionFromDescription = async (videoTitle, videoDescription) => {
  const model = getGeminiModel();
  
  const prompt = `Based on this video title and description, generate a realistic transcription of what might be said in the video. Keep it natural and conversational.

Title: "${videoTitle}"
Description: "${videoDescription}"

Generate a 200-300 word transcription with natural speech patterns.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini transcription error:", error);
    return "";
  }
};

export default {
  getGeminiModel,
  analyzeVideoMood,
  translateText,
  generateTranscriptionFromDescription
};
