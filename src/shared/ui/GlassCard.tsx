import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = true }) => {
    return (
        <div className={`
      p-6 rounded-3xl bg-card backdrop-blur-xl border border-white-border 
      ${hoverEffect ? 'hover:border-teal-accent/30 transition-all duration-300' : ''} 
      ${className}
    `}>
            {children}
        </div>
    );
};
