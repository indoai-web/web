'use client';

import React from 'react';

interface DashboardHeaderProps {
    onExit: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onExit }) => {
    return (
        <header className="flex justify-between items-center border-b border-white-border pb-6">
            <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <span className="h-[2px] w-6 bg-gradient-to-r from-gold-accent to-yellow-accent rounded-full" />
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                        Indo Ai <span className="text-foreground/30 font-light">Studio</span>
                    </h1>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30 pl-8">
                    Command Center
                </p>
            </div>

            <button
                onClick={onExit}
                className="group flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white-border hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
            >
                <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-red-400">Exit System</span>
                <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
                    <div className="w-2 h-2 border-[1.5px] border-red-400 group-hover:border-red-300 rounded-sm" />
                </div>
            </button>
        </header>
    );
};
