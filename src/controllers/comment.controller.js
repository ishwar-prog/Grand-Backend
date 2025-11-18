import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse,js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler( async ( req , res ) => {
//todo : get all comments for a video
    const{ videoId } = req.params;
    const { page = 1 , limit = 10} = req.query
});

const addComment = asyncHandler( async ( req , res ) => {
    //todo : add comment to a video
});

const updateComment = asyncHandler( async ( req , res ) => {
    //todo : update comment
});

const deleteComment = asyncHandler( async ( req , res ) => {
    //todo : delete comment
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}