import api from "./api";

// Toggle subscription to a channel (subscribe/unsubscribe)
export const toggleSubscription = async (channelId) => {
    const { data } = await api.post(`/subscriptions/c/${channelId}`);
    return data;
};

// Get all subscribers of a channel
export const getChannelSubscribers = async (channelId) => {
    const { data } = await api.get(`/subscriptions/c/${channelId}`);
    return data;
};

// Get all channels the logged-in user is subscribed to
export const getSubscribedChannels = async () => {
    const { data } = await api.get("/subscriptions/subscribed");
    return data;
};

export default { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
