import api from "./api";

// Get all videos (public) - with search, sort, pagination
export const getAllVideos = async ({ page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc" } = {}) => {
    const { data } = await api.get("/videos", { params: { page, limit, query, sortBy, sortType } });
    return data;
};

// Get all videos of a specific user (public)
export const getUserVideos = async (userId, { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc" } = {}) => {
    const { data } = await api.get("/videos/user", { params: { userId, page, limit, query, sortBy, sortType } });
    return data;
};

// Get single video by ID (increments view, adds to watch history)
export const getVideoById = async (videoId) => {
    const { data } = await api.get(`/videos/${videoId}`);
    return data;
};

// Publish a new video (upload video + optional thumbnail)
export const publishVideo = async ({ title, description, videoFile, thumbnail }) => {
    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    formData.append("videoFile", videoFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    const { data } = await api.post("/videos", formData);
    return data;
};

// Update video details (title, description, thumbnail)
export const updateVideo = async (videoId, { title, description, thumbnail }) => {
    const formData = new FormData();
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    const { data } = await api.patch(`/videos/${videoId}`, formData);
    return data;
};

// Delete a video (owner only)
export const deleteVideo = async (videoId) => {
    const { data } = await api.delete(`/videos/${videoId}`);
    return data;
};

// Toggle publish status (public <-> private/draft)
export const togglePublishStatus = async (videoId) => {
    const { data } = await api.patch(`/videos/toggle/publish/${videoId}`);
    return data;
};

export default { getAllVideos, getUserVideos, getVideoById, publishVideo, updateVideo, deleteVideo, togglePublishStatus };
