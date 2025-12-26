import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '../../utils/cn';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white font-sans selection:bg-purple-500/30">
      <Header 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
      />
      
      <Sidebar isOpen={isSidebarOpen} />

      <motion.main
        animate={{ 
          marginLeft: isMobile ? 0 : (isSidebarOpen ? 240 : 72),
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={cn(
          "pt-16 min-h-screen",
          "pb-20 md:pb-0" // Bottom padding for mobile nav
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default AppLayout;
