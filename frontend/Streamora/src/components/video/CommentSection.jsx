import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreVertical, ThumbsUp, Trash2 } from 'lucide-react';
import useComments from '../../hooks/useComments';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import { formatTimeAgo } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const CommentSection = ({ videoId }) => {
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    addComment, 
    deleteComment,
    totalComments 
  } = useComments(videoId);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await addComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-bold text-white">
          {totalComments} Comments
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="flex gap-4">
        <Avatar src={user?.avatar} alt={user?.username} size="md" />
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="bg-transparent border-b border-[#27272a] rounded-none px-0 focus:ring-0 focus:border-white transition-colors"
          />
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setNewComment('')}
              disabled={!newComment}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={!newComment || isSubmitting}
              isLoading={isSubmitting}
            >
              Comment
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <CommentItem 
            key={comment._id} 
            comment={comment} 
            currentUser={user}
            onDelete={() => deleteComment(comment._id)}
          />
        ))}
        
        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, currentUser, onDelete }) => {
  const isOwner = currentUser?._id === comment.owner?._id;

  return (
    <div className="flex gap-4 group">
      <Link to={`/channel/${comment.owner?.username}`}>
        <Avatar src={comment.owner?.avatar} alt={comment.owner?.username} size="md" />
      </Link>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link 
            to={`/channel/${comment.owner?.username}`}
            className="font-medium text-white hover:text-gray-300"
          >
            @{comment.owner?.username}
          </Link>
          <span>{formatTimeAgo(comment.createdAt)}</span>
        </div>

        <p className="text-sm text-gray-200 whitespace-pre-wrap">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-1">
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{comment.likesCount || 0}</span>
          </button>
          
          {isOwner && (
            <button 
              onClick={onDelete}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#27272a] rounded-full transition-all">
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export default CommentSection;
