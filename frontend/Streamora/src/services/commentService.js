import api from "./api";

// Get paginated comments for a video
export const getVideoComments = async (videoId, page = 1, limit = 10) => {
    const { data } = await api.get(`/comments/${videoId}`, { params: { page, limit } });
    return data;
};

// Add a comment to a video
export const addComment = async (videoId, content) => {
    const { data } = await api.post(`/comments/${videoId}`, { content });
    return data;
};

// Update a comment (owner only)
export const updateComment = async (commentId, content) => {
    const { data } = await api.patch(`/comments/c/${commentId}`, { content });
    return data;
};

// Delete a comment (owner only)
export const deleteComment = async (commentId) => {
    const { data } = await api.delete(`/comments/c/${commentId}`);
    return data;
};

export default { getVideoComments, addComment, updateComment, deleteComment };
