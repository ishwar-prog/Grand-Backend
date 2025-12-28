import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //todo : toggle like for a video
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const alreadyLiked = await Like.findOne({
    likedBy: userId,
    video: videoId,
  });

  if (alreadyLiked) {
    await alreadyLiked.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  } else {
    const like = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    // Notify Video Owner
    const video = await Video.findById(videoId);
    if (video && video.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: video.owner,
        sender: userId,
        type: "LIKE",
        video: videoId
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Video liked successfully")
      );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //todo : toggle like for a comment
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
      );
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    // Notify Comment Owner
    const comment = await Comment.findById(commentId);
    if (comment && comment.owner.toString() !== userId.toString()) {
      await Notification.create({
        recipient: comment.owner,
        sender: userId,
        type: "LIKE",
        comment: commentId,
        video: comment.video // Assuming comment has video reference
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //todo : toggle like for a tweet
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ _id: alreadyLiked._id });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully")
      );
  } else {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: true }, "Tweet liked successfully")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //todo : get all liked videos of the user
  const userId = req.user._id;
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner",
      },
    },
    {
      $unwind: "$video.owner",
    },
    {
      $project: {
        _id: 0,
        likedAt: "$createdAt",
        video: {
          _id: 1,
          title: 1,
          description: 1,
          thumbnail: 1,
          duration: 1,
          views: 1,
          isPublished: 1,
          createdAt: "$video.createdAt",
          owner: {
            username: "$video.owner.username",
            avatar: "$video.owner.avatar",
            fullName: "$video.owner.fullName",
          },
        },
      },
    },
    {
      $sort: { likedAt: -1 }, //Most recently Liked First
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
