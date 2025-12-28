import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, getUserPlaylists } from '../../services/playlistService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const AddToPlaylistModal = ({ isOpen, onClose, videoId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchPlaylists();
    }
  }, [isOpen, user?._id]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await getUserPlaylists(user._id);
      // Ensure we have an array of playlists
      const playlistData = res?.data || res || [];
      // If we need to know if video is already in playlist, we might need to check each playlist's videos
      // For now, assuming standard playlist object
      setPlaylists(playlistData);
    } catch (error) {
      console.error("Failed to fetch playlists", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      await createPlaylist(newTitle, newDesc);
      toast.success("Playlist created");
      setNewTitle('');
      setNewDesc('');
      fetchPlaylists(); // Refresh list
    } catch (error) {
      toast.error("Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleVideo = async (playlist, isChecked) => {
    try {
      if (isChecked) {
        // Add
        await addVideoToPlaylist(videoId, playlist._id);
        toast.success(`Added to ${playlist.name}`);
      } else {
        // Remove
        await removeVideoFromPlaylist(videoId, playlist._id);
        toast.success(`Removed from ${playlist.name}`);
      }
      // Ideally we should update local state to reflect change if needed
      // But we just show toast for now
    } catch (error) {
      toast.error("Failed to update playlist");
      console.error(error);
    }
  };

  // Helper to check if video is in playlist.
  // Note: Standard playlist object from getUserPlaylists might not have full video list populated
  // If backend getUserPlaylists returns array of playlist objects, and each has 'videos' array of IDs or objects.
  const isVideoInPlaylist = (playlist) => {
    if (!playlist.videos) return false;
    return playlist.videos.some(v => (v._id || v) === videoId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#1c1c1e] rounded-2xl border border-[#27272a] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
          <h2 className="text-lg font-bold text-white">Save to playlist</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center text-gray-500">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="text-center text-gray-500">No playlists found</div>
          ) : (
            playlists.map(playlist => {
               const isInPlaylist = isVideoInPlaylist(playlist);
               return (
                <label key={playlist._id} className="flex items-center gap-3 p-2 hover:bg-[#27272a] rounded-lg cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded checked:bg-purple-500 checked:border-purple-500 transition-colors"
                      defaultChecked={isInPlaylist}
                      onChange={(e) => handleToggleVideo(playlist, e.target.checked)}
                    />
                    <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-gray-200 font-medium group-hover:text-white">{playlist.name}</span>
                  {playlist.isPrivate && <span className="ml-auto text-xs text-gray-500">Private</span>}
                </label>
            )})
          )}
        </div>

        <div className="p-4 border-t border-[#27272a]">
          <form onSubmit={handleCreate} className="space-y-3">
            <input 
              type="text" 
              placeholder="Create new playlist..." 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {newTitle && (
               <div className="flex gap-2">
                   <Button type="submit" disabled={creating} className="w-full">
                     {creating ? 'Creating...' : 'Create'}
                   </Button>
               </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddToPlaylistModal;
