import mongoose from "mongoose";
import { VideoAnalysis } from "../models/videoAnalysis.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeVideoMood, translateText, generateTranscriptionFromDescription } from "../utils/gemini.js";

// Analyze video mood and generate color-coded segments
const analyzeVideoMoodSegments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if analysis already exists
  let analysis = await VideoAnalysis.findOne({ video: videoId });
  
  if (analysis && analysis.moodSegments.length > 0) {
    return res.status(200).json(
      new ApiResponse(200, analysis, "Mood analysis already exists")
    );
  }

  // Generate transcription from title/description if not available
  const transcription = await generateTranscriptionFromDescription(
    video.title,
    video.description || ""
  );

  // Analyze mood segments
  const moodSegments = await analyzeVideoMood(transcription, video.duration || 300);

  // Save or update analysis
  if (analysis) {
    analysis.transcription = transcription;
    analysis.moodSegments = moodSegments;
    analysis.analyzedAt = new Date();
    await analysis.save();
  } else {
    analysis = await VideoAnalysis.create({
      video: videoId,
      transcription,
      moodSegments
    });
  }

  return res.status(200).json(
    new ApiResponse(200, analysis, "Video mood analyzed successfully")
  );
});

// Get mood segments for video seekbar
const getVideoMoodSegments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const analysis = await VideoAnalysis.findOne({ video: videoId })
    .select("moodSegments");

  return res.status(200).json(
    new ApiResponse(200, analysis?.moodSegments || [], "Mood segments fetched")
  );
});

// Translate video transcription to another language
/*
const translateVideoTranscription = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { targetLanguage } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!targetLanguage) {
    throw new ApiError(400, "Target language is required");
  }

  let analysis = await VideoAnalysis.findOne({ video: videoId });
  
  if (!analysis || !analysis.transcription) {
    // Generate transcription first
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    
    const transcription = await generateTranscriptionFromDescription(
      video.title,
      video.description || ""
    );
    
    if (!analysis) {
      analysis = await VideoAnalysis.create({
        video: videoId,
        transcription
      });
    } else {
      analysis.transcription = transcription;
      await analysis.save();
    }
  }

  // Check if translation already exists
  const existingTranslation = analysis.translations.find(
    t => t.language.toLowerCase() === targetLanguage.toLowerCase()
  );

  if (existingTranslation) {
    return res.status(200).json(
      new ApiResponse(200, existingTranslation, "Translation already exists")
    );
  }

  // Translate the transcription
  const translatedText = await translateText(analysis.transcription, targetLanguage);

  // Save translation
  const newTranslation = {
    language: targetLanguage,
    translatedText
  };

  analysis.translations.push(newTranslation);
  await analysis.save();

  return res.status(200).json(
    new ApiResponse(200, newTranslation, "Translation completed successfully")
  );
});
*/
const translateVideoTranscription = asyncHandler(async (req, res) => {
    throw new ApiError(501, "Translation feature disabled");
});

// Get all translations for a video
const getVideoTranslations = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const analysis = await VideoAnalysis.findOne({ video: videoId })
    .select("translations transcription");

  return res.status(200).json(
    new ApiResponse(200, {
      transcription: analysis?.transcription || null,
      translations: analysis?.translations || []
    }, "Translations fetched")
  );
});

// Get full video analysis
const getVideoAnalysis = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const analysis = await VideoAnalysis.findOne({ video: videoId });

  return res.status(200).json(
    new ApiResponse(200, analysis, "Video analysis fetched")
  );
});

export {
  analyzeVideoMoodSegments,
  getVideoMoodSegments,
  translateVideoTranscription,
  getVideoTranslations,
  getVideoAnalysis
};
