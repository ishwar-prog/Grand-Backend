import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteAllNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserNotifications).delete(deleteAllNotifications);
router.route("/read-all").patch(markAllNotificationsRead);
router.route("/:notificationId/read").patch(markNotificationRead);

export default router;
