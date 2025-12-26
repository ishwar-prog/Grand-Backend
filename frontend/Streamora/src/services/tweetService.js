import api from "./api";

// Create a new tweet
export const createTweet = async (content) => {
    const { data } = await api.post("/tweets", { content });
    return data;
};

// Get all tweets of a user
export const getUserTweets = async (userId) => {
    const { data } = await api.get(`/tweets/user/${userId}`);
    return data;
};

// Update a tweet (owner only)
export const updateTweet = async (tweetId, content) => {
    const { data } = await api.patch(`/tweets/${tweetId}`, { content });
    return data;
};

// Delete a tweet (owner only)
export const deleteTweet = async (tweetId) => {
    const { data } = await api.delete(`/tweets/${tweetId}`);
    return data;
};

export default { createTweet, getUserTweets, updateTweet, deleteTweet };
