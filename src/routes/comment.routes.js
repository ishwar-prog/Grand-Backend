import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

//apply jwt verification to ALL comment routes
router.use(verifyJWT);

//GET - Get all comments of a video
router.route("/:videoId").get(getVideoComments);

//POST - create a comment
router.route("/:videoId").post(addComment);

//DELETE - delete a comment(only owner)
router.route("/c/:commentId").delete(deleteComment);

//PATCH - update a comment(only owner)
router.route("/c/:commentId").patch(updateComment);

export default router