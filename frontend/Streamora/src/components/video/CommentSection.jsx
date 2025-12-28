import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Pencil, Trash2, X, Check } from 'lucide-react';
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
    updateComment,
    deleteComment,
    toggleLike,
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
            onToggleLike={() => toggleLike(comment._id)}
            onUpdate={(content) => updateComment(comment._id, content)}
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

const CommentItem = ({ comment, currentUser, onDelete, onToggleLike, onUpdate }) => {
  const isOwner = currentUser?._id === comment.owner?._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }
    
    setIsSaving(true);
    try {
      await onUpdate(editContent);
      setIsEditing(false);
    } catch {
      // Keep editing mode on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

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

        {isEditing ? (
          <div className="flex flex-col gap-2 mt-1">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-transparent border-b border-[#27272a] rounded-none px-0 focus:ring-0 focus:border-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-200 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-4 mt-1">
          <button 
            onClick={onToggleLike}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.isLiked 
                ? "text-purple-400 hover:text-purple-300" 
                : "text-gray-400 hover:text-white"
            )}
          >
            <ThumbsUp className={cn("w-3.5 h-3.5", comment.isLiked && "fill-current")} />
            <span>{comment.likesCount || 0}</span>
          </button>
          
          {isOwner && !isEditing && (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;

