import api from "./api";

// Get user watch history
export const getWatchHistory = async () => {
    const { data } = await api.get("/users/history");
    return data;
};

// Get liked videos
export const getLikedVideos = async () => {
    const { data } = await api.get("/likes/videos");
    return data;
};

// Get user playlists
export const getUserPlaylists = async (userId) => {
    const { data } = await api.get(`/playlist/user/${userId}`);
    return data;
};

export default {
    getWatchHistory,
    getLikedVideos,
    getUserPlaylists
};
