import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useVideos from '../hooks/useVideos';
import useChannel from '../hooks/useChannel';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoInfo from '../components/video/VideoInfo';
import RelatedVideos from '../components/video/RelatedVideos';
import CommentSection from '../components/video/CommentSection';
import { Skeleton } from '../components/ui/SkeletonCard';

const Watch = () => {
  const { videoId } = useParams();
  const { 
    currentVideo: video, 
    fetchVideo, 
    loading, 
    videos: relatedVideos, 
    fetchVideos: fetchRelated,
    toggleLike
  } = useVideos({ autoFetch: false });

  // We need channel info for subscription status
  // Only fetch if we have a video owner
  const { 
    isSubscribed, 
    toggleSubscription, 
    channel 
  } = useChannel(video?.owner?.username);

  useEffect(() => {
    if (videoId) {
      fetchVideo(videoId);
      fetchRelated(1, true); // Fetch related videos
      window.scrollTo(0, 0);
    }
  }, [videoId, fetchVideo, fetchRelated]);

  if (loading.single || !video) {
    return <WatchSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1800px] mx-auto">
      {/* Main Content */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <VideoPlayer 
          videoSrc={video.videoFile} 
          poster={video.thumbnail} 
        />
        
        <VideoInfo 
          video={video}
          channel={channel || video.owner} // Fallback to owner obj if channel hook hasn't loaded full profile
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscription}
          onToggleLike={() => toggleLike(video._id)}
          isLiked={video.isLiked}
          likeCount={video.likesCount || 0}
        />
        
        <div className="border-t border-[#27272a] pt-6">
          <CommentSection videoId={video._id} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-bold text-white mb-4 hidden lg:block">
          Related Videos
        </h3>
        <RelatedVideos 
          videos={relatedVideos} 
          loading={loading.list} 
          currentVideoId={video._id} 
        />
      </div>
    </div>
  );
};

const WatchSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1800px] mx-auto">
    <div className="lg:col-span-2 flex flex-col gap-6">
      <Skeleton className="w-full aspect-video rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="w-32 h-10 rounded-full" />
        </div>
      </div>
    </div>
    <div className="lg:col-span-1 hidden lg:block">
      <div className="flex flex-col gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="w-40 h-24 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Watch;
