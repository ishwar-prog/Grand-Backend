import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  //todo : toggle subscription to a channel
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  //prevent self-subscription
  if (userId.toString() === channelId) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (existingSubscription) {
    //Unsubscribe
    await Subscription.deleteOne({ _id: existingSubscription._id });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          "Unsubscribed successfully"
        )
      );
  } else {
    //Subscribe
    const subscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
      );
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  //todo : get all subscribers of a channel
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: "$subscriber._id",
        username: "$subscriber.username",
        avatar: "$subscriber.avatar",
        fullName: "$subscriber.fullName",
        subscribedAt: "$createdAt",
      },
    },
    {
      $sort: { subscribedAt: -1 }, //newest subscibers first
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  //todo : get all channels the user is subscribed to
  const userId = req.user._id;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $addFields: {
        "channel.subscriberCount": { $size: "$channel.subscribers" },
        "channel.isSubscribed": true,
        subscribedAt: "$createdAt",
      },
    },
    {
      $project: {
        _id: "$channel._id",
        username: "$channel.username",
        avatar: "$channel.avatar",
        fullName: "$channel.fullName",
        avatar: "$channel.avatar",
        subscriberCount: "$channel.subscriberCount",
        subscribedAt: 1,
      },
    },
    {
      $sort: { subscribedAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscibed Channels fetched Successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
