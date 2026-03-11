import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';
import Hls from 'hls.js';

const GENRE_COLORS = {
  horror: '#1a1a1a', funny: '#FACC15', cartoon: '#EC4899', action: '#EF4444', war: '#DC2626',
  military: '#B91C1C', music: '#3B82F6', chill: '#60A5FA', relaxing: '#38BDF8', documentary: '#22C55E',
  nature: '#16A34A', educational: '#4ADE80', anime: '#F97316', coding: '#6B7280', tech: '#9CA3AF',
  tutorial: '#78716C', gaming: '#8B5CF6', sports: '#14B8A6', news: '#64748B', other: '#8B5CF6'
};

const formatTime = (s) => !s || isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

const VideoPlayer = ({ videoSrc, hlsUrl, poster, className, genreColor = null, videoGenre = null }) => {
  const videoRef = useRef(null), containerRef = useRef(null), progressRef = useRef(null), hideTimeout = useRef(null);
  const hlsRef = useRef(null); // Persistent HLS instance for quality control
  const [state, setState] = useState({ playing: false, time: 0, duration: 0, volume: 1, muted: false, fullscreen: false, controls: true, hovering: false, hoverTime: 0, buffered: 0 });
  const [doubleTap, setDoubleTap] = useState({ show: false, side: null, count: 0 });
  const [qualities, setQualities] = useState([]); // Available HLS quality levels
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [showQuality, setShowQuality] = useState(false);

  const color = genreColor || GENRE_COLORS[videoGenre] || '#8B5CF6';
  const progress = state.duration ? (state.time / state.duration) * 100 : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls;

    if (hlsUrl && Hls.isSupported()) {
      hls = new Hls({ capLevelToPlayerSize: true, maxBufferSize: 30 * 1000 * 1000 });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Build quality label list from hls.levels
        const levels = hls.levels.map((l, i) => ({
          index: i,
          label: l.height ? `${l.height}p` : `${Math.round((l.bitrate || 0) / 1000)}kbps`
        }));
        setQualities(levels);
        setCurrentLevel(-1); // Default to Auto
      });
    } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple HLS (Safari) â€” quality is handled by the browser natively
      video.src = hlsUrl;
    } else {
      // MP4 fallback for legacy videos
      video.src = videoSrc;
    }

    return () => {
      if (hls) { hls.destroy(); hlsRef.current = null; }
      setQualities([]);
      setCurrentLevel(-1);
    };
  }, [hlsUrl, videoSrc]);

  // Change quality level: -1 = Auto ABR, 0/1/2... = locked level
  const setQuality = useCallback((level) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
    }
    setShowQuality(false);
  }, []);

  const qualityLabel = currentLevel === -1 ? 'Auto' : (qualities[currentLevel]?.label ?? 'Auto');

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handlers = {
      timeupdate: () => setState(s => ({ ...s, time: v.currentTime })),
      loadedmetadata: () => setState(s => ({ ...s, duration: v.duration })),
      play: () => setState(s => ({ ...s, playing: true })),
      pause: () => setState(s => ({ ...s, playing: false })),
      progress: () => v.buffered.length && setState(s => ({ ...s, buffered: (v.buffered.end(v.buffered.length-1)/v.duration)*100 })),
      volumechange: () => setState(s => ({ ...s, volume: v.volume, muted: v.muted }))
    };
    Object.entries(handlers).forEach(([e, h]) => v.addEventListener(e, h));
    return () => Object.entries(handlers).forEach(([e, h]) => v.removeEventListener(e, h));
  }, []);

  useEffect(() => {
    const h = () => setState(s => ({ ...s, fullscreen: !!document.fullscreenElement }));
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const resetHide = useCallback(() => {
    setState(s => ({ ...s, controls: true }));
    clearTimeout(hideTimeout.current);
    // Don't auto-hide controls while quality menu is open
    if (state.playing && !showQuality) {
      hideTimeout.current = setTimeout(() => setState(s => ({ ...s, controls: false })), 3000);
    }
  }, [state.playing, showQuality]);

  useEffect(() => { resetHide(); return () => clearTimeout(hideTimeout.current); }, [state.playing, showQuality, resetHide]);

  const toggle = () => videoRef.current?.[videoRef.current.paused ? 'play' : 'pause']();
  const seek = (e) => { const r = progressRef.current?.getBoundingClientRect(); if (r) videoRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width)) * state.duration; };
  const skip = (s) => videoRef.current && (videoRef.current.currentTime = Math.max(0, Math.min(state.duration, videoRef.current.currentTime + s)));
  const toggleMute = () => videoRef.current && (videoRef.current.muted = !videoRef.current.muted);
  const setVol = (e) => { if (videoRef.current) { videoRef.current.volume = +e.target.value; videoRef.current.muted = +e.target.value === 0; }};
  const toggleFs = () => !document.fullscreenElement ? containerRef.current?.requestFullscreen() : document.exitFullscreen();

  // Double-tap to seek (YouTube-style)
  const lastTap = useRef({ time: 0, side: null });
  const handleDoubleTap = (side) => {
    const now = Date.now();
    if (lastTap.current.side === side && now - lastTap.current.time < 300) {
      const skipAmount = side === 'left' ? -10 : 10;
      skip(skipAmount);
      setDoubleTap(prev => ({ show: true, side, count: prev.side === side ? prev.count + 10 : 10 }));
      setTimeout(() => setDoubleTap({ show: false, side: null, count: 0 }), 800);
    }
    lastTap.current = { time: now, side };
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" onMouseMove={resetHide} onMouseLeave={() => { state.playing && setState(s => ({ ...s, controls: false })); setShowQuality(false); }}>
        <video ref={videoRef} poster={poster} autoPlay playsInline className="w-full h-full object-contain cursor-pointer" onClick={toggle} onDoubleClick={toggleFs} />

        {/* Double-tap zones for 10s skip */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-1/3 h-full pointer-events-auto" onClick={() => handleDoubleTap('left')} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full pointer-events-auto" onClick={() => handleDoubleTap('right')} />
        </div>

        {/* Double-tap feedback animation */}
        {doubleTap.show && (
          <div className={cn("absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 animate-pulse", doubleTap.side === 'left' ? 'left-[15%]' : 'right-[15%]')}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {doubleTap.side === 'left' ? <SkipBack className="w-8 h-8 text-white" /> : <SkipForward className="w-8 h-8 text-white" />}
            </div>
            <span className="text-white text-sm font-semibold">{doubleTap.count} seconds</span>
          </div>
        )}

        {!state.playing && <div className="absolute inset-0 flex items-center justify-center" onClick={toggle}><div className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: `${color}40`, boxShadow: `0 0 40px ${color}60` }}><Play className="w-8 h-8 text-white ml-1" fill="white" /></div></div>}

        <div className={cn("absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 transition-opacity", state.controls ? "opacity-100" : "opacity-0")}>
          <div ref={progressRef} className="relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 hover:h-2.5 transition-all group" onClick={seek} onMouseEnter={() => setState(s => ({ ...s, hovering: true }))} onMouseLeave={() => setState(s => ({ ...s, hovering: false }))} onMouseMove={(e) => { const r = progressRef.current?.getBoundingClientRect(); r && setState(s => ({ ...s, hoverTime: Math.max(0, Math.min(1, (e.clientX-r.left)/r.width)) * state.duration })); }}>
            <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${state.buffered}%` }} />
            <div className="absolute h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}80` }} />
            <div className={cn("absolute top-1/2 w-4 h-4 rounded-full bg-white shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all", state.hovering ? "opacity-100" : "opacity-0")} style={{ left: `${progress}%`, boxShadow: `0 0 10px ${color}` }} />
            {state.hovering && <div className="absolute -top-10 px-2 py-1 rounded text-xs text-white bg-black/80 -translate-x-1/2" style={{ left: `${(state.hoverTime/state.duration)*100}%` }}>{formatTime(state.hoverTime)}</div>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">{state.playing ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />}</button>
              <button onClick={() => skip(-10)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><SkipBack className="w-4 h-4 text-white" /></button>
              <button onClick={() => skip(10)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><SkipForward className="w-4 h-4 text-white" /></button>
              <div className="flex items-center gap-2 group">
                <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">{state.muted || state.volume === 0 ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}</button>
                <input type="range" min="0" max="1" step="0.1" value={state.muted ? 0 : state.volume} onChange={setVol} className="w-0 group-hover:w-20 transition-all h-1 cursor-pointer" style={{ accentColor: color }} />
              </div>
              <span className="text-white text-sm ml-2">{formatTime(state.time)} / {formatTime(state.duration)}</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Quality switcher â€” only visible when HLS is active with multiple levels */}
              {qualities.length > 1 && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowQuality(v => !v); }}
                    className="flex items-center gap-1.5 px-2.5 h-8 rounded-full hover:bg-white/10 transition-colors"
                    title="Quality"
                  >
                    <Settings className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-semibold">{qualityLabel}</span>
                  </button>

                  {showQuality && (
                    <div className="absolute bottom-10 right-0 z-50 min-w-[110px] rounded-xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl" style={{ backgroundColor: 'rgba(15,15,20,0.92)' }}>
                      <div className="px-3 py-2 border-b border-white/10">
                        <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Quality</span>
                      </div>
                      {/* Auto option */}
                      <button
                        onClick={() => setQuality(-1)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-white/10",
                          currentLevel === -1 ? "text-white font-semibold" : "text-white/70"
                        )}
                      >
                        <span>Auto</span>
                        {currentLevel === -1 && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        )}
                      </button>
                      {/* Per-level options, highest quality first */}
                      {[...qualities].reverse().map((q) => (
                        <button
                          key={q.index}
                          onClick={() => setQuality(q.index)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-white/10",
                            currentLevel === q.index ? "text-white font-semibold" : "text-white/70"
                          )}
                        >
                          <span>{q.label}</span>
                          {currentLevel === q.index && (
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={toggleFs} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">{state.fullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;


