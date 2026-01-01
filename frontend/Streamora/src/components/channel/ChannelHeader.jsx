import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import SubscribeButton from './SubscribeButton';
import { getAvatarUrl, formatSubscribers, formatVideoCount } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { updateAvatar, updateCoverImage, changePassword, updateAccount } from '../../services/authService';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChannelHeader = ({ 
  channel, 
  isSubscribed, 
  onToggleSubscribe, 
  isOwner,
  onChannelUpdate,
  className 
}) => {
  const [editModal, setEditModal] = useState(false);
  if (!channel) return <ChannelHeaderSkeleton />;

  return (
    <div className={cn("w-full flex flex-col gap-6", className)}>
      {/* Cover Image */}
      <div className="relative w-full aspect-[4/1] min-h-[160px] max-h-[280px] rounded-3xl overflow-hidden bg-[#1c1c1e] group">
        {channel.coverImage ? (
          <img 
            src={channel.coverImage} 
            alt="Channel Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#27272a] to-[#1c1c1e]" />
        )}
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row gap-6 px-4">
        {/* Avatar */}
        <div className="relative -mt-12 md:-mt-16 flex-shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-[#0f0f10]">
            <img 
              src={getAvatarUrl(channel.avatar)} 
              alt={channel.fullName} 
              className="w-full h-full rounded-full object-cover bg-[#1c1c1e]"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {channel.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400 text-sm">
              <span className="font-medium text-gray-300">@{channel.username}</span>
              <span>•</span>
              <span>{formatSubscribers(channel.subscribersCount)}</span>
              <span>•</span>
              <span>{formatVideoCount(channel.videosCount || 0)}</span>
            </div>
            
            {/* Description (Truncated) */}
            {channel.description && (
              <p className="mt-3 text-gray-400 text-sm max-w-2xl line-clamp-2">
                {channel.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isOwner ? (
              <Button
                onClick={() => setEditModal(true)}
                size="sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Customize Channel</span>
              </Button>
            ) : (
              <SubscribeButton 
                isSubscribed={isSubscribed} 
                onToggle={onToggleSubscribe} 
              />
            )}
          </div>
        </div>
      </div>
      {isOwner && <EditChannelModal isOpen={editModal} onClose={() => setEditModal(false)} channel={channel} onSuccess={onChannelUpdate} />}
    </div>
  );
};

const EditChannelModal = ({ isOpen, onClose, channel, onSuccess }) => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [profile, setProfile] = useState({ fullName: channel?.fullName || '', email: channel?.email || '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });
  const avatarRef = useRef(null);
  const coverRef = useRef(null);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true); setError(null);
      const res = type === 'avatar' ? await updateAvatar(file) : await updateCoverImage(file);
      updateUser(res?.data);
      setSuccess(`${type === 'avatar' ? 'Avatar' : 'Cover image'} updated!`);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to update ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile.fullName || !profile.email) return setError('All fields required');
    try {
      setLoading(true); setError(null);
      const res = await updateAccount(profile);
      updateUser(res?.data);
      setSuccess('Profile updated!');
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return setError('Passwords do not match');
    if (passwords.newPassword.length < 6) return setError('Password must be at least 6 characters');
    try {
      setLoading(true); setError(null);
      await changePassword(passwords.oldPassword, passwords.newPassword);
      setSuccess('Password changed!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [{ id: 'profile', label: 'Profile' }, { id: 'images', label: 'Images' }, { id: 'password', label: 'Password' }];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1c1c1e] border border-[#27272a] rounded-3xl shadow-2xl z-[70] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-xl font-bold text-white">Customize Channel</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex border-b border-[#27272a]">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => { setTab(t.id); setError(null); setSuccess(null); }} className={cn("flex-1 py-3 text-sm font-medium transition-colors", tab === t.id ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white')}>{t.label}</button>
              ))}
            </div>
            <div className="p-6">
              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">{success}</div>}
              
              {tab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div><label className="text-sm text-gray-300">Full Name</label><Input value={profile.fullName} onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Full Name" /></div>
                  <div><label className="text-sm text-gray-300">Email</label><Input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="Email" /></div>
                  <Button type="submit" isLoading={loading} className="w-full">Save Changes</Button>
                </form>
              )}
              
              {tab === 'images' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img src={getAvatarUrl(channel?.avatar)} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-[#27272a]" />
                      <button onClick={() => avatarRef.current?.click()} disabled={loading} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
                      </button>
                      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
                    </div>
                    <div><p className="text-white font-medium">Avatar</p><p className="text-xs text-gray-400">Click to change</p></div>
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">Cover Image</p>
                    <div onClick={() => coverRef.current?.click()} className="relative aspect-[4/1] rounded-xl overflow-hidden bg-[#27272a] cursor-pointer group">
                      {channel?.coverImage ? <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#27272a] to-[#1c1c1e]" />}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                  </div>
                </div>
              )}
              
              {tab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {['old', 'new', 'confirm'].map((key) => (
                    <div key={key} className="relative">
                      <label className="text-sm text-gray-300 capitalize">{key === 'old' ? 'Current' : key === 'confirm' ? 'Confirm New' : 'New'} Password</label>
                      <Input type={showPwd[key] ? 'text' : 'password'} value={passwords[`${key}Password`]} onChange={(e) => setPasswords(p => ({ ...p, [`${key}Password`]: e.target.value }))} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))} className="absolute right-3 top-8 text-gray-400 hover:text-white">
                        {showPwd[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                  <Button type="submit" isLoading={loading} className="w-full">Change Password</Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ChannelHeaderSkeleton = () => (
  <div className="w-full flex flex-col gap-6 animate-pulse">
    <div className="w-full aspect-[4/1] rounded-3xl bg-[#1c1c1e]" />
    <div className="flex flex-col md:flex-row gap-6 px-4">
      <div className="relative -mt-12 md:-mt-16 flex-shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0f0f10] p-1">
          <div className="w-full h-full rounded-full bg-[#1c1c1e]" />
        </div>
      </div>
      <div className="flex-1 pt-2 space-y-4">
        <div className="h-8 w-48 bg-[#1c1c1e] rounded-lg" />
        <div className="h-4 w-64 bg-[#1c1c1e] rounded-lg" />
        <div className="h-4 w-full max-w-md bg-[#1c1c1e] rounded-lg" />
      </div>
    </div>
  </div>
);

export default ChannelHeader;
