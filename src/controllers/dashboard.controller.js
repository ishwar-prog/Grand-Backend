import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  //todo : get channel stats like total video viws , total subscribers , total videos , total likes etc
  const userId = req.user._id;

  const channelStats = await User.aggregate([
    //step 1 Match the current user
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    //step 2 get all videos uploaded by this user
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "uploadedVideos",
      },
    },
    //step3 get all subscribers (people subscribed to this channel)
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    //step 4 get total likes on all videos of this channel
    {
      $lookup: {
        from: "likes",
        let: { videoIds: "$uploadedVideos._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$video", "$$videoIds"],
              },
            },
          },
        ],
        as: "totalLikesOnVideos",
      },
    },
    //step 5 Calculate everything
    {
      $addFields: {
        totalVideos: { $size: "$uploadedVideos" },
        totalSubscribers: { $size: "$subscribers" },
        totalLikes: {
          $size: {
            $ifNull: ["$totalLikesOnVideos", []],
          },
        },
        totalViews: {
          $sum: {
            $map: {
              input: "$uploadedVideos",
              as: "video",
              in: { $ifNull: ["$$video.views", 0] }, //views is a number not an array
            },
          },
        },
      },
    },

    //step 6 final output
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        totalVideos: 1,
        totalViews: 1,
        totalSubscribers: 1,
        totalLikes: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channelStats || channelStats.length === 0) {
    throw new ApiError(404, "Channel not Found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats[0],
        "Channel stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  //todo : get all videos of a channel
  const userId = req.user._id;

  const videos = await Video.aggregate([
    //get only videos uploaded by this user
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },

    //Optional : Add view count (since views is your schema)
    {
      $addFields: {
        viewCount: { $ifNull: ["$views", 0] },
        durationInMinutes: { $round: [{ $divide: ["$duration", 60] }, 1] },
      },
    },

    //sort by newest first
    {
      $sort: { createdAt: -1 },
    },
    //Slect only needed fields
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        durationInMinutes: 1,
        viewCount: 1,
        isPublished: 1,
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
