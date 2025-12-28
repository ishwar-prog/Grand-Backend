import api from "./api";

// Get user notifications
export const getUserNotifications = async () => {
    const { data } = await api.get("/notifications");
    return data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    return data;
};

export default {
    getUserNotifications,
    markNotificationRead
};
