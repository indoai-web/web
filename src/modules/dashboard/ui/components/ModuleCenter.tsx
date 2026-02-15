'use client';

import React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard';

interface Module {
    module_name: string;
    is_enabled: boolean;
}

interface ModuleCenterProps {
    modules: Module[];
    onToggle: (name: string, currentStatus: boolean) => void;
}

export const ModuleCenter: React.FC<ModuleCenterProps> = ({ modules, onToggle }) => {
    return (
        <div className="col-span-12 lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h2 className="text-lg font-black uppercase tracking-tight">Modules</h2>
                    <span className="text-[9px] font-bold text-gold-accent uppercase tracking-widest opacity-50">Active Services</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map(mod => (
                    <GlassCard key={mod.module_name} shimmer className="!p-4 bg-card/30 rounded-2xl">
                        <div className="flex items-center justify-between w-full h-full">
                            <div className="space-y-0 text-left">
                                <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Package</span>
                                <h3 className="font-bold capitalize text-sm tracking-tight">
                                    {mod.module_name.replace('-', ' ')}
                                </h3>
                            </div>
                            <button
                                onClick={() => onToggle(mod.module_name, mod.is_enabled)}
                                className={`
                                    relative w-10 h-5 rounded-full transition-all duration-500 overflow-hidden
                                    ${mod.is_enabled ? 'bg-gold-accent/20 border-gold-500/30' : 'bg-white/5 border-white-border'}
                                    border-[1px]
                                `}
                            >
                                <div className={`
                                    absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-500
                                    ${mod.is_enabled ? 'left-[calc(100%-0.9rem)] bg-gold-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'left-1 bg-foreground/20'}
                                `} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
