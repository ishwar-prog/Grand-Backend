import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const sizes = {
  sm: "text-sm font-medium",
  md: "text-base font-medium",
  lg: "text-lg font-medium",
  icon: "",
};

const textSizes = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
  icon: "flex h-10 w-10 items-center justify-center",
};

const variantStyles = {
  ghost: "bg-transparent text-white hover:bg-white/10",
  danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  disabled, 
  children, 
  ...props 
}, ref) => {
  // Check if className contains w-full for proper width handling
  const isFullWidth = className?.includes('w-full');
  const isSimple = variant === 'ghost' || variant === 'danger';
  
  // Simple button (ghost, danger) - no glass wrapper
  if (isSimple) {
    return (
      <div
        className={cn(
          "glass-button-wrap cursor-pointer rounded-full",
          isFullWidth ? "w-full" : "inline-flex",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <button
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(
            "glass-button relative isolate cursor-pointer rounded-full transition-all w-full",
            variantStyles[variant],
            sizes[size]
          )}
          {...props}
        >
          <span
            className={cn(
              "glass-button-text relative flex items-center justify-center gap-2 select-none",
              textSizes[size]
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-full"></div>
      </div>
    );
  }

  // Glass button (primary, secondary)
  return (
    <div
      className={cn(
        "glass-button-wrap cursor-pointer rounded-full",
        isFullWidth ? "w-full" : "inline-flex",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "glass-button relative isolate cursor-pointer rounded-full transition-all w-full",
          sizes[size]
        )}
        {...props}
      >
        <span
          className={cn(
            "glass-button-text elative flex items-center justify-center gap-2 select-none",
            textSizes[size]
          )}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children}
        </span>
      </button>
      <div className="glass-button-shadow rounded-full"></div>
    </div>
  );
});

Button.displayName = "Button";

export default Button;


