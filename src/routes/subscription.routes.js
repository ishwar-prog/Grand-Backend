import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
const router = Router();

//all subscription routes require auth
router.use(verifyJWT);

//Toggle subscription (subscribe/unsubscribe)
//POST -> becoz we are "creating" or "deleting" subscription
router.route("/c/:channelId").post(toggleSubscription);    //toggle subscription

//GET all subscribers of a channel (who subscribed to this channel)
router
.route("/c/:channelId")
.get(getUserChannelSubscribers)     //GET subscribers list

//GET all channels that a user is subscribed to
router
.route("/subscribed")
.get(getSubscribedChannels)     //GET subscribed channels list


export default router;