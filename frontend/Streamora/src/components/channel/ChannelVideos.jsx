import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import VideoCard, { VideoCardSkeleton } from '../ui/VideoCard';
import { cn } from '../../utils/cn';

const ChannelVideos = ({ 
  videos, 
  loading, 
  hasMore, 
  onFetchMore,
  className 
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onFetchMore();
    }
  }, [inView, hasMore, loading, onFetchMore]);

  if (!loading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
          <Film className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-white">No videos yet</h3>
        <p className="text-sm">This channel hasn't uploaded any videos.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
        {videos.map((video, index) => (
          <VideoCard 
            key={video._id || index} 
            video={video} 
          />
        ))}
        
        {loading && (
          <>
            {[...Array(8)].map((_, i) => (
              <VideoCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={ref} className="h-10 w-full" />}
    </div>
  );
};

export default ChannelVideos;
