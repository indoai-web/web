import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    shimmer?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverEffect = true,
    shimmer = false
}) => {
    return (
        <div className={`
            relative overflow-hidden
            p-6 rounded-[2rem] bg-card backdrop-blur-3xl border border-white-border 
            ${hoverEffect ? 'hover:border-gold-accent/40 shadow-2xl shadow-gold-accent/5 transition-all duration-500' : ''} 
            ${className}
        `}>
            {shimmer && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
