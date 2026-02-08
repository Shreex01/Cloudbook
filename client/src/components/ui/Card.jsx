import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl text-card-foreground",
                className
            )}
            {...props}
        />
    );
});

Card.displayName = "Card";

export { Card };
