import { Router } from "express";
import { 
    deleteVideo,
    getAllUserVideos,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo   
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//PUBLIC routes (no auth required)
router.route("/").get(getAllVideos);                    //Get all published videos (public)
router.route("/user/:userId").get(getAllUserVideos);    //Get all videos of a user (public)

//all video routes require auth
router.use(verifyJWT);

//Publish a new video (upload video + thumbnail)
router
.route("/")
.post(
    upload.fields([
        { name : "videoFile" , maxCount : 1},
        { name : "thumbnail" , maxCount : 1}
    ]),
    publishAVideo
)

//GET single video by ID (with view count , likes , subscribe status)
router.route("/:videoId").get(getVideoById);

//UPDATE video Details (title , description , thumbnail)
router
.route("/:videoId")
.patch(upload.single("thumbnail"), updateVideo);

//Delete a video(only owner)
router.route("/:videoId").delete(deleteVideo);

//Toggle publish status (public -> pvt/draft)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
