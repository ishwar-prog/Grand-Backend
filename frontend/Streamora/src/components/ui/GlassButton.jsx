import React from 'react';
import { cn } from '../../lib/utils';

const glassButtonSizes = {
  default: "text-base font-medium",
  sm: "text-sm font-medium",
  lg: "text-lg font-medium",
  icon: "h-10 w-10",
};

const glassButtonTextSizes = {
  default: "px-6 py-3.5",
  sm: "px-4 py-2",
  lg: "px-8 py-4",
  icon: "flex h-10 w-10 items-center justify-center",
};

const GlassButton = React.forwardRef(({ 
  className, 
  children, 
  size = "default", 
  contentClassName,
  disabled,
  isLoading,
  ...props 
}, ref) => {
  return (
    <div
      className={cn(
        "glass-button-wrap cursor-pointer rounded-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        className={cn(
          "glass-button relative isolate cursor-pointer rounded-full transition-all",
          glassButtonSizes[size]
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        <span
          className={cn(
            "glass-button-text relative block select-none tracking-tighter",
            glassButtonTextSizes[size],
            contentClassName
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {children}
            </span>
          ) : children}
        </span>
      </button>
      <div className="glass-button-shadow rounded-full"></div>
    </div>
  );
});

GlassButton.displayName = "GlassButton";

export { GlassButton };
export default GlassButton;
