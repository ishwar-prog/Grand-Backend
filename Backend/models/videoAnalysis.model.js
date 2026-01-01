import mongoose from "mongoose";

// Video genre/mood types with corresponding colors
const VIDEO_GENRES = [
  "horror",      // black/dark
  "funny",       // bright yellow
  "cartoon",     // pink
  "action",      // red
  "war",         // red
  "military",    // red
  "music",       // blue
  "chill",       // blue
  "relaxing",    // blue
  "documentary", // green
  "nature",      // green
  "educational", // green
  "anime",       // orange
  "coding",      // grey
  "tech",        // grey
  "tutorial",    // grey
  "gaming",      // purple
  "sports",      // teal
  "news",        // slate
  "other"        // default purple
];

const moodSegmentSchema = new mongoose.Schema({
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  mood: { 
    type: String, 
    enum: VIDEO_GENRES,
    required: true 
  },
  color: { type: String, required: true }
});

const translationSchema = new mongoose.Schema({
  language: { type: String, required: true },
  translatedText: { type: String, required: true },
  audioUrl: { type: String }, // URL to generated TTS audio
  createdAt: { type: Date, default: Date.now }
});

const videoAnalysisSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
    unique: true
  },
  transcription: { type: String },
  detectedGenre: { 
    type: String, 
    enum: VIDEO_GENRES,
    default: "other"
  },
  genreColor: { type: String, default: "#8B5CF6" }, // Default purple
  genreConfidence: { type: Number, default: 0 },
  moodSegments: [moodSegmentSchema],
  translations: [translationSchema],
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);
export { VIDEO_GENRES };
