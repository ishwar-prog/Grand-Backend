import { useState, useCallback, useEffect } from "react";
import { getVideoComments, addComment, updateComment, deleteComment } from "../services/commentService";
import { toggleCommentLike } from "../services/likeService";
import useAuthStore from "../store/authStore";

const useComments = (videoId) => {
  const currentUser = useAuthStore((s) => s.user);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true, total: 0 });

  // Fetch comments
  const fetchComments = useCallback(async (page = 1, reset = false) => {
    if (!videoId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getVideoComments(videoId, page, 10);
      const newComments = res?.data?.docs || [];

      setComments((prev) => reset ? newComments : [...prev, ...newComments]);
      setPagination({
        page,
        hasMore: res?.data?.hasNextPage ?? false,
        total: res?.data?.totalDocs ?? 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  // Add comment
  const handleAddComment = useCallback(async (content) => {
    if (!videoId || !content?.trim() || !currentUser) return null;
    try {
      setSubmitting(true);
      const res = await addComment(videoId, content.trim());
      
      // Prepend new comment with user info for optimistic UI
      const newComment = {
        ...res?.data,
        owner: {
          _id: currentUser._id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
        },
        likesCount: 0,
        isLiked: false,
      };
      setComments((prev) => [newComment, ...prev]);
      setPagination((p) => ({ ...p, total: p.total + 1 }));
      return newComment;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [videoId, currentUser]);

  // Update comment
  const handleUpdateComment = useCallback(async (commentId, content) => {
    if (!content?.trim()) return null;
    try {
      setSubmitting(true);
      const res = await updateComment(commentId, content.trim());
      
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: res?.data?.content || content } : c))
      );
      return res?.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update comment");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete comment");
      throw err;
    }
  }, []);

  // Toggle comment like
  const handleToggleLike = useCallback(async (commentId) => {
    if (!currentUser) return;
    try {
      const res = await toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, isLiked: res?.data?.isLiked ?? !c.isLiked, likesCount: (c.likesCount || 0) + (res?.data?.isLiked ? 1 : -1) }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }, [currentUser]);

  // Check if user owns a comment
  const isCommentOwner = useCallback((comment) => {
    return currentUser?._id === comment?.owner?._id;
  }, [currentUser]);

  // Load more comments
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchComments(pagination.page + 1);
    }
  }, [fetchComments, loading, pagination]);

  // Refresh comments
  const refresh = useCallback(() => {
    fetchComments(1, true);
  }, [fetchComments]);

  // Auto-fetch on videoId change
  useEffect(() => {
    if (videoId) {
      fetchComments(1, true);
    } else {
      setComments([]);
      setPagination({ page: 1, hasMore: true, total: 0 });
    }
  }, [videoId]);

  return {
    // Data
    comments,
    totalComments: pagination.total,

    // States
    loading,
    submitting,
    error,
    hasMore: pagination.hasMore,

    // Actions
    addComment: handleAddComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    toggleLike: handleToggleLike,
    loadMore,
    refresh,

    // Helpers
    isCommentOwner,
  };
};

export default useComments;
