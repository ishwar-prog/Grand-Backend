import mongoose from "mongoose";

const moodSegmentSchema = new mongoose.Schema({
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  mood: { 
    type: String, 
    enum: ["action", "funny", "chill", "horror", "intense", "emotional"],
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
  moodSegments: [moodSegmentSchema],
  translations: [translationSchema],
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);
