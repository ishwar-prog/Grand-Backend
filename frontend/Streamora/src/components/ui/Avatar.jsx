import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getAvatarUrl, getInitials } from '../../utils/formatters';

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-xl",
  "2xl": "w-32 h-32 text-2xl"
};

const Avatar = ({ 
  src, 
  alt, 
  size = "md", 
  className, 
  ...props 
}) => {
  const [error, setError] = useState(false);
  const initials = getInitials(alt);

  return (
    <div 
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-[#27272a]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {!error && src ? (
        <img
          src={getAvatarUrl(src)}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#27272a] text-gray-400 font-medium">
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User className="h-[50%] w-[50%]" />
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
