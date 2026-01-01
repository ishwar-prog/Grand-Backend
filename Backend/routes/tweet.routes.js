import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet, getAllTweets } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//all tweet routes require auth
router.use(verifyJWT);

//GET all tweets (community feed)
router.route("/all").get(getAllTweets);

//CREATE a new tweet
router.route("/").post(createTweet);

//GET all tweets of a user
router.route("/user/:userId").get(getUserTweets);

//UPDATE or DELETE a specific tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;