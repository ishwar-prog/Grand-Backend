import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse,js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler( async ( req , res ) => {
//todo : get all comments for a video
    const{ videoId } = req.params;
    const { page = 1 , limit = 10} = req.query

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400 , "Invalid video ID");
    }

    const options = {
        page : parseInt(page),
        limit : parseInt(limit),
    }

    const aggregate = Comment.aggregate([
        {
            $match :{
                video : new mongoose.Types.ObjectId(videoId)    
            },
        },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "commenter"
                }
            },
            {
                $unwind : "$commenter"
            },
            {
                $sort:{ createdAt : -1 }      //newest comments first
            },
            {
                $project : {
                    content : 1,
                    createdAt : 1,
                    "commenter._id" : 1,
                    "commenter.username" : 1,
                    "commenter.fullName" : 1,
                    "commenter.avatar" : 1
            }
        }
    ]);

    const result = await Comment.aggregatePaginate(aggregate , options);

    return res 
    .status(200)
    .json(
        new ApiResponse(200 , result , "Comments fetched successfully")
    )
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