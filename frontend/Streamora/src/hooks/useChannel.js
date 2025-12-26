import { useState, useCallback, useEffect } from "react";
import { getChannelProfile } from "../services/authService";
import { toggleSubscription, getChannelSubscribers } from "../services/subscriptionService";
import { getUserVideos } from "../services/videoService";
import useAuthStore from "../store/authStore";

const useChannel = (username) => {
  const currentUser = useAuthStore((s) => s.user);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState({ channel: false, videos: false, subscribers: false });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true });

  const isOwner = currentUser?._id === channel?._id;

  // Fetch channel profile
  const fetchChannel = useCallback(async () => {
    if (!username) return;
    try {
      setLoading((l) => ({ ...l, channel: true }));
      setError(null);
      const res = await getChannelProfile(username);
      setChannel(res?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch channel");
      setChannel(null);
    } finally {
      setLoading((l) => ({ ...l, channel: false }));
    }
  }, [username]);

  // Fetch channel videos with pagination
  const fetchVideos = useCallback(async (page = 1, reset = false) => {
    if (!channel?._id) return;
    try {
      setLoading((l) => ({ ...l, videos: true }));
      const res = await getUserVideos(channel._id, { page, limit: 12 });
      const newVideos = res?.data?.videos || [];
      
      setVideos((prev) => reset ? newVideos : [...prev, ...newVideos]);
      setPagination({ page, hasMore: newVideos.length === 12 });
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading((l) => ({ ...l, videos: false }));
    }
  }, [channel?._id]);

  // Fetch channel subscribers
  const fetchSubscribers = useCallback(async () => {
    if (!channel?._id) return;
    try {
      setLoading((l) => ({ ...l, subscribers: true }));
      const res = await getChannelSubscribers(channel._id);
      setSubscribers(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setLoading((l) => ({ ...l, subscribers: false }));
    }
  }, [channel?._id]);

  // Toggle subscription
  const handleToggleSubscription = useCallback(async () => {
    if (!channel?._id || !currentUser) return;
    try {
      const res = await toggleSubscription(channel._id);
      setChannel((prev) => prev && {
        ...prev,
        isSubscribed: res?.data?.isSubscribed ?? !prev.isSubscribed,
        subscribersCount: prev.subscribersCount + (res?.data?.isSubscribed ? 1 : -1),
      });
    } catch (err) {
      console.error("Failed to toggle subscription:", err);
    }
  }, [channel?._id, currentUser]);

  // Load more videos
  const loadMoreVideos = useCallback(() => {
    if (!loading.videos && pagination.hasMore) {
      fetchVideos(pagination.page + 1);
    }
  }, [fetchVideos, loading.videos, pagination]);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Auto-fetch channel on username change
  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Auto-fetch videos when channel loads
  useEffect(() => {
    if (channel?._id) {
      fetchVideos(1, true);
    }
  }, [channel?._id]);

  return {
    // Data
    channel,
    videos,
    subscribers,
    isOwner,
    isSubscribed: channel?.isSubscribed ?? false,
    subscribersCount: channel?.subscribersCount ?? 0,

    // Loading states
    loading,
    isLoading: loading.channel || loading.videos,
    error,

    // Pagination
    hasMoreVideos: pagination.hasMore,
    loadMoreVideos,

    // Actions
    toggleSubscription: handleToggleSubscription,
    fetchSubscribers,
    refresh,
  };
};

export default useChannel;
