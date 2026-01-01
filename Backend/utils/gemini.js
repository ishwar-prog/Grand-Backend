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

// Genre to color mapping - industry standard colors
const GENRE_COLOR_MAP = {
  horror: "#1a1a1a",      // Black/Dark
  funny: "#FACC15",       // Bright Yellow
  cartoon: "#EC4899",     // Pink
  action: "#EF4444",      // Red
  war: "#DC2626",         // Deep Red
  military: "#B91C1C",    // Dark Red
  music: "#3B82F6",       // Blue
  chill: "#60A5FA",       // Light Blue
  relaxing: "#38BDF8",    // Sky Blue
  documentary: "#22C55E", // Green
  nature: "#16A34A",      // Forest Green
  educational: "#4ADE80", // Light Green
  anime: "#F97316",       // Orange
  coding: "#6B7280",      // Grey
  tech: "#9CA3AF",        // Light Grey
  tutorial: "#78716C",    // Warm Grey
  gaming: "#8B5CF6",      // Purple
  sports: "#14B8A6",      // Teal
  news: "#64748B",        // Slate
  other: "#8B5CF6"        // Default Purple
};

// Detect video genre from title and description
export const detectVideoGenre = async (title, description = "") => {
  const model = getGeminiModel();
  
  const prompt = `Analyze this video and determine its PRIMARY genre/category. Choose ONLY ONE that best fits.

Video Title: "${title}"
Video Description: "${description}"

Available genres (pick exactly ONE):
- horror: Scary, spooky, thriller, creepy content
- funny: Comedy, jokes, pranks, humorous content
- cartoon: Animated shows for kids (NOT anime), cartoons like SpongeBob, Mickey Mouse
- action: Action movies, stunts, fights, car chases
- war: War movies, battle scenes, historical wars
- military: Military content, army, weapons, tactical
- music: Music videos, songs, concerts, musical performances
- chill: Relaxing content, lo-fi, ambient, peaceful
- relaxing: ASMR, meditation, sleep content
- documentary: Documentaries about any topic
- nature: Wildlife, nature footage, landscapes, animals
- educational: Learning content, explanations, how-to (non-tech)
- anime: Japanese animation, anime series, manga adaptations
- coding: Programming, coding tutorials, software development
- tech: Technology reviews, gadgets, tech news
- tutorial: General tutorials, DIY, guides (non-coding)
- gaming: Video games, gameplay, gaming commentary
- sports: Sports content, matches, athletics
- news: News, current events, journalism
- other: If nothing else fits

Respond with ONLY a valid JSON object like this:
{"genre": "coding", "confidence": 0.95}

No explanation, no markdown, ONLY the JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const genre = parsed.genre?.toLowerCase() || "other";
      const confidence = parsed.confidence || 0.5;
      
      // Validate genre exists in our map
      const validGenre = GENRE_COLOR_MAP[genre] ? genre : "other";
      const color = GENRE_COLOR_MAP[validGenre];
      
      return {
        genre: validGenre,
        color,
        confidence
      };
    }
    return { genre: "other", color: GENRE_COLOR_MAP.other, confidence: 0 };
  } catch (error) {
    console.error("Gemini genre detection error:", error);
    return { genre: "other", color: GENRE_COLOR_MAP.other, confidence: 0 };
  }
};

// Legacy: Analyze video mood segments (kept for compatibility)
export const analyzeVideoMood = async (transcription, duration) => {
  const model = getGeminiModel();
  
  const prompt = `Analyze this video transcription and identify mood segments. For each segment, provide:
- startTime (in seconds)
- endTime (in seconds)  
- mood (one of: action, funny, chill, horror, anime, coding, music, nature, cartoon, other)
- color (use appropriate hex color)

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

// Get color for a genre
export const getGenreColor = (genre) => {
  return GENRE_COLOR_MAP[genre] || GENRE_COLOR_MAP.other;
};

export default {
  getGeminiModel,
  detectVideoGenre,
  analyzeVideoMood,
  translateText,
  generateTranscriptionFromDescription,
  getGenreColor,
  GENRE_COLOR_MAP
};
