import mongoose , { isValidObjectId }from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler( async ( req , res ) => {
    //todo : create a new tweet
    const { content } = req.body;

    if(!content?.trim()){
        throw new ApiError(400 , "Invalid content")
    }

    const tweet = await Tweet.create({
        content : content.trim(),
        owner : req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201 , tweet , "Tweet created successfully"))
});

const getUserTweets = asyncHandler( async ( req , res ) => {
    //todo : get all tweets of a user
    const { userId } = req.params;  //

    if(!isValidObjectId(userId)){
        throw new ApiError(400 , "Invalid user ID")
    }

    const userTweets = await Tweet.aggregate([
        {
            $match :{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner"
            }
        },
        {
            $unwind : "$owner"
        },
        {
            $lookup :{
                from : "likes",
                localField : "_id",
                foreignField : "tweet",
                as : "likes"
            }
        },
        {
            $addFields :{
                likeCount : { $size : "$likes"},
                owner :{
                    _id : "$owner._id",
                    username : "$owner.username",
                    avatar : "$owner.avatar",
                    fullName : "$owner.fullName"
                }
            }
        },
        {
            $project :{
                content : 1,
                owner : 1,
                likeCount : 1,
                createdAt : 1,
                updatedAt : 1
            }
        },
        {
            $sort :{ createdAt : -1 }   //newest tweets first
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200 , userTweets , "User tweets fetched successfully"))
});

const updateTweet = asyncHandler( async ( req , res ) => {
    //todo : update tweet details
    const { tweetId } = req.params; //
    const { content } = req.body;
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "Invalid tweet ID")
    }

    if(!content?.trim()){
        throw new ApiError(400 , "Tweet content is required")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id : tweetId , owner : userId   // only owner can update
        },
        { $set :{ content : content.trim() } },
        { new : true }
    )

    if(!tweet){
        throw new ApiError ( 404 , "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "Tweet updated successfully"))
});

const deleteTweet = asyncHandler( async ( req , res ) => {
    //todo : delete a tweet
    const { tweetId } = req.params; //
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "Invalid tweet ID")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id : tweetId,
        owner : userId           //only owner can delete
    })

    if(!tweet){
        throw new ApiError(404 , "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , tweet , "Tweet deleted successfully"))
});

const getAllTweets = asyncHandler( async ( req , res ) => {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                isLiked: {
                    $in: [new mongoose.Types.ObjectId(userId), "$likes.likedBy"]
                },
                isOwner: { $eq: ["$owner._id", new mongoose.Types.ObjectId(userId)] },
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar",
                    fullName: "$owner.fullName"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                likeCount: 1,
                isLiked: 1,
                isOwner: 1,
                createdAt: 1
            }
        }
    ]);

    const total = await Tweet.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        tweets,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < total
    }, "Tweets fetched successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}