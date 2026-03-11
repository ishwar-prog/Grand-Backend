import { Router } from "express";
import {
  deleteVideo,
  getAllUserVideos,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  cloudinaryWebhook
} from "../controllers/video.controller.js";
import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//PUBLIC routes (no auth required)
router.route("/").get(getAllVideos); //Get all published videos (public)
router.route("/user").get(optionalJWT, getAllUserVideos); //Get all videos of a user - shows drafts only to owner
router.route("/webhook/cloudinary").post(cloudinaryWebhook); // Webhook from Cloudinary for HLS

//GET single video by ID - public, but auth is optional (for isLiked / isSubscribed)
router.route("/:videoId").get(optionalJWT, getVideoById);

//all routes below require auth
router.use(verifyJWT);

//Publish a new video (upload video + thumbnail)
router.route("/").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

//UPDATE video Details (title , description , thumbnail)
router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);

//Delete a video(only owner)
router.route("/:videoId").delete(deleteVideo);

// Toggle publish status (public -> pvt/draft)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
