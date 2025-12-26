import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3 } from 'lucide-react';
import SubscribeButton from './SubscribeButton';
import { getAvatarUrl, formatSubscribers, formatVideoCount } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const ChannelHeader = ({ 
  channel, 
  isSubscribed, 
  onToggleSubscribe, 
  isOwner,
  className 
}) => {
  if (!channel) return <ChannelHeaderSkeleton />;

  return (
    <div className={cn("w-full flex flex-col gap-6", className)}>
      {/* Cover Image */}
      <div className="relative w-full aspect-[4/1] min-h-[160px] max-h-[280px] rounded-3xl overflow-hidden bg-[#1c1c1e] group">
        {channel.coverImage ? (
          <img 
            src={channel.coverImage} 
            alt="Channel Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#27272a] to-[#1c1c1e]" />
        )}
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row gap-6 px-4">
        {/* Avatar */}
        <div className="relative -mt-12 md:-mt-16 flex-shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-[#0f0f10]">
            <img 
              src={getAvatarUrl(channel.avatar)} 
              alt={channel.fullName} 
              className="w-full h-full rounded-full object-cover bg-[#1c1c1e]"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {channel.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-sm">
              <span className="font-medium text-gray-300">@{channel.username}</span>
              <span>•</span>
              <span>{formatSubscribers(channel.subscribersCount)}</span>
              <span>•</span>
              <span>{formatVideoCount(channel.videosCount || 0)}</span>
            </div>
            
            {/* Description (Truncated) */}
            {channel.description && (
              <p className="mt-3 text-gray-400 text-sm max-w-2xl line-clamp-2">
                {channel.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isOwner ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#27272a] text-white font-medium hover:bg-[#3f3f46] transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Customize Channel</span>
              </motion.button>
            ) : (
              <SubscribeButton 
                isSubscribed={isSubscribed} 
                onToggle={onToggleSubscribe} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelHeaderSkeleton = () => (
  <div className="w-full flex flex-col gap-6 animate-pulse">
    <div className="w-full aspect-[4/1] rounded-3xl bg-[#1c1c1e]" />
    <div className="flex flex-col md:flex-row gap-6 px-4">
      <div className="relative -mt-12 md:-mt-16 flex-shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0f0f10] p-1">
          <div className="w-full h-full rounded-full bg-[#1c1c1e]" />
        </div>
      </div>
      <div className="flex-1 pt-2 space-y-4">
        <div className="h-8 w-48 bg-[#1c1c1e] rounded-lg" />
        <div className="h-4 w-64 bg-[#1c1c1e] rounded-lg" />
        <div className="h-4 w-full max-w-md bg-[#1c1c1e] rounded-lg" />
      </div>
    </div>
  </div>
);

export default ChannelHeader;
