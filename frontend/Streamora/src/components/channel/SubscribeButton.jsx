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
    <div className={cn("glass-button-wrap cursor-pointer rounded-full inline-block", className)}>
      <motion.button
        layout
        onClick={onToggle}
        disabled={loading}
        className={cn(
          "glass-button relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden",
          loading && "opacity-70 cursor-wait"
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
              className="flex items-center gap-2 glass-button-text"
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
              className="flex items-center gap-2 glass-button-text"
            >
              <span>Subscribe</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      <div className="glass-button-shadow rounded-full"></div>
    </div>
  );
};

export default SubscribeButton;
