import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Sparkles } from 'lucide-react';
import SubscribeButton from '../channel/SubscribeButton';
import Button from '../ui/Button';
import { formatViews, formatTimeAgo, formatSubscribers, getAvatarUrl } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import AddToPlaylistModal from './AddToPlaylistModal';
import { getUserPlaylists } from '../../services/playlistService';
import useAuthStore from '../../store/authStore';

const VideoInfo = ({ 
  video, 
  channel, 
  isSubscribed, 
  subscribeLoading,
  onToggleSubscribe, 
  onToggleLike,
  isLiked,
  likeCount,
  onAnalyzeMood,
  isAnalyzing
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const user = useAuthStore(state => state.user);

  // Check if video is in any playlist to set Saved state
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user?._id && video?._id) {
        try {
          const res = await getUserPlaylists(user._id);
          const playlists = res.data || res || [];
          // Check if video ID exists in any playlist's videos array
          // Note: Backend might return populated videos or just IDs. 
          // If populated, v._id. If ID, v.
          const isVideoSaved = playlists.some(p => 
            p.videos?.some(v => (v._id === video._id || v === video._id))
          );
          setIsSaved(isVideoSaved);
        } catch (err) {
          console.error("Failed to check saved status", err);
        }
      }
    };
    checkSavedStatus();
  }, [user?._id, video?._id, isPlaylistModalOpen]); // Re-check when modal closes/changes

  if (!video) return <VideoInfoSkeleton />;

  // Normalized owner object
  const owner = video.owner || video.channel;

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold text-white line-clamp-2">
        {video.title}
      </h1>

      {/* Channel & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-4">
          <Link to={`/channel/${owner?.username}`} className="flex-shrink-0">
            <img 
              src={getAvatarUrl(owner?.avatar)} 
              alt={owner?.username} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-[#27272a]"
            />
          </Link>
          <div className="flex flex-col">
            <Link 
              to={`/channel/${owner?.username}`}
              className="font-semibold text-white hover:text-gray-300 transition-colors"
            >
              {owner?.fullName}
            </Link>
            <span className="text-xs text-gray-400">
              {formatSubscribers(channel?.subscribersCount || 0)}
            </span>
          </div>
          <div className="ml-2">
            <SubscribeButton 
              isSubscribed={isSubscribed} 
              onToggle={onToggleSubscribe}
              loading={subscribeLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {/* Like/Dislike Group */}
          <div className="glass-button-wrap rounded-full">
            <div className="glass-button flex items-center rounded-full">
              <button 
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-l-full transition-colors glass-button-text",
                  isLiked && "text-purple-400"
                )}
                onClick={onToggleLike}
              >
                <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-current")} />
                <span>{likeCount}</span>
              </button>
              <div className="w-[1px] h-6 bg-white/10" />
              <button className="flex items-center px-4 py-2.5 rounded-r-full transition-colors glass-button-text">
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
            <div className="glass-button-shadow rounded-full"></div>
          </div>

          <Button variant="secondary" className="gap-2" size="sm">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </Button>

          <Button 
            variant="secondary" 
            size="sm"
            className={cn(
              "gap-2",
              isSaved && "text-purple-400"
            )}
            onClick={() => setIsPlaylistModalOpen(true)}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            <span>Save</span>
          </Button>

          <Button 
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={onAnalyzeMood}
            disabled={isAnalyzing}
          >
            <Sparkles className={cn("w-5 h-5", isAnalyzing && "animate-pulse text-purple-400")} />
            <span>{isAnalyzing ? "Analyzing..." : "Mood"}</span>
          </Button>
        </div>
      </div>

      {/* Description Box */}
      <motion.div 
        layout
        className="bg-[#27272a] rounded-xl p-3 cursor-pointer hover:bg-[#3f3f46] transition-colors"
        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
          <span>{formatViews(video.views)}</span>
          <span>•</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
        </div>
        
        <div className={cn(
          "text-sm text-gray-300 whitespace-pre-wrap overflow-hidden",
          !isDescriptionExpanded && "line-clamp-2"
        )}>
          {video.description}
        </div>
        
        <button className="mt-2 text-sm font-medium text-white hover:text-gray-300">
          {isDescriptionExpanded ? 'Show less' : '...more'}
        </button>
      </motion.div>

      <AddToPlaylistModal 
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        videoId={video._id}
      />
    </div>
  );
};

const VideoInfoSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-8 bg-[#27272a] rounded w-3/4" />
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#27272a]" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#27272a] rounded" />
          <div className="h-3 w-24 bg-[#27272a] rounded" />
        </div>
        <div className="w-24 h-9 bg-[#27272a] rounded-full ml-2" />
      </div>
      <div className="flex gap-2">
        <div className="w-32 h-10 bg-[#27272a] rounded-full" />
        <div className="w-24 h-10 bg-[#27272a] rounded-full" />
      </div>
    </div>
    <div className="h-24 bg-[#27272a] rounded-xl w-full" />
  </div>
);

export default VideoInfo;
