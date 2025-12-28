import React, { useMemo } from 'react';

/**
 * MoodSeekbar - Color-coded progress bar showing video mood segments
 * 
 * @param {Array} moodSegments - Array of { startTime, endTime, mood, color }
 * @param {number} duration - Total video duration in seconds
 * @param {number} currentTime - Current playback time
 * @param {function} onSeek - Callback when user clicks to seek
 */
const MoodSeekbar = ({ moodSegments = [], duration, currentTime, onSeek }) => {
  // Calculate segment positions as percentages
  const segments = useMemo(() => {
    if (!moodSegments.length || !duration) return [];
    
    return moodSegments.map(segment => ({
      ...segment,
      left: (segment.startTime / duration) * 100,
      width: ((segment.endTime - segment.startTime) / duration) * 100
    }));
  }, [moodSegments, duration]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const handleClick = (e) => {
    if (!onSeek || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const seekTime = percent * duration;
    onSeek(seekTime);
  };

  const getMoodLabel = (mood) => {
    const labels = {
      action: '🔥 Action',
      funny: '😂 Funny',
      chill: '😌 Chill',
      horror: '👻 Horror',
      intense: '⚡ Intense',
      emotional: '💜 Emotional'
    };
    return labels[mood] || mood;
  };

  if (!segments.length) {
    // Fallback to regular progress bar when no mood data
    return (
      <div 
        className="relative h-1 bg-[#27272a] rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        <div 
          className="absolute h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        <div 
          className="absolute h-3 w-3 bg-white rounded-full -top-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
        />
      </div>
    );
  }

  return (
    <div 
      className="relative h-2 bg-[#27272a] rounded-full cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      {/* Mood segments */}
      {segments.map((segment, index) => (
        <div
          key={index}
          className="absolute h-full opacity-80 hover:opacity-100 transition-opacity"
          style={{
            left: `${segment.left}%`,
            width: `${segment.width}%`,
            backgroundColor: segment.color
          }}
          title={getMoodLabel(segment.mood)}
        />
      ))}
      
      {/* Progress overlay */}
      <div 
        className="absolute h-full bg-white/30 backdrop-blur-sm"
        style={{ width: `${progressPercent}%` }}
      />
      
      {/* Seek handle */}
      <div 
        className="absolute h-4 w-4 bg-white rounded-full -top-1 shadow-lg border-2 border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

// Legend component for mood colors
export const MoodLegend = () => (
  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-red-500" /> Action
    </span>
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-yellow-500" /> Funny
    </span>
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-blue-500" /> Chill
    </span>
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-gray-900" /> Horror
    </span>
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-orange-500" /> Intense
    </span>
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm bg-purple-500" /> Emotional
    </span>
  </div>
);

export default MoodSeekbar;
