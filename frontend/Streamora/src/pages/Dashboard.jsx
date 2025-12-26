import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  Heart, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreVertical,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { getChannelStats, getChannelVideos } from '../services/dashboardService';
import { deleteVideo, togglePublishStatus } from '../services/videoService';
import VideoUploadModal from '../components/layout/VideoUploadModal';
import Button from '../components/ui/Button';
import { formatDuration, formatTimeAgo } from '../utils/formatters';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1c1c1e] border border-[#27272a] p-6 rounded-3xl flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      const [statsData, videosData] = await Promise.all([
        getChannelStats(),
        getChannelVideos()
      ]);
      setStats(statsData.data);
      setVideos(videosData.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    
    setDeletingId(videoId);
    try {
      await deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v._id !== videoId));
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      await togglePublishStatus(videoId);
      setVideos(prev => prev.map(v => 
        v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
      ));
      toast.success(`Video ${!currentStatus ? 'published' : 'unpublished'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#1c1c1e] rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-[#1c1c1e] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Channel Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your content and analytics</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Eye} 
          label="Total Views" 
          value={stats?.totalViews?.toLocaleString() || 0} 
          color="bg-blue-500" 
        />
        <StatCard 
          icon={Users} 
          label="Subscribers" 
          value={stats?.totalSubscribers?.toLocaleString() || 0} 
          color="bg-purple-500" 
        />
        <StatCard 
          icon={Heart} 
          label="Total Likes" 
          value={stats?.totalLikes?.toLocaleString() || 0} 
          color="bg-pink-500" 
        />
      </div>

      {/* Videos Table */}
      <div className="bg-[#1c1c1e] border border-[#27272a] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#27272a]">
          <h2 className="text-lg font-bold text-white">Uploaded Videos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#27272a]/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Video</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {videos.map((video) => (
                <tr key={video._id} className="hover:bg-[#27272a]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-medium line-clamp-1">{video.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-1">{video.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleTogglePublish(video._id, video.isPublished)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                        video.isPublished 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {video.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatTimeAgo(video.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(video._id)}
                        disabled={deletingId === video._id}
                        className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#27272a] text-gray-400 hover:text-white rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No videos uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={fetchData}
      />
    </div>
  );
};

export default Dashboard;
