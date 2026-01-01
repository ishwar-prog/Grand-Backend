import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { getAllTweets } from '../services/tweetService';
import TweetCard from '../components/tweet/TweetCard';
import TweetModal from '../components/tweet/TweetModal';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Community = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showTweetModal, setShowTweetModal] = useState(false);

  const fetchTweets = useCallback(async (pageNum = 1, append = false) => {
    try {
      pageNum === 1 ? setLoading(true) : setLoadingMore(true);
      const res = await getAllTweets(pageNum);
      if (res?.data) {
        setTweets(prev => append ? [...prev, ...res.data.tweets] : res.data.tweets);
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const handleUpdate = (tweetId, newContent) => {
    setTweets(prev => prev.map(t => t._id === tweetId ? { ...t, content: newContent } : t));
  };

  const handleDelete = (tweetId) => {
    setTweets(prev => prev.filter(t => t._id !== tweetId));
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTweets(page + 1, true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg relative overflow-hidden">
            <MessageSquare className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
        </div>
        <Button onClick={() => setShowTweetModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      {/* Tweets List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : tweets.length > 0 ? (
        <div className="space-y-4 max-w-2xl">
          <AnimatePresence mode="popLayout">
            {tweets.map(tweet => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="ghost" onClick={handleLoadMore} isLoading={loadingMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-4">Be the first to share something with the community!</p>
          <Button onClick={() => setShowTweetModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Post
          </Button>
        </div>
      )}

      {/* Tweet Modal */}
      <TweetModal
        isOpen={showTweetModal}
        onClose={() => setShowTweetModal(false)}
        onSuccess={() => fetchTweets(1)}
      />
    </div>
  );
};

export default Community;
