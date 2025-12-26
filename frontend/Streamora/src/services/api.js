import axios from "axios";

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  timeout: REQUEST_TIMEOUT,
  // Don't set default Content-Type - let axios set it automatically
  // For JSON it will use application/json, for FormData it will use multipart/form-data
});

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;

/**
 * Queue of failed requests to retry after token refresh
 */
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 * - Adds authorization header
 * - Logs requests in development
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Development logging
    if (import.meta.env.DEV) {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles token refresh on 401
 * - Queues failed requests during refresh
 * - Provides consistent error handling
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry for non-401 errors or already retried requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip retry for auth endpoints to prevent loops
    const authEndpoints = ["/users/login", "/users/register", "/users/refresh-token"];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark as retrying and start refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/users/refresh-token");
      const newToken = data?.data?.accessToken;

      if (!newToken) {
        throw new Error("No access token in refresh response");
      }

      // Store new token
      localStorage.setItem("access_token", newToken);

      // Update authorization header for original request
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

      // Process queued requests with new token
      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Process queued requests with error
      processQueue(refreshError, null);

      // Clear auth state
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("streamora-auth");

      // Redirect to login (avoid during SSR)
      if (typeof window !== "undefined") {
        const returnTo = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?returnTo=${returnTo}&expired=true`;
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Helper to check if error is a network error
 * @param {Error} error - Axios error
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && error.code === "ERR_NETWORK";
};

/**
 * Helper to check if error is a timeout
 * @param {Error} error - Axios error
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
};

/**
 * Extract error message from API response
 * @param {Error} error - Axios error
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return "Network error. Please check your connection.";
  }
  if (isTimeoutError(error)) {
    return "Request timed out. Please try again.";
  }
  return (
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred"
  );
};

export default api;
