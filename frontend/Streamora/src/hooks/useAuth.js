import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import authService from "../services/authService";

const useAuth = () => {
  const navigate = useNavigate();
  const authCheckDone = useRef(false);

  // Store state & actions
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const setLoading = useAuthStore((s) => s.setLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setError = useAuthStore((s) => s.setError);
  const clearError = useAuthStore((s) => s.clearError);
  const logoutStore = useAuthStore((s) => s.logout);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  const isAuthenticated = status === "authenticated" && !!user;
  const isLoading = status === "loading";

  // Check auth on mount
  useEffect(() => {
    if (authCheckDone.current) return;
    authCheckDone.current = true;

    const token = accessToken || localStorage.getItem("access_token");
    if (!token) return setInitialized();

    setLoading();
    authService.getCurrentUser()
      .then((res) => res?.data && setUser(res.data, token))
      .catch(() => logoutStore());
  }, []);

  // Auth methods
  const register = useCallback(async (credentials) => {
    try {
      setLoading();
      await authService.register(credentials);
      return login({ username: credentials.username, password: credentials.password });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
      throw err;
    }
  }, []);

  const login = useCallback(async (credentials, redirectTo = "/") => {
    try {
      setLoading();
      const res = await authService.login(credentials);
      if (res?.data?.user && res?.data?.accessToken) {
        setUser(res.data.user, res.data.accessToken);
        redirectTo && navigate(redirectTo, { replace: true });
        return res;
      }
      throw new Error("Invalid response");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
      throw err;
    }
  }, [navigate]);

  const logout = useCallback(async (redirectTo = "/login") => {
    try {
      setLoading();
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logoutStore();
      redirectTo && navigate(redirectTo, { replace: true });
    }
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await authService.refreshToken();
      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      }
      throw new Error("Refresh failed");
    } catch (err) {
      logoutStore();
      throw err;
    }
  }, []);

  // Profile methods
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      setLoading();
      const res = await authService.changePassword(oldPassword, newPassword);
      clearError();
      return res;
    } catch (err) {
      setError(err?.response?.data?.message || "Password change failed");
      throw err;
    }
  }, []);

  const updateAccount = useCallback(async (details) => {
    try {
      setLoading();
      const res = await authService.updateAccount(details);
      res?.data && updateUser(res.data);
      return res;
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
      throw err;
    }
  }, []);

  const updateAvatar = useCallback(async (file) => {
    try {
      setLoading();
      const res = await authService.updateAvatar(file);
      res?.data && updateUser(res.data);
      return res;
    } catch (err) {
      setError(err?.response?.data?.message || "Avatar update failed");
      throw err;
    }
  }, []);

  const updateCoverImage = useCallback(async (file) => {
    try {
      setLoading();
      const res = await authService.updateCoverImage(file);
      res?.data && updateUser(res.data);
      return res;
    } catch (err) {
      setError(err?.response?.data?.message || "Cover update failed");
      throw err;
    }
  }, []);

  // Utility methods
  const isOwner = useCallback((ownerId) => user?._id === ownerId, [user]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated && isInitialized) {
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const redirectIfAuthenticated = useCallback((to = "/") => {
    isAuthenticated && navigate(to, { replace: true });
  }, [isAuthenticated, navigate]);

  return {
    // State
    user, accessToken, status, error, isAuthenticated, isLoading, isInitialized,
    // Auth
    login, logout, register, refreshSession,
    // Profile
    changePassword, updateAccount, updateAvatar, updateCoverImage,
    // Utils
    isOwner, requireAuth, redirectIfAuthenticated, clearError,
  };
};

export default useAuth;
 
