import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler( async ( req , res ) => {
    //todo : create a new tweet
});

const getUserTweets = asyncHandler( async ( req , res ) => {
    const { userId } = req.params;  //
    //todo : get all tweets of a user
});

const updateTweet = asyncHandler( async ( req , res ) => {
    const { tweetId } = req.params; //
    //todo : update tweet details
});

const deleteTweet = asyncHandler( async ( req , res ) => {
    const { tweetId } = req.params; //
    //todo : delete a tweet
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}