import { useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import { getAllVideos, getVideoById, publishVideo, updateVideo, deleteVideo, togglePublishStatus } from "../services/videoService";
import { toggleVideoLike } from "../services/likeService";
import useAuthStore from "../store/authStore";

const useVideos = (options = {}) => {
  const { autoFetch = true, initialLimit = 12, initialSortBy = "views" } = options;
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const currentUser = useAuthStore((s) => s.user);

  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState({ list: false, single: false, action: false });
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ query: initialQuery, sortBy: initialSortBy, sortType: "desc" });
  const [pagination, setPagination] = useState({ page: 1, limit: initialLimit, hasMore: true, total: 0 });

  const abortRef = useRef(null);

  // Fetch videos list
  const fetchVideos = useCallback(async (page = 1, reset = false) => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading((l) => ({ ...l, list: true }));
      setError(null);

      const res = await getAllVideos({
        page,
        limit: pagination.limit,
        query: filters.query,
        sortBy: filters.sortBy,
        sortType: filters.sortType,
      });

      const newVideos = res?.data?.docs || [];
      setVideos((prev) => reset ? newVideos : [...prev, ...newVideos]);
      setPagination((p) => ({
        ...p,
        page,
        hasMore: res?.data?.hasNextPage ?? false,
        total: res?.data?.totalDocs ?? 0,
      }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err?.response?.data?.message || "Failed to fetch videos");
      }
    } finally {
      setLoading((l) => ({ ...l, list: false }));
    }
  }, [filters, pagination.limit]);

  // Fetch single video
  const fetchVideo = useCallback(async (videoId) => {
    if (!videoId) return null;
    try {
      setLoading((l) => ({ ...l, single: true }));
      setError(null);
      const res = await getVideoById(videoId);
      setCurrentVideo(res?.data || null);
      return res?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch video");
      setCurrentVideo(null);
      throw err;
    } finally {
      setLoading((l) => ({ ...l, single: false }));
    }
  }, []);

  // Publish new video
  const handlePublish = useCallback(async ({ title, description, videoFile, thumbnail }) => {
    if (!title?.trim() || !videoFile) throw new Error("Title and video file required");
    try {
      setLoading((l) => ({ ...l, action: true }));
      const res = await publishVideo({ title, description, videoFile, thumbnail });
      // Prepend to list if we have videos loaded
      if (videos.length > 0 && res?.data) {
        setVideos((prev) => [res.data, ...prev]);
      }
      return res?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to publish video");
      throw err;
    } finally {
      setLoading((l) => ({ ...l, action: false }));
    }
  }, [videos.length]);

  // Update video
  const handleUpdate = useCallback(async (videoId, { title, description, thumbnail }) => {
    try {
      setLoading((l) => ({ ...l, action: true }));
      const res = await updateVideo(videoId, { title, description, thumbnail });
      
      // Update in list
      setVideos((prev) => prev.map((v) => (v._id === videoId ? { ...v, ...res?.data } : v)));
      // Update current if same
      if (currentVideo?._id === videoId) {
        setCurrentVideo((prev) => prev && { ...prev, ...res?.data });
      }
      return res?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update video");
      throw err;
    } finally {
      setLoading((l) => ({ ...l, action: false }));
    }
  }, [currentVideo?._id]);

  // Delete video
  const handleDelete = useCallback(async (videoId) => {
    try {
      setLoading((l) => ({ ...l, action: true }));
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      if (currentVideo?._id === videoId) setCurrentVideo(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete video");
      throw err;
    } finally {
      setLoading((l) => ({ ...l, action: false }));
    }
  }, [currentVideo?._id]);

  // Toggle publish status
  const handleTogglePublish = useCallback(async (videoId) => {
    try {
      const res = await togglePublishStatus(videoId);
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: res?.data?.isPublished } : v))
      );
      return res?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to toggle status");
      throw err;
    }
  }, []);

  // Toggle like
  const handleToggleLike = useCallback(async (videoId) => {
    if (!currentUser) return;
    try {
      const res = await toggleVideoLike(videoId);
      const update = (v) =>
        v._id === videoId
          ? { ...v, isLiked: res?.data?.isLiked, likesCount: (v.likesCount || 0) + (res?.data?.isLiked ? 1 : -1) }
          : v;

      setVideos((prev) => prev.map(update));
      if (currentVideo?._id === videoId) {
        setCurrentVideo((prev) => prev && update(prev));
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }, [currentUser, currentVideo?._id]);

  // Search/filter
  const search = useCallback((query) => {
    setFilters((f) => ({ ...f, query }));
  }, []);

  const sort = useCallback((sortBy, sortType = "desc") => {
    setFilters((f) => ({ ...f, sortBy, sortType }));
  }, []);

  // Pagination
  const loadMore = useCallback(() => {
    if (!loading.list && pagination.hasMore) {
      fetchVideos(pagination.page + 1);
    }
  }, [fetchVideos, loading.list, pagination]);

  // Refresh
  const refresh = useCallback(() => {
    fetchVideos(1, true);
  }, [fetchVideos]);

  // Helpers
  const isOwner = useCallback((video) => {
    const ownerId = video?.owner?._id || video?.channel?._id || video?.owner;
    return currentUser?._id === ownerId;
  }, [currentUser]);

  // Auto-fetch on filter change
  useEffect(() => {
    if (autoFetch) {
      fetchVideos(1, true);
    }
    return () => abortRef.current?.abort();
  }, [filters, autoFetch]);

  return {
    // Data
    videos,
    currentVideo,
    totalVideos: pagination.total,

    // States
    loading,
    isLoading: loading.list || loading.single,
    error,
    hasMore: pagination.hasMore,

    // Filters
    filters,
    search,
    sort,

    // Actions
    fetchVideos,
    fetchVideo,
    publishVideo: handlePublish,
    updateVideo: handleUpdate,
    deleteVideo: handleDelete,
    togglePublish: handleTogglePublish,
    toggleLike: handleToggleLike,
    loadMore,
    refresh,

    // Helpers
    isOwner,
  };
};

export default useVideos;
