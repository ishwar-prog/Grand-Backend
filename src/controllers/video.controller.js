import mongoose , { isValidateObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler( async ( req , res ) => {
    const { page = 1 , limit = 10 , query , sortBy , sortType , userId} = req.query;
    //todo : get all videos based on query , sort , pagination 
});

const publishAVideo = asyncHandler( async ( req , res ) => {
    const { title , description } = req.body;
    //todo : get video , upload to cloudinary  , create video
});

const getVideoById = asyncHandler( async ( req , res ) => {
    const { videoId } = req.params;
    //todo : get video by id
});

const updateVideo = asyncHandler( async ( req , res ) => {
    const { videoId } = req.params;
    const { title , description } = req.body; //
    //todo : update video details
});

const deleteVideo = asyncHandler( async ( req , res ) => {
    const { videoId } = req.params; //
    //todo : delete a video
});

const togglePublishStatus = asyncHandler( async ( req , res ) => {
    const { videoId } = req.params; //
    //todo : toggle publish status of a video
});

export {
    getAllVideos,
    publishAVideo,      
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}