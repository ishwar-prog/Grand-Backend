import React, { useMemo } from 'react';

// Genre labels with emojis for display
const GENRE_LABELS = {
  horror: '👻 Horror',
  funny: '😂 Funny',
  cartoon: '🎨 Cartoon',
  action: '🔥 Action',
  war: '⚔️ War',
  military: '🎖️ Military',
  music: '🎵 Music',
  chill: '😌 Chill',
  relaxing: '🧘 Relaxing',
  documentary: '🎬 Documentary',
  nature: '🌿 Nature',
  educational: '📚 Educational',
  anime: '⛩️ Anime',
  coding: '💻 Coding',
  tech: '🔧 Tech',
  tutorial: '📖 Tutorial',
  gaming: '🎮 Gaming',
  sports: '⚽ Sports',
  news: '📰 News',
  other: '🎥 Video'
};

// Genre color map (matching backend)
const GENRE_COLORS = {
  horror: '#1a1a1a',
  funny: '#FACC15',
  cartoon: '#EC4899',
  action: '#EF4444',
  war: '#DC2626',
  military: '#B91C1C',
  music: '#3B82F6',
  chill: '#60A5FA',
  relaxing: '#38BDF8',
  documentary: '#22C55E',
  nature: '#16A34A',
  educational: '#4ADE80',
  anime: '#F97316',
  coding: '#6B7280',
  tech: '#9CA3AF',
  tutorial: '#78716C',
  gaming: '#8B5CF6',
  sports: '#14B8A6',
  news: '#64748B',
  other: '#8B5CF6'
};

/**
 * MoodSeekbar - Color-coded progress bar showing video genre
 * Uses a single color for the entire timeline based on detected genre
 */
const MoodSeekbar = ({ moodSegments = [], duration, currentTime, onSeek, genreColor = null, videoGenre = null }) => {
  // Use genre color if available, otherwise fall back to segments
  const timelineColor = useMemo(() => {
    if (genreColor) return genreColor;
    if (moodSegments.length > 0) return moodSegments[0].color;
    return '#8B5CF6'; // Default purple
  }, [genreColor, moodSegments]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const handleClick = (e) => {
    if (!onSeek || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const seekTime = percent * duration;
    onSeek(seekTime);
  };

  return (
    <div className="relative group">
      {/* Genre badge */}
      {videoGenre && (
        <div 
          className="absolute -top-8 left-0 text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ 
            backgroundColor: `${timelineColor}20`,
            color: timelineColor,
            border: `1px solid ${timelineColor}40`
          }}
        >
          {GENRE_LABELS[videoGenre] || videoGenre}
        </div>
      )}
      
      {/* Timeline bar */}
      <div 
        className="relative h-2 bg-[#27272a] rounded-full cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {/* Full timeline with genre color (background) */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ backgroundColor: timelineColor }}
        />
        
        {/* Progress bar (filled portion) */}
        <div 
          className="absolute h-full rounded-full transition-all duration-100"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: timelineColor,
            boxShadow: `0 0 10px ${timelineColor}80`
          }}
        />
        
        {/* Seek handle */}
        <div 
          className="absolute h-4 w-4 bg-white rounded-full -top-1 shadow-lg border-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          style={{ 
            left: `${progressPercent}%`, 
            transform: 'translateX(-50%)',
            borderColor: timelineColor
          }}
        />
      </div>
    </div>
  );
};

// Legend component showing detected genre with color
export const MoodLegend = ({ detectedGenre = null }) => {
  if (!detectedGenre) {
    // Show all genre categories when no genre detected
    return (
      <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-2">
        <span>AI analyzes videos to color the timeline:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GENRE_COLORS.horror }} /> Horror
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GENRE_COLORS.funny }} /> Comedy
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GENRE_COLORS.action }} /> Action
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GENRE_COLORS.music }} /> Music
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: GENRE_COLORS.coding }} /> Tech
        </span>
        <span className="text-gray-600">+ more</span>
      </div>
    );
  }

  const color = GENRE_COLORS[detectedGenre] || GENRE_COLORS.other;
  const label = GENRE_LABELS[detectedGenre] || detectedGenre;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
      <span className="text-gray-500">Detected:</span>
      <span 
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium"
        style={{ 
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}30`
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
    </div>
  );
};

export default MoodSeekbar;
