import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useVideos from '../hooks/useVideos';
import { toggleSubscription } from '../services/subscriptionService';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoInfo from '../components/video/VideoInfo';
import RelatedVideos from '../components/video/RelatedVideos';
import CommentSection from '../components/video/CommentSection';
import { Skeleton } from '../components/ui/SkeletonCard';
import toast from 'react-hot-toast';

import analyzeVideoMood from '../services/aiService';
import { getVideoMoodSegments } from '../services/aiService';
import { Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

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

  // Local state for subscription (from video.owner)
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  
  // AI Mood Analysis State
  const [moodSegments, setMoodSegments] = useState([]);
  const [videoGenre, setVideoGenre] = useState(null);
  const [genreColor, setGenreColor] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync subscription state when video loads
  useEffect(() => {
    if (video?.owner) {
      setIsSubscribed(video.owner.isSubscribed || false);
      setSubscribersCount(video.owner.subscribersCount || 0);
    }
  }, [video?.owner]);

  // Fetch mood segments and genre data - auto-analyze if not exists
  useEffect(() => {
    const fetchMood = async () => {
      if (!videoId) return;
      try {
        const res = await getVideoMoodSegments(videoId);
        if (res?.data) {
          // Handle new response format with genre info
          if (res.data.segments?.length > 0) {
            setMoodSegments(res.data.segments);
          }
          if (res.data.genre) {
            setVideoGenre(res.data.genre);
          }
          if (res.data.color) {
            setGenreColor(res.data.color);
          }
          
          // Auto-analyze if no genre detected yet
          if (!res.data.genre && !res.data.color) {
            // Trigger analysis in background
            try {
              const analysisRes = await analyzeVideoMood.analyzeVideoMood(videoId);
              if (analysisRes?.data) {
                if (analysisRes.data.moodSegments) {
                  setMoodSegments(analysisRes.data.moodSegments);
                }
                if (analysisRes.data.detectedGenre) {
                  setVideoGenre(analysisRes.data.detectedGenre);
                }
                if (analysisRes.data.genreColor) {
                  setGenreColor(analysisRes.data.genreColor);
                }
              }
            } catch (err) {
              console.error("Auto-analysis failed", err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch mood segments", error);
      }
    };
    fetchMood();
  }, [videoId]);

  const handleAnalyzeMood = async () => {
    if (!videoId) return;
    setIsAnalyzing(true);
    toast.loading("Analyzing video genre... (this may take a moment)");
    try {
      const res = await analyzeVideoMood.analyzeVideoMood(videoId);
      if (res?.data) {
        // Update with new genre data
        if (res.data.moodSegments) {
          setMoodSegments(res.data.moodSegments);
        }
        if (res.data.detectedGenre) {
          setVideoGenre(res.data.detectedGenre);
        }
        if (res.data.genreColor) {
          setGenreColor(res.data.genreColor);
        }
        toast.dismiss();
        toast.success(`Detected: ${res.data.detectedGenre || 'Unknown'} video!`);
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to analyze video");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSubscription = useCallback(async () => {
    if (!video?.owner?._id) return;
    
    setSubscribeLoading(true);
    try {
      const res = await toggleSubscription(video.owner._id);
      const newSubscribed = res?.data?.isSubscribed ?? !isSubscribed;
      setIsSubscribed(newSubscribed);
      setSubscribersCount(prev => prev + (newSubscribed ? 1 : -1));
      toast.success(newSubscribed ? 'Subscribed!' : 'Unsubscribed');
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setSubscribeLoading(false);
    }
  }, [video?.owner?._id, isSubscribed]);

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
          moodSegments={moodSegments}
          genreColor={genreColor}
          videoGenre={videoGenre}
        />
        
        <VideoInfo 
          video={video}
          channel={{ ...video.owner, subscribersCount }} // Use local subscribersCount for live updates
          isSubscribed={isSubscribed}
          subscribeLoading={subscribeLoading}
          onToggleSubscribe={handleToggleSubscription}
          onToggleLike={() => toggleLike(video._id)}
          isLiked={video.isLiked}
          likeCount={video.likesCount || 0}
          onAnalyzeMood={handleAnalyzeMood}
          isAnalyzing={isAnalyzing}
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
