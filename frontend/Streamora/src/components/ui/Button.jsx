import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  primary: "bg-gradient-to-r from-[#00F2FF] via-[#9D50BB] to-[#E100FF] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
  secondary: "bg-[#27272a] text-white hover:bg-[#3f3f46]",
  ghost: "bg-transparent text-gray-300 hover:bg-[#27272a] hover:text-white",
  danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
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
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;
