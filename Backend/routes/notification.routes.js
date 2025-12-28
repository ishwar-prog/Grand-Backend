import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserNotifications, markNotificationRead } from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserNotifications);
router.route("/:notificationId/read").patch(markNotificationRead);

export default router;
