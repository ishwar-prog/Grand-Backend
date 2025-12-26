import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const SubscribeButton = ({ 
  isSubscribed, 
  onToggle, 
  loading = false, 
  className 
}) => {
  return (
    <motion.button
      layout
      onClick={onToggle}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden",
        isSubscribed 
          ? "bg-[#27272a] text-gray-300 hover:bg-[#3f3f46] hover:text-white" 
          : "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        loading && "opacity-70 cursor-wait",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : isSubscribed ? (
          <motion.div
            key="subscribed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4 fill-current" />
            <span>Subscribed</span>
          </motion.div>
        ) : (
          <motion.div
            key="subscribe"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span>Subscribe</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SubscribeButton;
