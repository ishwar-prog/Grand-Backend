import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Notification } from "../models/notification.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    _id: 1 // Needed for permission checks
                },
                isLiked: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler( async ( req , res ) => {
    //todo : add comment to a video
    const { content }   = req.body;
    const { videoId }  = req.params;
    const userId = req.user?._id;

    if(!content ?.trim()){
        throw new ApiError(400 , "Comment content is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video ID");
    }

    //Optional : check if video exists
    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404 , "Video not found");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video : videoId,
        owner : userId
    })

    // Notify Video Owner
    if (video.owner.toString() !== userId.toString()) {
        await Notification.create({
            recipient: video.owner,
            sender: userId,
            type: "COMMENT",
            video: videoId,
            comment: comment._id
        });
    }

    return res 
    .status(201)
    .json(
        new ApiResponse(201 , comment , "Comment added successfully")
    )
});

const updateComment = asyncHandler( async ( req , res ) => {
    //todo : update comment
    const { commentId } = req.params;
    const { content }   = req.body;
    const userId = req.user?._id;

    if(!content?.trim()){
        throw new ApiError(400 , "Comment content is required");
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment ID");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id : commentId,
            owner : userId  //Only owner can update
        },
        {
            $set : {
                content : content.trim()
            }
        },
        { new : true }
    )

    if(!updatedComment) {
        throw new ApiError(404 , "Comment not found or you don't own this comment");
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(200 , updatedComment , "Comment updated successfully")
    )
});

const deleteComment = asyncHandler( async ( req , res ) => {
    //todo : delete comment
    const { commentId } = req.params;
    const userId = req.user?._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400 , "Invalid comment ID");
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id : commentId,
            owner : userId  //Only owner can delete
        }
    )

    if(!deletedComment) {
        throw new ApiError(404 , "Comment not found or you don't own this comment");
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200 , {} , "Comment deleted successfully")
    )
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}