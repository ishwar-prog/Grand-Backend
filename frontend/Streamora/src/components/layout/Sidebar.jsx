import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Flame, 
  Users, 
  History, 
  ListVideo, 
  Settings,
  ThumbsUp
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Flame, label: 'Trending', path: '/trending' }, // Placeholder path
  { icon: Users, label: 'Subscriptions', path: '/subscriptions' },
  { icon: History, label: 'History', path: '/history' },
  { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
  { icon: ListVideo, label: 'Playlists', path: '/playlists' }, // Placeholder path
];

const Sidebar = ({ isOpen }) => {
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
        <div className="flex flex-col gap-8 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-[#27272a] text-white" 
                  : "text-gray-400 hover:bg-[#1c1c1e] hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-6 h-6 flex-shrink-0 transition-colors",
                    isOpen ? "mr-0" : "mx-auto"
                  )} />
                  
                  <motion.span
                    animate={{ 
                      opacity: isOpen ? 1 : 0,
                      display: isOpen ? "block" : "none"
                    }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0f0f10]/90 backdrop-blur-xl border-t border-[#27272a] md:hidden z-50 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors",
              isActive ? "text-white" : "text-gray-500"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
