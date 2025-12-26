import api from "./api";

// Get channel stats (total views, subscribers, videos, likes)
export const getChannelStats = async () => {
    const { data } = await api.get("/dashboard/stats");
    return data;
};

// Get all videos uploaded by the logged-in user
export const getChannelVideos = async () => {
    const { data } = await api.get("/dashboard/videos");
    return data;
};

export default { getChannelStats, getChannelVideos };
