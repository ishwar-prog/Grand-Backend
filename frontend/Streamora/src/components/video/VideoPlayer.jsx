import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import MoodSeekbar, { MoodLegend } from './MoodSeekbar';

const VideoPlayer = ({ videoSrc, poster, className, moodSegments = [] }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
        <video
          ref={videoRef}
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

      {/* AI Mood Seekbar */}
      {moodSegments.length > 0 && (
        <div className="px-1">
          <MoodSeekbar 
            moodSegments={moodSegments} 
            duration={duration} 
            currentTime={currentTime} 
            onSeek={handleSeek} 
          />
          <MoodLegend />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
