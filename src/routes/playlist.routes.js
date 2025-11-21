import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const router = Router();

//all playlist routes require auth
router.use(verifyJWT);

//CREATE a new playlist 
router.route("/").post(createPlaylist);

//GET , UPDATE , DELETE a specific playlist ( by ID )
router
.route("/:playlistId")
.get(getPlaylistById)     //Get playlist Details + videos 
.patch(updatePlaylist)    //Update name/description
.delete(deletePlaylist)   //Delete entire Playlist

//ADD or REMOVE video from playlist 
router
    .route("/add/:videoId/:playlistId")
    .patch(addVideoToPlaylist)       //add video to playlist

router
.route("/remove/:videoId/:playlistId")
.patch(removeVideoFromPlaylist)   //remove video from playlist

//GET all playlists of a user 
router.route("/users/:userId").get(getUserPlaylists)



export default router;