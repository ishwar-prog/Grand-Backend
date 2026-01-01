import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { createTweet } from '../../services/tweetService';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getAvatarUrl } from '../../utils/formatters';

const TweetModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    
    setLoading(true);
    try {
      await createTweet(content.trim());
      toast.success('Tweet posted!');
      setContent('');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1c1c1e] rounded-2xl border border-[#27272a] shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <h2 className="text-lg font-semibold text-white">Create Post</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex gap-3">
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt={user?.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm min-h-[120px]"
                  autoFocus
                  maxLength={500}
                />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#27272a]">
                <span className="text-xs text-gray-500">{content.length}/500</span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim()}
                  isLoading={loading}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Post
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TweetModal;
