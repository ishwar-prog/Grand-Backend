import mongoose , { isValidateObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler( async ( req , res ) => {
    const { name , description } = req.body;
    //todo : create a new playlist
});

const getUserPlaylists = asyncHandler( async ( req , res ) => {
    const { userId } = req.params;
    //todo : get all playlists of a user
});

const addVideoToPlaylist = asyncHandler( async ( req , res ) => {
    const { playlistId , videoId } = req.params;
    //todo : add a video to a playlist
});

const removeVideoFromPlaylist = asyncHandler( async ( req , res ) => {
    const { playlistId , videoId } = req.params;
    //todo : remove a video from a playlist
});

const deletePlaylist = asyncHandler( async ( req , res ) => {
    const { playlistId } = req.params;
    //todo : delete a playlist
});

const updatePlaylist = asyncHandler( async ( req , res ) => {
    const { playlistId } = req.params;
    const { name , description } = req.body;
    //todo : update playlist details
});

export {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}