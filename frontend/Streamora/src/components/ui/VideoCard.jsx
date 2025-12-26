import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { formatDuration, formatViews, formatTimeAgo, getThumbnailUrl, getAvatarUrl } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const VideoCard = ({ video, className }) => {
  if (!video) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("group flex flex-col gap-3", className)}
    >
      {/* Thumbnail Container */}
      <Link to={`/watch/${video._id}`} className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1c1c1e]">
        <img
          src={getThumbnailUrl(video.thumbnail)}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-xs font-medium text-white backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex gap-3 items-start">
        {/* Avatar (Optional, if not on channel page) */}
        {video.owner?.avatar && (
          <Link to={`/channel/${video.owner.username}`} className="flex-shrink-0 mt-0.5">
            <img
              src={getAvatarUrl(video.owner.avatar)}
              alt={video.owner.username}
              className="w-9 h-9 rounded-full object-cover bg-[#1c1c1e]"
            />
          </Link>
        )}

        <div className="flex flex-col gap-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          
          <div className="flex flex-col text-xs text-gray-400">
            {video.owner?.fullName && (
              <Link to={`/channel/${video.owner.username}`} className="hover:text-gray-300 transition-colors">
                {video.owner.fullName}
              </Link>
            )}
            <div className="flex items-center gap-1">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="w-full aspect-video rounded-xl bg-[#1c1c1e]" />
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-[#1c1c1e] flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-[#1c1c1e] rounded w-3/4" />
        <div className="h-3 bg-[#1c1c1e] rounded w-1/2" />
      </div>
    </div>
  </div>
);

export default VideoCard;
