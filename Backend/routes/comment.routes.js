import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

//GET - Get all comments of a video (public, no auth required)
router.route("/:videoId").get(getVideoComments);

//all routes below require auth
router.use(verifyJWT);

//POST - create a comment
router.route("/:videoId").post(addComment);

//DELETE - delete a comment(only owner)
router.route("/c/:commentId").delete(deleteComment);

//PATCH - update a comment(only owner)
router.route("/c/:commentId").patch(updateComment);

export default router