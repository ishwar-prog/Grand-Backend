import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { getAllVideos } from '../services/videoService';
import VideoCard from '../components/ui/VideoCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await getAllVideos({ query });
        setVideos(response.data.docs || []);
      } catch (error) {
        console.error("Failed to search videos", error);
        toast.error("Failed to search videos");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchVideos();
    } else {
      setVideos([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
          <SearchIcon className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Search Results for "{query}"
        </h1>
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
            <SearchIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
          <p className="text-gray-400">Try searching for something else</p>
        </div>
      )}
    </div>
  );
};

export default Search;
