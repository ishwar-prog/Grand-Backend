import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { getSubscribedChannels } from '../services/subscriptionService';
import { getAvatarUrl } from '../utils/formatters';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await getSubscribedChannels();
        // Assuming response.data is the array of subscription objects
        // Each item usually has a 'channel' or 'subscriber' field depending on the query
        // For 'subscribed', it should be the channel details.
        // Let's assume it returns [{ _id, channel: { ... } }] or similar
        
        const subscribedChannels = response.data.map(item => item.channel || item);
        setChannels(subscribedChannels);
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
        toast.error("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
          <Users className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#1c1c1e] rounded-3xl p-6 flex flex-col items-center gap-4 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-[#27272a]" />
              <div className="h-4 w-32 bg-[#27272a] rounded" />
              <div className="h-3 w-24 bg-[#27272a] rounded" />
            </div>
          ))}
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <motion.div
              key={channel._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1c1c1e] border border-[#27272a] rounded-3xl p-6 flex flex-col items-center gap-4 hover:border-purple-500/50 transition-colors group"
            >
              <Link to={`/channel/${channel.username}`} className="relative">
                <img
                  src={getAvatarUrl(channel.avatar)}
                  alt={channel.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#1c1c1e] group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              <div className="text-center">
                <Link to={`/channel/${channel.username}`}>
                  <h3 className="text-lg font-bold text-white hover:text-purple-400 transition-colors">
                    {channel.fullName}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm">@{channel.username}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {channel.subscribersCount || 0} subscribers
                </p>
              </div>

              <Link to={`/channel/${channel.username}`} className="w-full">
                <Button variant="secondary" className="w-full">
                  View Channel
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1c1c1e] flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No subscriptions</h3>
          <p className="text-gray-400">Channels you subscribe to will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
