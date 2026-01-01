import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Play, Flame } from 'lucide-react';
import useVideos from '../hooks/useVideos';
import { VideoCardSkeleton } from '../components/ui/VideoCard';
import { formatDuration, formatViews, formatTimeAgo, getThumbnailUrl, getAvatarUrl } from '../utils/formatters';
import { GradientTracing } from '../components/ui/gradient-tracing';

const Trending = () => {
  const { videos, loading, hasMore, loadMore } = useVideos({ initialSortBy: 'views' });
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasMore && !loading.list) loadMore();
  }, [inView, hasMore, loading.list, loadMore]);

  // Sort: most views first, if equal views → most recent first
  const sorted = useMemo(() => 
    [...videos].sort((a, b) => b.views - a.views || new Date(b.createdAt) - new Date(a.createdAt))
  , [videos]);

  return (
    <div className="w-full min-h-screen pb-20 relative">
      {/* Fire Flame SVG - Fixed on right side, xl screens only */}
      <div className="hidden xl:flex fixed right-[20%] top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 40px #FF4500) drop-shadow(0 0 80px #FF6600)' }}>
        <svg width="350" height="490" viewBox="0 0 100 140" className="animate-pulse">
          {/* Outer red flame */}
          <path
            d="M50,5 C55,20 70,35 75,55 C82,80 78,100 70,115 C80,105 90,85 88,60 C86,40 75,25 65,15 C60,10 55,8 50,5 Z"
            fill="#C41E3A"
          />
          <path
            d="M50,5 C45,20 30,35 25,55 C18,80 22,100 30,115 C20,105 10,85 12,60 C14,40 25,25 35,15 C40,10 45,8 50,5 Z"
            fill="#DC143C"
          />
          {/* Main red/orange flame body */}
          <path
            d="M50,10 C60,30 75,50 72,80 C70,100 60,120 50,135 C40,120 30,100 28,80 C25,50 40,30 50,10 Z"
            fill="#FF4500"
          />
          {/* Orange middle flame */}
          <path
            d="M50,25 C58,40 68,55 65,80 C63,95 55,110 50,125 C45,110 37,95 35,80 C32,55 42,40 50,25 Z"
            fill="#FF6600"
          />
          {/* Yellow/Orange inner flame */}
          <path
            d="M50,40 C55,52 62,65 60,82 C58,92 53,102 50,112 C47,102 42,92 40,82 C38,65 45,52 50,40 Z"
            fill="#FFA500"
          />
          {/* Bright yellow core */}
          <path
            d="M50,55 C53,65 57,75 55,88 C54,95 52,100 50,105 C48,100 46,95 45,88 C43,75 47,65 50,55 Z"
            fill="#FFD700"
          />
          {/* White/yellow hottest center */}
          <path
            d="M50,68 C51,75 53,82 52,90 C51,94 50,96 50,98 C50,96 49,94 48,90 C47,82 49,75 50,68 Z"
            fill="#FFFF00"
          />
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Trending</h1>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((video, i) => (
          <TrendingCard key={video._id} video={video} rank={i + 1} />
        ))}
        {loading.list && [...Array(5)].map((_, i) => <TrendingCardSkeleton key={i} />)}
      </div>

      {!loading.list && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">No trending videos</h3>
        </div>
      )}

      {hasMore && <div ref={ref} className="h-10" />}
    </div>
  );
};

const TrendingCard = ({ video, rank }) => {
  const owner = video.owner || video.channel;
  return (
    <div className="flex gap-4 group">
      <span className="text-3xl font-bold text-gray-600 w-8 flex-shrink-0 flex items-center justify-center">{rank}</span>
      <Link to={`/watch/${video._id}`} className="relative w-40 sm:w-56 aspect-video rounded-xl overflow-hidden bg-[#1c1c1e] flex-shrink-0">
        <img src={getThumbnailUrl(video.thumbnail)} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-medium text-white">{formatDuration(video.duration)}</div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Play className="w-3 h-3 text-white fill-white" /></div>
        </div>
      </Link>
      <div className="flex flex-col justify-center min-w-0 py-1">
        <Link to={`/watch/${video._id}`} className="text-white font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-purple-400 transition-colors">{video.title}</Link>
        {owner && <Link to={`/channel/${owner.username}`} className="text-xs text-gray-400 hover:text-gray-300 mt-1">{owner.fullName || owner.username}</Link>}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{formatViews(video.views)}</span>
          <span>•</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

const TrendingCardSkeleton = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="w-8 h-6 bg-[#1c1c1e] rounded" />
    <div className="w-40 sm:w-56 aspect-video rounded-xl bg-[#1c1c1e] flex-shrink-0" />
    <div className="flex-1 space-y-2 py-2">
      <div className="h-4 bg-[#1c1c1e] rounded w-3/4" />
      <div className="h-3 bg-[#1c1c1e] rounded w-1/2" />
      <div className="h-3 bg-[#1c1c1e] rounded w-1/3" />
    </div>
  </div>
);

export default Trending;
