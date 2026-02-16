'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Crown, Star, Sparkles, Rocket } from 'lucide-react';

interface PremiumBadgeProps {
    level: string;
    className?: string;
}

const floatVariants: Variants = {
    animate: {
        y: [0, -3, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ level, className = '' }) => {
    const l = level?.toLowerCase();

    if (l === 'sultan') {
        return (
            <motion.div
                className={`relative group inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-gold-accent/60 bg-black/40 text-gold-accent shadow-[0_0_20px_rgba(251,191,36,0.5),inset_0_0_10px_rgba(251,191,36,0.2)] overflow-hidden ${className}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(251,191,36,0.8)" }}
            >
                <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent, #fbbf24, transparent, #fbbf24, transparent)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px] z-0"
                    animate={{
                        x: [10, 40, 10, -20, 10],
                        y: [-5, 10, 25, 10, -5],
                        opacity: [0.2, 0.8, 0.2]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <Crown size={12} className="mr-1.5 text-gold-accent drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] relative z-10" />
                <span className="relative z-10 drop-shadow-md text-gold-accent font-black tracking-widest">Sultan</span>

                <motion.div
                    className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[45deg] pointer-events-none"
                    animate={{ x: ['150%', '-150%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                />
                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none z-30" />
            </motion.div>
        );
    }

    if (l === 'elite') {
        return (
            <motion.div
                className={`relative inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border border-amber-500/40 bg-amber-500/10 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${className}`}
            >
                <div className="absolute -top-1 -right-1">
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Star size={8} fill="currentColor" />
                    </motion.div>
                </div>
                <div className="absolute -bottom-1 -left-1">
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                    >
                        <Star size={6} fill="currentColor" />
                    </motion.div>
                </div>
                <Sparkles size={10} className="mr-1 text-amber-400" />
                <span>Elite</span>
            </motion.div>
        );
    }

    if (l === 'pro') {
        return (
            <motion.div
                variants={floatVariants}
                animate="animate"
                className={`relative inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border border-red-500/50 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] ${className}`}
            >
                <motion.div
                    className="absolute inset-0 rounded-full border border-red-500/0"
                    animate={{ borderColor: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <Rocket size={10} className="mr-1" />
                <span>Pro</span>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border border-[#a3ff12]/30 bg-[#a3ff12]/10 text-[#a3ff12] shadow-[0_0_10px_rgba(163,255,18,0.1)] ${className}`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            <div className="w-1 h-1 rounded-full bg-[#a3ff12] mr-1.5 shadow-[0_0_5px_#a3ff12]" />
            <span>Member</span>
        </motion.div>
    );
};
