import mongoose from "mongoose";
import { VideoAnalysis } from "../models/videoAnalysis.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectVideoGenre, analyzeVideoMood, translateText, generateTranscriptionFromDescription, getGenreColor } from "../utils/gemini.js";

// Analyze video genre and set timeline color
const analyzeVideoMoodSegments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if analysis already exists with genre detection
  let analysis = await VideoAnalysis.findOne({ video: videoId });
  
  if (analysis && analysis.detectedGenre && analysis.genreColor) {
    return res.status(200).json(
      new ApiResponse(200, analysis, "Video analysis already exists")
    );
  }

  // Detect genre from title and description using Gemini
  const genreResult = await detectVideoGenre(
    video.title,
    video.description || ""
  );

  // Create single segment covering entire video with detected genre color
  const duration = video.duration || 300;
  const moodSegments = [{
    startTime: 0,
    endTime: duration,
    mood: genreResult.genre,
    color: genreResult.color
  }];

  // Save or update analysis
  if (analysis) {
    analysis.detectedGenre = genreResult.genre;
    analysis.genreColor = genreResult.color;
    analysis.genreConfidence = genreResult.confidence;
    analysis.moodSegments = moodSegments;
    analysis.analyzedAt = new Date();
    await analysis.save();
  } else {
    analysis = await VideoAnalysis.create({
      video: videoId,
      detectedGenre: genreResult.genre,
      genreColor: genreResult.color,
      genreConfidence: genreResult.confidence,
      moodSegments
    });
  }

  return res.status(200).json(
    new ApiResponse(200, analysis, "Video genre analyzed successfully")
  );
});

// Get mood segments for video seekbar (returns genre color for entire timeline)
const getVideoMoodSegments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const analysis = await VideoAnalysis.findOne({ video: videoId })
    .select("moodSegments detectedGenre genreColor genreConfidence");

  // Return full analysis with genre info for the timeline color
  const responseData = {
    segments: analysis?.moodSegments || [],
    genre: analysis?.detectedGenre || null,
    color: analysis?.genreColor || null,
    confidence: analysis?.genreConfidence || 0
  };

  return res.status(200).json(
    new ApiResponse(200, responseData, "Video genre data fetched")
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
