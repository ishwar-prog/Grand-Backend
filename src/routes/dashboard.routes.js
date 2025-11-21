import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
const router = Router();

//protect ALL dashboard routes - only logged-in users can see their stats
router.use(verifyJWT);

//GET  /api/v1/dashboard/stats -> Total views , likes , subscribers , videos
router.route("/stats").get(getChannelStats);

//GET  /api/v1/dashboard/videos -> all videos uploaded by user
router.route("/videos").get(getChannelVideos);

export default router;
