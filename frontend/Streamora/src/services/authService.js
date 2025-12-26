import api from "./api";

// Register a new user (with avatar, optional coverImage)
export const register = async ({ fullName, email, username, password, avatar, coverImage }) => {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);

    const { data } = await api.post("/users/register", formData);
    return data;
};

// Login user
export const login = async ({ username, email, password }) => {
    const { data } = await api.post("/users/login", { username, email, password });
    if (data?.data?.accessToken) localStorage.setItem("access_token", data.data.accessToken);
    if (data?.data?.user) localStorage.setItem("user", JSON.stringify(data.data.user));
    return data;
};

// Logout user
export const logout = async () => {
    try {
        const { data } = await api.post("/users/logout");
        return data;
    } finally {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
    }
};

// Refresh access token
export const refreshToken = async () => {
    const { data } = await api.post("/users/refresh-token");
    if (data?.data?.accessToken) localStorage.setItem("access_token", data.data.accessToken);
    return data;
};

// Get current logged-in user
export const getCurrentUser = async () => {
    const { data } = await api.get("/users/current-user");
    return data;
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
    const { data } = await api.patch("/users/change-password", { oldPassword, newPassword });
    return data;
};

// Update account details (fullName, email)
export const updateAccount = async ({ fullName, email }) => {
    const { data } = await api.patch("/users/update-account", { fullName, email });
    return data;
};

// Update avatar
export const updateAvatar = async (avatar) => {
    const formData = new FormData();
    formData.append("avatar", avatar);
    const { data } = await api.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

// Update cover image
export const updateCoverImage = async (coverImage) => {
    const formData = new FormData();
    formData.append("coverImage", coverImage);
    const { data } = await api.patch("/users/cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};

// Get channel profile by username
export const getChannelProfile = async (username) => {
    const { data } = await api.get(`/users/c/${username}`);
    return data;
};

// Get watch history
export const getWatchHistory = async () => {
    const { data } = await api.get("/users/watch-history");
    return data;
};

export default {
    register, login, logout, refreshToken, getCurrentUser,
    changePassword, updateAccount, updateAvatar, updateCoverImage,
    getChannelProfile, getWatchHistory
};
