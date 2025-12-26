import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useChannel from '../hooks/useChannel';
import ChannelHeader from '../components/channel/ChannelHeader';
import ChannelVideos from '../components/channel/ChannelVideos';

const Channel = () => {
  const { username } = useParams();
  const { 
    channel, 
    videos, 
    loading, 
    isSubscribed, 
    toggleSubscription, 
    isOwner,
    hasMoreVideos,
    loadMoreVideos,
    error
  } = useChannel(username);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0f0f10] text-white pb-20">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <ChannelHeader 
          channel={channel}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscription}
          isOwner={isOwner}
        />

        <div className="border-t border-[#27272a] pt-8">
          <h2 className="text-xl font-bold mb-6">Videos</h2>
          <ChannelVideos 
            videos={videos}
            loading={loading.videos}
            hasMore={hasMoreVideos}
            onFetchMore={loadMoreVideos}
          />
        </div>
      </div>
    </div>
  );
};

export default Channel;
