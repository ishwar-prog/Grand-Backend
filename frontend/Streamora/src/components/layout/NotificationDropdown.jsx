import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUserNotifications, markNotificationRead } from '../../services/notificationService';
import { getAvatarUrl, formatTimeAgo } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getUserNotifications();
      if (res?.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh interval (optional, as user requested "refresh page" behavior, 
    // but fetching on mount handles page refresh. 
    // We can also fetch when dropdown opens)
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(); // Refresh on open
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationRead(notification._id);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  const getNotificationText = (notification) => {
    const { type, video, comment } = notification;
    switch (type) {
      case 'LIKE':
        return comment ? `liked your comment on "${video?.title}"` : `liked your video "${video?.title}"`;
      case 'COMMENT':
        return `commented on your video "${video?.title}"`;
      case 'SUBSCRIBE':
        return `subscribed to your channel`;
      default:
        return 'interacted with you';
    }
  };

  const getLink = (notification) => {
    if (notification.type === 'SUBSCRIBE') return `/channel/${notification.sender.username}`;
    if (notification.video?._id) return `/watch/${notification.video._id}`;
    return '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 rounded-full hover:bg-[#27272a] text-white transition-colors"
        onClick={handleToggle}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1c1c1e] border border-[#27272a] rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-[#27272a]">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={cn(
                    "p-3 hover:bg-[#27272a] transition-colors border-b border-[#27272a]/50 last:border-0",
                    !notification.isRead && "bg-purple-900/10"
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <Link to={getLink(notification)} className="flex gap-3 items-start">
                    <img 
                      src={getAvatarUrl(notification.sender.avatar)} 
                      alt={notification.sender.username}
                      className="w-10 h-10 rounded-full object-cover bg-[#27272a]" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200">
                        <span className="font-semibold text-white">
                          {notification.sender.username}
                        </span>
                        {' '}
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                    )}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
