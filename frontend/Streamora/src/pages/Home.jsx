import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import useVideos from '../hooks/useVideos';
import VideoCard, { VideoCardSkeleton } from '../components/ui/VideoCard';
import { cn } from '../utils/cn';

const Home = () => {
  const { 
    videos, 
    loading, 
    hasMore, 
    loadMore, 
    refresh 
  } = useVideos({ autoFetch: true });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !loading.list) {
      loadMore();
    }
  }, [inView, hasMore, loading.list, loadMore]);

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Categories / Filters (Optional - Placeholder for now) */}
      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
        {['All', 'Gaming', 'Music', 'Tech', 'Vlogs', 'Education'].map((cat, i) => (
          <button
            key={cat}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              i === 0 
                ? "bg-white text-black" 
                : "bg-[#27272a] text-gray-300 hover:bg-[#3f3f46] hover:text-white"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
        {videos.map((video, index) => (
          <VideoCard 
            key={video._id || index} 
            video={video} 
          />
        ))}
        
        {loading.list && (
          <>
            {[...Array(12)].map((_, i) => (
              <VideoCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* Empty State */}
      {!loading.list && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
            <Film className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-white">No videos found</h3>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={ref} className="h-10 w-full" />}
    </div>
  );
};

export default Home;
