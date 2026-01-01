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

// Mark all notifications as read
export const markAllNotificationsRead = async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data;
};

// Delete all notifications
export const deleteAllNotifications = async () => {
    const { data } = await api.delete("/notifications");
    return data;
};

export default {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteAllNotifications
};
