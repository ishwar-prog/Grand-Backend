import api from "./api";

// Create a new playlist
export const createPlaylist = async (name, description = "") => {
    const { data } = await api.post("/playlist", { name, description });
    return data;
};

// Get all playlists of a user
export const getUserPlaylists = async (userId) => {
    const { data } = await api.get(`/playlist/users/${userId}`);
    return data;
};

// Get playlist by ID (with videos)
export const getPlaylistById = async (playlistId) => {
    const { data } = await api.get(`/playlist/${playlistId}`);
    return data;
};

// Update playlist (name/description)
export const updatePlaylist = async (playlistId, { name, description }) => {
    const { data } = await api.patch(`/playlist/${playlistId}`, { name, description });
    return data;
};

// Delete a playlist
export const deletePlaylist = async (playlistId) => {
    const { data } = await api.delete(`/playlist/${playlistId}`);
    return data;
};

// Add video to playlist
export const addVideoToPlaylist = async (videoId, playlistId) => {
    const { data } = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
    return data;
};

// Remove video from playlist
export const removeVideoFromPlaylist = async (videoId, playlistId) => {
    const { data } = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
    return data;
};

export default { createPlaylist, getUserPlaylists, getPlaylistById, updatePlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist };
