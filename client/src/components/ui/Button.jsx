import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    className,
    variant = 'default',
    size = 'md',
    isLoading = false,
    children,
    ...props
}, ref) => {

    const variants = {
        default: "bg-blue-600/80 hover:bg-blue-500/90 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30",
        ghost: "hover:bg-white/10 text-white hover:text-blue-200 border border-transparent",
        outline: "border border-white/20 hover:bg-white/10 text-white",
        danger: "bg-red-500/80 hover:bg-red-500/90 text-white border border-red-400/30"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg"
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";

export { Button };
