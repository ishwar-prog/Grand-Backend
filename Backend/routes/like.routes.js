import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { 
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos } from "../controllers/like.controller.js";
const router = Router();

//protect all like routes - only logged-in users can like videos 
router.use(verifyJWT);

//Toggle like on Video , Comment , Tweet (POST = Toggle)
router.route("/toggle/v/:videoId").post(toggleVideoLike);        //like/unlike a video
router.route("/toggle/c/:commentId").post(toggleCommentLike);    //like/unlike a comment
router.route("/toggle/t/:tweetId").post(toggleTweetLike);        //like/unlike a tweet

//GET - Get all videos the user has liked 
router.route("/videos").get(getLikedVideos);

export default router;