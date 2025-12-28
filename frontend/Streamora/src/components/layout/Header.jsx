import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Menu, 
  Bell, 
  Upload, 
  User, 
  LogOut, 
  Settings,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import VideoUploadModal from './VideoUploadModal';
import NotificationDropdown from './NotificationDropdown';
import { getAvatarUrl } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f10]/80 backdrop-blur-xl border-b border-[#27272a] z-50 px-4 flex items-center justify-between">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.jpg" 
              alt="Streamora" 
              className="w-10 h-10 object-contain rounded-2xl"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              Streamora
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <div className="relative w-full group">
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 bg-[#1c1c1e] border-transparent focus:bg-[#27272a] transition-all rounded-full"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex relative"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="w-5 h-5" />
              </Button>
              
              <NotificationDropdown />

              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-purple-500 transition-colors"
                >
                  <img 
                    src={getAvatarUrl(user?.avatar)} 
                    alt={user?.username} 
                    className="w-full h-full object-cover"
                  />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-[#1c1c1e] border border-[#27272a] rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                      >
                        <div className="px-4 py-3 border-b border-[#27272a] mb-2">
                          <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                          <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <Link 
                            to={`/channel/${user?.username}`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#27272a] hover:text-white rounded-xl transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            Your Channel
                          </Link>
{/* Settings removed */}
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="md">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          // Refresh videos or show success toast
          window.location.reload(); // Simple refresh for now
        }}
      />
    </>
  );
};

export default Header;

