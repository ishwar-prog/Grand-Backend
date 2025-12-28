import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  analyzeVideoMoodSegments,
  getVideoMoodSegments,
  translateVideoTranscription,
  getVideoTranslations,
  getVideoAnalysis
} from "../controllers/ai.controller.js";

const router = Router();

// All AI routes require authentication
router.use(verifyJWT);

// Mood analysis routes
router.route("/analyze/:videoId").post(analyzeVideoMoodSegments);
router.route("/mood/:videoId").get(getVideoMoodSegments);

// Translation routes
// router.route("/translate/:videoId").post(translateVideoTranscription);
router.route("/translations/:videoId").get(getVideoTranslations);

// Full analysis
router.route("/analysis/:videoId").get(getVideoAnalysis);

export default router;
