import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatViews, formatTimeAgo, formatDuration, getThumbnailUrl } from '../../utils/formatters';
import { Skeleton } from '../ui/SkeletonCard';
import { cn } from '../../utils/cn';

const RelatedVideos = ({ videos, loading, currentVideoId }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="w-40 h-24 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredVideos = videos.filter(v => v._id !== currentVideoId);

  return (
    <div className="flex flex-col gap-4">
      {filteredVideos.map((video) => (
        <Link 
          key={video._id} 
          to={`/watch/${video._id}`}
          className="group flex gap-2 md:gap-3"
        >
          {/* Thumbnail */}
          <div className="relative w-40 md:w-44 aspect-video rounded-xl overflow-hidden bg-[#1c1c1e] shrink-0">
            <img
              src={getThumbnailUrl(video.thumbnail)}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1 min-w-0 py-0.5">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
              {video.title}
            </h3>
            <div className="text-xs text-gray-400">
              <p className="hover:text-gray-300">{video.owner?.fullName}</p>
              <div className="flex items-center gap-1">
                <span>{formatViews(video.views)}</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedVideos;
