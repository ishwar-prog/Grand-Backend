import React, { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MoreVertical, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { getAvatarUrl, formatTimeAgo } from '../../utils/formatters';
import { toggleTweetLike } from '../../services/likeService';
import { updateTweet, deleteTweet } from '../../services/tweetService';
import Button from '../ui/Button';
import LinkifyText from '../ui/LinkifyText';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const TweetCard = forwardRef(({ tweet, onUpdate, onDelete }, ref) => {
  const [isLiked, setIsLiked] = useState(tweet.isLiked);
  const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [loading, setLoading] = useState({ like: false, edit: false, delete: false });

  const handleLike = async () => {
    if (loading.like) return;
    setLoading(prev => ({ ...prev, like: true }));
    try {
      const res = await toggleTweetLike(tweet._id);
      setIsLiked(res.data.isLiked);
      setLikeCount(prev => res.data.isLiked ? prev + 1 : prev - 1);
    } catch (err) {
      toast.error('Failed to like tweet');
    } finally {
      setLoading(prev => ({ ...prev, like: false }));
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || loading.edit) return;
    setLoading(prev => ({ ...prev, edit: true }));
    try {
      await updateTweet(tweet._id, editContent);
      onUpdate?.(tweet._id, editContent);
      setIsEditing(false);
      toast.success('Tweet updated');
    } catch (err) {
      toast.error('Failed to update tweet');
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleDelete = async () => {
    if (loading.delete) return;
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await deleteTweet(tweet._id);
      onDelete?.(tweet._id);
      toast.success('Tweet deleted');
    } catch (err) {
      toast.error('Failed to delete tweet');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
      setShowMenu(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#27272a] hover:border-[#3f3f46] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link to={`/channel/${tweet.owner.username}`} className="flex items-center gap-3 flex-shrink-0">
          <img
            src={getAvatarUrl(tweet.owner.avatar)}
            alt={tweet.owner.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-white hover:text-purple-400 transition-colors">
              {tweet.owner.fullName}
            </p>
            <p className="text-xs text-gray-500">@{tweet.owner.username} · {formatTimeAgo(tweet.createdAt)}</p>
          </div>
        </Link>

        {tweet.isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-[#27272a] transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-32 bg-[#27272a] rounded-xl border border-[#3f3f46] shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#3f3f46] transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading.delete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      {loading.delete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-[#0f0f10] border border-[#27272a] rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditContent(tweet.content); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} isLoading={loading.edit}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-gray-200 text-sm whitespace-pre-wrap">
          <LinkifyText>{tweet.content}</LinkifyText>
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          disabled={loading.like}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors",
            isLiked ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          <span>{likeCount}</span>
        </motion.button>
      </div>
    </motion.div>
  );
});

TweetCard.displayName = 'TweetCard';

export default TweetCard;
