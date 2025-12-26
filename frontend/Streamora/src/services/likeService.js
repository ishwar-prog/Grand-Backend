import api from "./api";

// Toggle like on a video
export const toggleVideoLike = async (videoId) => {
    const { data } = await api.post(`/likes/toggle/v/${videoId}`);
    return data;
};

// Toggle like on a comment
export const toggleCommentLike = async (commentId) => {
    const { data } = await api.post(`/likes/toggle/c/${commentId}`);
    return data;
};

// Toggle like on a tweet
export const toggleTweetLike = async (tweetId) => {
    const { data } = await api.post(`/likes/toggle/t/${tweetId}`);
    return data;
};

// Get all liked videos by the user
export const getLikedVideos = async () => {
    const { data } = await api.get("/likes/videos");
    return data;
};

export default { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
