import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //todo : create a new playlist
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name?.trim()) {
    throw new ApiError(400, "Invalid playlist name");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //todo : get all playlists of a user
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const playlists = await Playlist.find({ owner: userId })
    .select("name description videos thumbnail createdAt")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.aggregrate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localfield: "videos",
        foreignfield: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localfield: "owner",
              foreignfield: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $addFields: {
              viewsCount: { $ifNull: ["$views", 0] },
              durationInMinutes: {
                $round: [{ $divide: ["$duration", 60] }, 1],
              },
            },
          },
          {
            $project: {
              title: 1,
              thumbnail: 1,
              durationInMinutes: 1,
              viewsCount: 1,
              createdAt: 1,
              owner: {
                username: "$owner.username",
                avatar: "$owner.avatar",
                fullName: "$owner.fullName",
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        loaclfield: "owner",
        foreignfield: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $addfields: {
        totalVideos: { $size: "$videos" },
        totalDuration: { $sum: "$videos. duration" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        totalVideos: 1,
        totalduration: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        },
        videos: 1,
      },
    },
  ]);

  if (!playlist || playlist.lenth === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  //todo : add a video to a playlist
  const { playlistId, videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist id or video id");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: userId }, //only owner can modify playlist
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  //todo : remove a video from a playlist
  const { playlistId, videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist id or video id");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: userId }, //only owner can modify playlist
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  //todo : delete a playlist
  const { playlistId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //todo : update playlist details
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
