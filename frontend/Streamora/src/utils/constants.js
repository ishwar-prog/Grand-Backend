// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const COMMENTS_PAGE_SIZE = 10;

// Video
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// User
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

// Text limits (align with backend validation)
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_PLAYLIST_NAME_LENGTH = 100;
export const MAX_USERNAME_LENGTH = 30;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  WATCH: '/watch/:videoId',
  CHANNEL: '/channel/:username',
  SEARCH: '/search',
  HISTORY: '/history',
  LIKED: '/liked',
  SUBSCRIPTIONS: '/subscriptions',
  PLAYLIST: '/playlist/:playlistId',
  DASHBOARD: '/dashboard',
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
};
