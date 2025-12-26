import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getLikedVideos } from '../services/userService';
import VideoCard from '../components/ui/VideoCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import toast from 'react-hot-toast';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await getLikedVideos();
        // The backend might return an array of like objects which contain the video
        // or an array of videos directly. 
        // Assuming standard aggregation: [{ _id, video: { ... } }] or just [{ ...video }]
        // Let's assume the response.data is the array of videos directly for now based on typical patterns
        // If it's like objects, we might need to map them: response.data.map(item => item.video)
        
        // Let's check if the data needs mapping. 
        // Usually liked videos endpoint returns: [{ _id: likeId, video: { ...videoData } }]
        // So we might need to extract the video property.
        
        const likedVideos = response.data.map(item => item.video || item);
        setVideos(likedVideos);
      } catch (error) {
        console.error("Failed to fetch liked videos", error);
        toast.error("Failed to load liked videos");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
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
            <Heart className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No liked videos</h3>
          <p className="text-gray-400">Videos you like will appear here</p>
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
