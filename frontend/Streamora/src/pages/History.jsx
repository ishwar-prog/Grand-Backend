import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { getWatchHistory, clearWatchHistory as clearHistoryApi } from '../services/userService';
import VideoCard from '../components/ui/VideoCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getWatchHistory();
        setVideos(response.data);
      } catch (error) {
        console.error("Failed to fetch history", error);
        toast.error("Failed to load watch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const clearHistory = async () => {
    try {
      await clearHistoryApi();
      setVideos([]);
      toast.success("Watch history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden">
            <HistoryIcon className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Watch History</h1>
        </div>
        {videos.length > 0 && (
          <Button variant="ghost" onClick={clearHistory} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
            <HistoryIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No watch history</h3>
          <p className="text-gray-400">Videos you watch will appear here</p>
        </div>
      )}
    </div>
  );
};

export default History;
