import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Generic Skeleton Primitive
 * Used to build complex loading states
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#27272a]", className)}
      {...props}
    />
  );
};

/**
 * Standard Card Skeleton
 * Mirrors the structure of a standard content card
 */
const SkeletonCard = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-video rounded-xl" />
      
      {/* Meta */}
      <div className="flex gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
