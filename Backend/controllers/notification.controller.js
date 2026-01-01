import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.aggregate([
    {
      $match: {
        recipient: req.user._id
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender"
      }
    },
    {
      $unwind: "$sender"
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video"
      }
    },
    {
      $unwind: {
        path: "$video",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        isRead: 1,
        createdAt: 1,
        "sender.username": 1,
        "sender.avatar": 1,
        "video._id": 1,
        "video.title": 1,
        "video.thumbnail": 1
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  await Notification.findByIdAndUpdate(notificationId, {
    $set: { isRead: true }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification marked as read"));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications deleted"));
});

export { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteAllNotifications };
