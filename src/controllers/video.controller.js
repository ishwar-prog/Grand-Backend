import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //todo : get all videos based on query , sort , pagination
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const sortDirection = sortType === "asc" ? 1 : -1;

  const aggregatePipleline = [
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    // Search filter: match video title OR channel username
    ...(query
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: query, $options: "i" } },
                { "channel.username": { $regex: query, $options: "i" } },
              ],
            },
          },
        ]
      : []),
    {
      $project: {
        _id: 1,
        title: 1,
        thumbnail: 1,
        views: { $ifNull: ["$views", 0] }, //views is number
        duration: 1,
        isPublished: 1,
        "channel._id": 1,
        "channel.username": 1,
        "channel.avatar": 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { [sortBy]: sortDirection } },
  ];

  const options = {
    page: pageNumber,
    limit: limitNumber,
  };

  const result = await Video.aggregatePaginate(
    Video.aggregate(aggregatePipleline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const getAllUserVideos = asyncHandler(async (req, res) => {
  //todo : get all videos of a user
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const sortDirection = sortType === "asc" ? 1 : -1;

  const aggregatePipeline = [
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    // Search filter: match video title OR channel username
    ...(query
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: query, $options: "i" } },
                { "channel.username": { $regex: query, $options: "i" } },
              ],
            },
          },
        ]
      : []),
    {
      $addFields: {
        views: { $ifNull: ["$views", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        "channel.username": 1,
        "channel.fullName": 1,
        "channel.avatar": 1,
      },
    },
    {
      $sort: { [sortBy]: sortDirection },
    },
  ];

  const options = {
    page: pageNumber,
    limit: limitNumber,
  };

  const result = await Video.aggregatePaginate(
    Video.aggregate(aggregatePipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  //todo : get video , upload to cloudinary  , create video
  const { title, description } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  let thumbnailLocalPath;
  if (req.files?.thumbnail?.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  const videoFile = await uploadToCloudinary(videoLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "Failed to upload video");
  }

  const thumbnail = thumbnailLocalPath
    ? await uploadToCloudinary(thumbnailLocalPath)
    : null;

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail?.url || "",
    owner: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    duration: videoFile.duration,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //todo : get video by id
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  //Increment view count and add to watch history
  await Promise.all([
    Video.findByIdAndUpdate(
      videoId,
      // { $addToSet: { views: req.user._id } },
      { $inc: { views: 1 } },
      { new: true }
    ),
    User.findByIdAndUpdate(
      req.user._id,
      { $push: { watchHistory: { $each: [videoId], $position: 0 } } }, //Add to beginning
      { new: true }
    ),
  ]);

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        viewsCount: { $ifNull: ["$views", 0] }, //views is array of user ids
        channel: {
          _id: "$channel._id",
          username: "$channel.username",
          fullName: "$channel.fullName",
          avatar: "$channel.avatar",
          subscribersCount: { $size: "$subscribers" },
          isSubscribed: {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(req.user._id),
                  {
                    $map: {
                      input: "$subscribers",
                      as: "sub",
                      in: "$$sub.subscriber",
                    },
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        viewsCount: 1,
        isPublished: 1,
        createdAt: 1,
        channel: 1,
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //todo : update video details
  const { videoId } = req.params;
  const { title, description } = req.body; //
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!title && !description && !req.file) {
    throw new ApiError(400, "At least one field is required");
  }

  let thumbnailUrl = null;
  if (req.file?.path) {
    const oldVideo = await Video.findOne({ _id: videoId, owner: userId });

    if (!oldVideo) {
      throw new ApiError(404, "Video not found");
    }

    await deleteOnCloudinary(oldVideo.thumbnail);

    const thumbnail = await uploadToCloudinary(req.file.path);

    if (!thumbnail) {
      throw new ApiError(400, "Failed to upload thumbnail");
    }

    thumbnailUrl = thumbnail.url;
  }

  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId },
    {
      $set: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //todo : delete a video
  const { videoId } = req.params; //
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOneAndDelete({ _id: videoId, owner: userId });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  //Clean Up cloudinary Files
  await Promise.all([
    deleteOnCloudinary(video.videoFile),
    deleteOnCloudinary(video.thumbnail),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  //todo : toggle publish status of a video
  const { videoId } = req.params; //
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: userId },
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" },
        },
      },
    ],
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  getAllUserVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
