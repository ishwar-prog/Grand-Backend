import React from 'react';
import { cn } from '../../utils/cn';

const VideoPlayer = ({ videoSrc, poster, className }) => {
  return (
    <div className={cn("relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10", className)}>
      <video
        src={videoSrc}
        poster={poster}
        controls
        autoPlay
        className="w-full h-full object-contain"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
