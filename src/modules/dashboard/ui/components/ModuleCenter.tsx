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
    compact?: boolean;
}

export const ModuleCenter: React.FC<ModuleCenterProps> = ({ modules, onToggle, compact }) => {
    return (
        <div className={compact ? "space-y-4" : "col-span-12 lg:col-span-7 space-y-4"}>
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/40">Active Modules</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules
                    .filter(mod => mod.module_name !== 'auth')
                    .map(mod => (
                        <div
                            key={mod.module_name}
                            className={`p-3 rounded-xl border border-white-border/10 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.05] transition-all ${mod.is_enabled ? 'border-gold-accent/20' : ''}`}
                        >
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest leading-none mb-1">Module</span>
                                <h3 className="font-bold capitalize text-xs tracking-tight text-foreground/80 group-hover:text-gold-accent transition-colors">
                                    {mod.module_name.replace('-', ' ')}
                                </h3>
                            </div>
                            <button
                                onClick={() => onToggle(mod.module_name, mod.is_enabled)}
                                className={`
                                    relative w-8 h-4 rounded-full transition-all duration-300 overflow-hidden
                                    ${mod.is_enabled ? 'bg-gold-accent/20' : 'bg-white/5'}
                                    border border-white-border/20
                                `}
                            >
                                <div className={`
                                    absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all duration-300
                                    ${mod.is_enabled ? 'left-[calc(100%-0.75rem)] bg-gold-accent shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'left-0.5 bg-foreground/10'}
                                `} />
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};
