import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlaylistById } from '../services/playlistService';
import { PlaySquare, ListVideo } from 'lucide-react';
import VideoCard from '../components/ui/VideoCard';
import Button from '../components/ui/Button';

const PlaylistView = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await getPlaylistById(playlistId);
        setPlaylist(res.data);
      } catch (err) {
        console.error("Failed to load playlist", err);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading playlist...</div>;
  }

  if (error || !playlist) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Playlist not found</h2>
            <Link to="/playlists">
                <Button variant="secondary">Back to Playlists</Button>
            </Link>
        </div>
    );
  }

  const videos = playlist.videos || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="w-full md:w-80 aspect-video md:aspect-[4/3] bg-[#1c1c1e] rounded-2xl flex items-center justify-center shrink-0 border border-[#27272a]">
                {videos.length > 0 ? (
                    <img src={videos[0].thumbnail} alt={playlist.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                    <ListVideo className="w-16 h-16 text-gray-600" />
                )}
            </div>
            
            <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
                <p className="text-gray-400 mb-6 max-w-2xl">{playlist.description}</p>
                <div className="flex gap-4">
                   <div className="flex flex-col">
                       <span className="text-white font-medium">{playlist.owner?.fullName || "User"}</span>
                        <span className="text-sm text-gray-500">{videos.length} videos • {playlist.isPrivate ? "Private" : "Public"}</span>
                   </div>
                </div>
            </div>
        </div>

        {/* Videos Grid */}
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-6">Videos</h3>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 bg-[#1c1c1e] rounded-3xl border border-[#27272a]">
                    <PlaySquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No videos in this playlist yet</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default PlaylistView;
