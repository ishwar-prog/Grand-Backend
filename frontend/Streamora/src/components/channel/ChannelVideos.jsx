import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, MoreVertical, Edit2, Trash2, Eye, EyeOff, X, Play, Image as ImageIcon, Loader2 } from 'lucide-react';
import VideoCard, { VideoCardSkeleton } from '../ui/VideoCard';
import { cn } from '../../utils/cn';
import { updateVideo, deleteVideo, togglePublishStatus } from '../../services/videoService';
import { formatDuration, formatViews, formatTimeAgo, getThumbnailUrl } from '../../utils/formatters';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChannelVideos = ({ videos, loading, hasMore, onFetchMore, isOwner, onVideoUpdate, className }) => {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasMore && !loading) onFetchMore();
  }, [inView, hasMore, loading, onFetchMore]);

  if (!loading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4"><Film className="w-8 h-8 opacity-50" /></div>
        <h3 className="text-lg font-medium text-white">No videos yet</h3>
        <p className="text-sm">This channel hasn't uploaded any videos.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
        {videos.map((video, index) => (
          isOwner ? <OwnerVideoCard key={video._id || index} video={video} onUpdate={onVideoUpdate} /> : <VideoCard key={video._id || index} video={video} />
        ))}
        {loading && [...Array(8)].map((_, i) => <VideoCardSkeleton key={`skeleton-${i}`} />)}
      </div>
      {hasMore && <div ref={ref} className="h-10 w-full" />}
    </div>
  );
};

const OwnerVideoCard = ({ video, onUpdate }) => {
  const [menu, setMenu] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isPublished, setIsPublished] = useState(video.isPublished);
  const [isDeleted, setIsDeleted] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { setIsPublished(video.isPublished); }, [video.isPublished]);

  useEffect(() => {
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDeleteClick = () => {
    setMenu(false);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteVideo(video._id);
      setDeleteModal(false);
      setIsDeleted(true);
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setToggling(true);
      await togglePublishStatus(video._id);
      setIsPublished(prev => !prev);
      setMenu(false);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  // Don't render if deleted
  if (isDeleted) return null;

  return (
    <>
      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: deleting ? 0.5 : 1, scale: deleting ? 0.95 : 1 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="group flex flex-col gap-3 relative" style={{ zIndex: menu || deleteModal ? 50 : 'auto' }}>
        <Link to={`/watch/${video._id}`} className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1c1c1e]">
          <img src={getThumbnailUrl(video.thumbnail)} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-xs font-medium text-white backdrop-blur-sm">{formatDuration(video.duration)}</div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded flex items-center gap-1 text-xs font-medium backdrop-blur-sm" style={{ background: isPublished ? 'rgba(34,197,94,0.8)' : 'rgba(234,179,8,0.8)', color: isPublished ? '#fff' : '#000' }}>
            {isPublished ? <><Eye className="w-3 h-3" />Public</> : <><EyeOff className="w-3 h-3" />Draft</>}
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white" /></div>
          </div>
        </Link>
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Link to={`/watch/${video._id}`}><h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">{video.title}</h3></Link>
            <div className="text-xs text-gray-400 mt-1"><span>{formatViews(video.views)}</span><span> • </span><span>{formatTimeAgo(video.createdAt)}</span></div>
          </div>
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenu(!menu)} className="p-1.5 hover:bg-[#27272a] rounded-full transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
            <AnimatePresence>
              {menu && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-8 w-40 bg-[#1c1c1e] border border-[#27272a] rounded-xl shadow-xl z-50 overflow-hidden">
                  <button onClick={() => { setEditModal(true); setMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#27272a] transition-colors"><Edit2 className="w-4 h-4" />Edit</button>
                  <button onClick={handleTogglePublish} disabled={toggling} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#27272a] transition-colors">
                    {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : isPublished ? <><EyeOff className="w-4 h-4" />Make Draft</> : <><Eye className="w-4 h-4" />Publish</>}
                  </button>
                  <button onClick={handleDeleteClick} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      <EditVideoModal isOpen={editModal} onClose={() => setEditModal(false)} video={video} onSuccess={onUpdate} />
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !deleting && setDeleteModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1c1c1e] border border-[#27272a] rounded-3xl shadow-2xl z-[70] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Video?</h3>
                <p className="text-gray-400 mb-6">This action cannot be undone. The video will be permanently deleted.</p>
                <div className="flex gap-3 w-full">
                  <Button variant="ghost" onClick={() => setDeleteModal(false)} disabled={deleting} className="flex-1">Cancel</Button>
                  <Button onClick={handleConfirmDelete} isLoading={deleting} className="flex-1 !bg-red-500 hover:!bg-red-600">Delete</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const EditVideoModal = ({ isOpen, onClose, video, onSuccess }) => {
  const [form, setForm] = useState({ title: video?.title || '', description: video?.description || '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const thumbRef = useRef(null);

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbnail(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return setError('Title is required');
    try {
      setLoading(true); setError(null);
      await updateVideo(video._id, { title: form.title, description: form.description, thumbnail });
      onSuccess?.(); onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1c1c1e] border border-[#27272a] rounded-3xl shadow-2xl z-[70] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-lg font-bold text-white">Edit Video</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              <div><label className="text-sm text-gray-300">Title</label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" /></div>
              <div><label className="text-sm text-gray-300">Description</label><textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full h-24 rounded-xl border border-[#27272a] bg-[#0f0f10] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Description" /></div>
              <div>
                <label className="text-sm text-gray-300">Thumbnail</label>
                <div onClick={() => thumbRef.current?.click()} className="mt-1 border border-dashed border-[#27272a] rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-[#27272a]/50 transition-colors">
                  {preview || video?.thumbnail ? <img src={preview || getThumbnailUrl(video?.thumbnail)} alt="Thumb" className="w-20 h-12 object-cover rounded" /> : <div className="w-20 h-12 bg-[#27272a] rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-500" /></div>}
                  <div><p className="text-sm text-white">Change thumbnail</p><p className="text-xs text-gray-500">Click to upload</p></div>
                </div>
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                <Button type="submit" isLoading={loading} className="flex-1">Save</Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChannelVideos;
