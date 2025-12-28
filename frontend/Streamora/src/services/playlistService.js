import api from "./api";

// Create a new playlist
export const createPlaylist = async (name, description = "") => {
    const { data } = await api.post("/playlists", { name, description });
    return data;
};

// Get all playlists of a user
export const getUserPlaylists = async (userId) => {
    const { data } = await api.get(`/playlists/users/${userId}`);
    return data;
};

// Get playlist by ID (with videos)
export const getPlaylistById = async (playlistId) => {
    const { data } = await api.get(`/playlists/${playlistId}`);
    return data;
};

// Update playlist (name/description)
export const updatePlaylist = async (playlistId, { name, description }) => {
    const { data } = await api.patch(`/playlists/${playlistId}`, { name, description });
    return data;
};

// Delete a playlist
export const deletePlaylist = async (playlistId) => {
    const { data } = await api.delete(`/playlists/${playlistId}`);
    return data;
};

// Add video to playlist
export const addVideoToPlaylist = async (videoId, playlistId) => {
    const { data } = await api.patch(`/playlists/add/${videoId}/${playlistId}`);
    return data;
};

// Remove video from playlist
export const removeVideoFromPlaylist = async (videoId, playlistId) => {
    const { data } = await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
    return data;
};

export default { createPlaylist, getUserPlaylists, getPlaylistById, updatePlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist };
