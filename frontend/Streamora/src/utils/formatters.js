// View count formatter (1000 -> 1K, 1000000 -> 1M)
export const formatViews = (count) => {
  if (!count) return '0 views';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${count} view${count !== 1 ? 's' : ''}`;
};

// Subscriber count formatter
export const formatSubscribers = (count) => {
  if (!count) return '0 subscribers';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M subscribers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K subscribers`;
  return `${count} subscriber${count !== 1 ? 's' : ''}`;
};

// Duration formatter (seconds -> MM:SS or HH:MM:SS)
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Relative time formatter (createdAt -> "2 days ago")
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) !== 1 ? 's' : ''} ago`;
};

// Full date formatter
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
};

// Format username (ensure @ prefix)
export const formatUsername = (username) => {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
};

// Get initials from full name
export const getInitials = (fullName) => {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format file size (bytes -> KB, MB, GB)
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1).replace(/\.0$/, '')} ${sizes[i]}`;
};

// Compact number formatter (for likes, comments count)
export const formatCount = (count) => {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return count.toString();
};

// Playlist video count formatter
export const formatVideoCount = (count) => {
  if (!count) return '0 videos';
  return `${count} video${count !== 1 ? 's' : ''}`;
};

// Validate and get thumbnail URL with fallback
export const getThumbnailUrl = (url, fallback = '/placeholder-thumbnail.jpg') => {
  return url || fallback;
};

// Validate and get avatar URL with fallback
export const getAvatarUrl = (url, fallback = '/default-avatar.png') => {
  return url || fallback;
};
