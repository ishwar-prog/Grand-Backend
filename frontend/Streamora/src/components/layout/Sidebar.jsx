import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Home, 
  Flame, 
  Users, 
  History, 
  ListVideo, 
  Settings,
  ThumbsUp,
  Search,
  X,
  MessageSquare,
  Plus,
  Upload,
  MessageSquarePlus
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: Home, label: 'Home', path: '/', color: 'from-blue-500 to-blue-600', activeColor: 'bg-blue-500/20', hoverColor: 'hover:bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500' },
  { icon: Flame, label: 'Trending', path: '/trending', color: 'from-orange-500 to-red-500', activeColor: 'bg-orange-500/20', hoverColor: 'hover:bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500' },
  { icon: Users, label: 'Subscriptions', path: '/subscriptions', color: 'from-pink-500 to-rose-500', activeColor: 'bg-pink-500/20', hoverColor: 'hover:bg-pink-500/10', textColor: 'text-pink-400', borderColor: 'border-pink-500' },
  { icon: MessageSquare, label: 'Community', path: '/community', color: 'from-purple-500 to-pink-500', activeColor: 'bg-purple-500/20', hoverColor: 'hover:bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500' },
  { icon: History, label: 'History', path: '/history', color: 'from-gray-500 to-gray-600', activeColor: 'bg-gray-500/20', hoverColor: 'hover:bg-gray-500/10', textColor: 'text-gray-300', borderColor: 'border-gray-500' },
  { icon: ThumbsUp, label: 'Liked Videos', path: '/liked', color: 'from-green-500 to-emerald-500', activeColor: 'bg-green-500/20', hoverColor: 'hover:bg-green-500/10', textColor: 'text-green-400', borderColor: 'border-green-500' },
  { icon: ListVideo, label: 'Playlists', path: '/playlists', color: 'from-amber-500 to-orange-500', activeColor: 'bg-amber-500/20', hoverColor: 'hover:bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500' },
];

// Mobile dock items - + in center position
const mobileItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { id: 'trending', icon: Flame, label: 'Trending', path: '/trending', color: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: 'community', icon: MessageSquare, label: 'Community', path: '/community', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'plus', icon: Plus, label: 'Create', path: null, isPlus: true, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { id: 'playlists', icon: ListVideo, label: 'Playlists', path: '/playlists', color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  { id: 'history', icon: History, label: 'History', path: '/history', color: 'bg-gradient-to-br from-gray-500 to-gray-600' },
  { id: 'liked', icon: ThumbsUp, label: 'Liked', path: '/liked', color: 'bg-gradient-to-br from-green-500 to-emerald-500' },
];

// Dock Icon Component for Mobile with touch-based expansion
function DockIcon({ item, mouseX, onClick, isActive, touchedIndex, index, isMenuOpen }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate distance from touched icon for mobile expansion
  const getTouchBasedSize = () => {
    if (touchedIndex === null) return 44;
    const distance = Math.abs(index - touchedIndex);
    if (distance === 0) return 56; // Touched icon
    if (distance === 1) return 50; // Adjacent icons
    if (distance === 2) return 46; // Two away
    return 44; // Default
  };

  // Mouse-based transforms for desktop hover
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const mouseWidthSync = useTransform(distance, [-100, 0, 100], [44, 64, 44]);
  const mouseWidth = useSpring(mouseWidthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const mouseHeightSync = useTransform(distance, [-100, 0, 100], [44, 64, 44]);
  const mouseHeight = useSpring(mouseHeightSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const IconComponent = item.icon;
  const isTouched = touchedIndex === index;
  const touchSize = getTouchBasedSize();

  return (
    <motion.div
      ref={ref}
      style={{ 
        width: touchedIndex !== null ? touchSize : mouseWidth, 
        height: touchedIndex !== null ? touchSize : mouseHeight,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer flex items-center justify-center relative"
    >
      <motion.div
        className={cn(
          "w-full h-full rounded-2xl shadow-lg flex items-center justify-center text-white relative",
          item.color
        )}
        animate={{
          y: isTouched ? -12 : isHovered ? -8 : 0,
          scale: isTouched ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
        }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={{
            scale: isTouched ? 1.1 : isHovered ? 1.15 : 1,
            rotate: item.isPlus ? (isMenuOpen ? 45 : 0) : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"
          animate={{
            opacity: isTouched ? 0.5 : isHovered ? 0.4 : 0.15,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Tooltip - shows on touch for mobile */}
      <AnimatePresence>
        {(isHovered || isTouched) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap pointer-events-none backdrop-blur-xl border border-white/20 shadow-lg"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="mobileDockActive"
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </motion.div>
  );
}

const Sidebar = ({ isOpen, dockHighlight, onOpenUpload, onOpenTweet }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [touchedIndex, setTouchedIndex] = useState(null);
  const mouseX = useMotionValue(Infinity);
  const touchTimeoutRef = useRef(null);

  const handleDockItemClick = (item, index) => {
    // Set touched state for expansion animation
    setTouchedIndex(index);
    
    // Clear any existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    
    // Reset after animation completes
    touchTimeoutRef.current = setTimeout(() => {
      setTouchedIndex(null);
    }, 300);
    
    if (item.isPlus) {
      setShowPlusMenu(prev => !prev);
    } else {
      setShowPlusMenu(false);
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 240 : 72,
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="fixed left-0 top-16 bottom-0 bg-[#0f0f10] border-r border-[#27272a] hidden md:flex flex-col py-4 z-40 overflow-hidden"
      >
        <div className="flex flex-col gap-8 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? cn(item.activeColor, item.textColor)
                  : cn("text-gray-400", item.hoverColor, "hover:text-white")
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Icon Container with Gradient */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 relative overflow-hidden",
                    isOpen ? "" : "mx-auto",
                    `bg-gradient-to-br ${item.color}`,
                    "shadow-lg"
                  )}>
                    <item.icon className="w-5 h-5 text-white" />
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-xl" />
                  </div>
                  
                  <motion.span
                    animate={{ 
                      opacity: isOpen ? 1 : 0,
                      display: isOpen ? "block" : "none"
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "font-medium whitespace-nowrap transition-colors",
                      isActive ? item.textColor : ""
                    )}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full", `bg-gradient-to-b ${item.color}`)}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.aside>

      {/* Mobile Dock - Glass morphism with expandable icons */}
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        onTouchEnd={() => {
          // Reset touch state after touch ends (with delay for animation)
          if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
          touchTimeoutRef.current = setTimeout(() => setTouchedIndex(null), 400);
        }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2 rounded-[28px] bg-white/[0.08] backdrop-blur-2xl px-4 pb-3 pt-5 border border-white/[0.15] md:hidden z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          height: touchedIndex !== null ? 88 : 76,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        style={{ 
          position: 'fixed',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Highlight shine effect when hamburger is tapped */}
        <AnimatePresence>
          {dockHighlight && (
            <>
              {/* Outer glow pulse */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  scale: [0.95, 1.05, 1.1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-blue-500/40 blur-md"
              />
              {/* Shine sweep */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: "200%", opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              />
              {/* Border glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, repeat: 1 }}
                className="absolute inset-0 rounded-3xl border-2 border-white/60"
              />
            </>
          )}
        </AnimatePresence>
        
        {/* Dismiss overlay when plus menu is open */}
        <AnimatePresence>
          {showPlusMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowPlusMenu(false)}
            />
          )}
        </AnimatePresence>

        {/* Plus create menu */}
        <AnimatePresence>
          {showPlusMenu && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-3 shadow-2xl min-w-[180px]"
            >
              <button
                onClick={() => { setShowPlusMenu(false); onOpenUpload?.(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-white" />
                </span>
                Upload Video
              </button>
              <button
                onClick={() => { setShowPlusMenu(false); onOpenTweet?.(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquarePlus className="w-4 h-4 text-white" />
                </span>
                New Post
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {mobileItems.map((item, index) => (
          <DockIcon 
            key={item.id} 
            item={item} 
            index={index}
            totalItems={mobileItems.length}
            mouseX={mouseX}
            touchedIndex={touchedIndex}
            onClick={() => handleDockItemClick(item, index)}
            isActive={item.path && location.pathname === item.path}
            isMenuOpen={item.isPlus && showPlusMenu}
          />
        ))}
      </motion.div>

    </>
  );
};

export default Sidebar;
