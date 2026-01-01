import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { publishVideo } from '../../services/videoService';
import { getErrorMessage, isCancelledError } from '../../services/api';
import { cn } from '../../utils/cn';

const VideoUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Details
  const [files, setFiles] = useState({ video: null, thumbnail: null });
  const [previews, setPreviews] = useState({ video: null, thumbnail: null });
  const [details, setDetails] = useState({ title: '', description: '' });
  const [publishMode, setPublishMode] = useState('public'); // 'public' | 'draft'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState(''); // 'uploading' | 'processing' | ''

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const previewsRef = useRef(previews);

  // Keep ref in sync with state for cleanup
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewsRef.current.video) URL.revokeObjectURL(previewsRef.current.video);
      if (previewsRef.current.thumbnail) URL.revokeObjectURL(previewsRef.current.thumbnail);
    };
  }, []);

  const handleFileSelect = useCallback((e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
      // Validate video file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video file too large (max 100MB)');
        return;
      }
      // Revoke old URL before creating new one
      if (previews.video) URL.revokeObjectURL(previews.video);
      setFiles(prev => ({ ...prev, video: file }));
      setPreviews(prev => ({ ...prev, video: URL.createObjectURL(file) }));
      setStep(2);
    } else {
      // Validate image file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Thumbnail too large (max 5MB)');
        return;
      }
      // Revoke old URL before creating new one
      if (previews.thumbnail) URL.revokeObjectURL(previews.thumbnail);
      setFiles(prev => ({ ...prev, thumbnail: file }));
      setPreviews(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
    }
    setError(null);
  }, [previews.video, previews.thumbnail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.video || !files.thumbnail || !details.title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Create new AbortController for this upload
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      setUploadPhase('uploading');

      await publishVideo({
        title: details.title.trim(),
        description: details.description.trim(),
        videoFile: files.video,
        thumbnail: files.thumbnail,
        isPublished: publishMode === 'public',
        onUploadProgress: (progress) => {
          setUploadProgress(progress);
          // When upload reaches 100%, switch to processing phase
          if (progress >= 100) {
            setUploadPhase('processing');
          }
        },
        signal: abortControllerRef.current.signal,
      });

      setUploadProgress(100);
      setUploadPhase('');
      
      // Success - notify parent and close
      onSuccess?.();
      handleClose();
    } catch (err) {
      // Don't show error if user cancelled
      if (isCancelledError(err)) {
        setError('Upload cancelled');
      } else {
        setError(getErrorMessage(err));
      }
      setUploadProgress(0);
      setUploadPhase('');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = useCallback(() => {
    // Abort ongoing upload if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    // Abort ongoing upload
    handleCancel();
    
    // Cleanup object URLs
    if (previews.video) URL.revokeObjectURL(previews.video);
    if (previews.thumbnail) URL.revokeObjectURL(previews.thumbnail);
    
    // Reset state
    setStep(1);
    setFiles({ video: null, thumbnail: null });
    setPreviews({ video: null, thumbnail: null });
    setDetails({ title: '', description: '' });
    setPublishMode('public');
    setError(null);
    setUploadProgress(0);
    setUploadPhase('');
    setLoading(false);
    onClose();
  }, [previews.video, previews.thumbnail, handleCancel, onClose]);

  const getUploadButtonText = () => {
    if (!loading) {
      return publishMode === 'draft' ? 'Save as Draft' : 'Publish Video';
    }
    if (uploadPhase === 'processing') {
      return 'Processing...';
    }
    return `Uploading ${uploadProgress}%`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#1c1c1e] border border-[#27272a] rounded-3xl shadow-2xl z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-xl font-bold text-white">Upload Video</h2>
              <button onClick={handleClose} className="p-2 hover:bg-[#27272a] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500 hover:bg-[#27272a]/50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#27272a] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white">Select video to upload</p>
                    <p className="text-sm text-gray-500 mt-1">Or drag and drop a file</p>
                  </div>
                  <input 
                    ref={videoInputRef}
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={(e) => handleFileSelect(e, 'video')}
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-6">
                    {/* Left: Previews */}
                    <div className="w-1/3 space-y-4">
                      <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative group">
                        <video 
                          src={previews.video} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            type="button"
                            size="sm" 
                            variant="secondary"
                            onClick={() => setStep(1)}
                          >
                            Change Video
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Form */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Title</label>
                        <Input
                          value={details.title}
                          onChange={(e) => setDetails(d => ({ ...d, title: e.target.value }))}
                          placeholder="Video title"
                          maxLength={100}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <textarea
                          value={details.description}
                          onChange={(e) => setDetails(d => ({ ...d, description: e.target.value }))}
                          placeholder="Tell viewers about your video"
                          className="w-full h-32 rounded-xl border border-[#27272a] bg-[#0f0f10] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Visibility</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setPublishMode('public')} className={cn("flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all text-sm font-medium", publishMode === 'public' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-[#27272a] text-gray-400 hover:bg-[#27272a]')}>
                            <Eye className="w-4 h-4" />Public
                          </button>
                          <button type="button" onClick={() => setPublishMode('draft')} className={cn("flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all text-sm font-medium", publishMode === 'draft' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-[#27272a] text-gray-400 hover:bg-[#27272a]')}>
                            <EyeOff className="w-4 h-4" />Draft
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Thumbnail</label>
                        <div 
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="border border-dashed border-[#27272a] rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#27272a]/50 transition-colors"
                        >
                          {previews.thumbnail ? (
                            <img 
                              src={previews.thumbnail} 
                              alt="Thumbnail" 
                              className="w-16 h-9 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-9 bg-[#27272a] rounded flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-white">Upload thumbnail</p>
                            <p className="text-xs text-gray-500">1280x720 recommended</p>
                          </div>
                        </div>
                        <input 
                          ref={thumbnailInputRef}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileSelect(e, 'thumbnail')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
                    <Button type="button" variant="ghost" onClick={loading ? handleCancel : handleClose}>
                      {loading ? 'Cancel Upload' : 'Cancel'}
                    </Button>
                    <Button type="submit" isLoading={loading} disabled={!details.title.trim() || !files.thumbnail}>
                      {getUploadButtonText()}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VideoUploadModal;
