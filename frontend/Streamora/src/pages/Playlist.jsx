import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Plus, Trash2, PlaySquare } from 'lucide-react';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../services/playlistService';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Playlist = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const fetchPlaylists = async () => {
    if (!user?._id) return;
    try {
      const response = await getUserPlaylists(user._id);
      setPlaylists(response.data);
    } catch (error) {
      console.error("Failed to fetch playlists", error);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await createPlaylist(newPlaylistName, newPlaylistDesc);
      toast.success("Playlist created");
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreateModalOpen(false);
      fetchPlaylists();
    } catch (error) {
      toast.error("Failed to create playlist");
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      toast.success("Playlist deleted");
    } catch (error) {
      toast.error("Failed to delete playlist");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
            <ListVideo className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Playlist
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[#1c1c1e] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <motion.div
              key={playlist._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-[#1c1c1e] border border-[#27272a] rounded-3xl overflow-hidden hover:border-orange-500/50 transition-colors"
            >
              <div className="aspect-video bg-[#27272a] flex items-center justify-center relative">
                {/* Placeholder or first video thumbnail would go here */}
                <PlaySquare className="w-12 h-12 text-gray-600" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link to={`/playlists/${playlist._id}`}>
                    <Button variant="secondary" size="sm">View Playlist</Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white line-clamp-1">{playlist.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {playlist.description || "No description"}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {playlist.videos?.length || 0} videos
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeletePlaylist(playlist._id)}
                    className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
            <ListVideo className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No playlists yet</h3>
          <p className="text-gray-400">Create a playlist to organize your videos</p>
        </div>
      )}

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1c1c1e] border border-[#27272a] rounded-3xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Name</label>
                  <Input
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                  <textarea
                    value={newPlaylistDesc}
                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                    placeholder="What's this playlist about?"
                    className="w-full bg-[#0f0f10] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none h-24"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Playlist;
