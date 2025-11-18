import  mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler( async ( req , res ) => {
    const { channelId } = req.params;
    //todo : toggle subscription to a channel
});

const getUserChannelSubscribers = asyncHandler( async ( req , res ) => {
    const { channelId } = req.params;
    //todo : get all subscribers of a channel
});

const getsubscribedChannels = asyncHandler( async ( req , res ) => {
    const { subscriberId } = req.params;
    //todo : get all channels the user is subscribed to
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getsubscribedChannels
}