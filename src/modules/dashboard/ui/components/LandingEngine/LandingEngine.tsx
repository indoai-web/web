'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/shared/ui/GlassCard';

interface LandingPage {
    id: string;
    version_name: string;
    display_name?: string;
    is_active: boolean;
    visitor_count?: number;
    last_visit?: string;
}

interface LandingEngineProps {
    landingPages: LandingPage[];
    syncing: boolean;
    creating: boolean;
    uploading: boolean;
    onSync: () => void;
    onCreate: () => void;
    onUploadClick: () => void;
    onActivate: (version: string) => void;
    onDelete: (version: string) => void;
    onEdit: (version: string) => void;
    onRename: (version: string, newName: string) => void;
    onReorder: (dragIndex: number, dropIndex: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const LandingEngine: React.FC<LandingEngineProps> = ({
    landingPages,
    syncing,
    creating,
    uploading,
    onSync,
    onCreate,
    onUploadClick,
    onActivate,
    onDelete,
    onEdit,
    onRename,
    onReorder,
    fileInputRef
}) => {
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [tempTitle, setTempTitle] = useState('');

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('dragIndex', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndexStr = e.dataTransfer.getData('dragIndex');
        if (!dragIndexStr) return;
        const dragIndex = parseInt(dragIndexStr);
        if (dragIndex === dropIndex) return;
        onReorder(dragIndex, dropIndex);
    };

    return (
        <div className="col-span-12 lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h2 className="text-lg font-black uppercase tracking-tight">Landing Engine</h2>
                    <span className="text-[9px] font-bold text-yellow-accent uppercase tracking-widest opacity-50">Version Controller</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={onUploadClick}
                                disabled={uploading || syncing || creating}
                                className={`
                                    group/btn relative px-3 py-1 rounded-md bg-white/5 border border-white-border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2
                                    ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-teal-accent/40 hover:text-teal-accent'}
                                `}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                {uploading ? 'Uploading...' : 'Upload ZIP'}

                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-[7px] text-foreground/70 normal-case tracking-normal opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50 shadow-2xl backdrop-blur-xl">
                                    <span className="text-teal-accent font-bold uppercase block mb-1">Tips Upload:</span>
                                    Cukup ZIP <span className="text-white font-bold">ISI folder 'dist'</span> saja untuk hasil terbaik.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={onCreate}
                            disabled={creating || syncing || uploading}
                            className="px-3 py-1 rounded-md bg-gold-accent text-background text-[8px] font-black uppercase tracking-widest hover:bg-yellow-accent transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : '+ Create Edition'}
                        </button>
                        <button
                            onClick={onSync}
                            disabled={syncing || creating || uploading}
                            className={`
                                px-3 py-1 rounded-md bg-white/5 border border-white-border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2
                                ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold-accent/40 hover:text-gold-accent'}
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full bg-gold-accent ${syncing ? 'animate-ping' : 'animate-pulse'}`} />
                            {syncing ? 'Sync...' : 'Sync'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {landingPages.map((lp, index) => (
                    <div
                        key={lp.id}
                        draggable
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e: React.DragEvent) => handleDrop(e, index)}
                        className="group"
                    >
                        <GlassCard
                            className={`
                                !p-0 overflow-hidden transition-all duration-700 rounded-2xl cursor-grab active:cursor-grabbing
                                ${lp.is_active ? 'border-gold-accent/40 bg-gold-accent/5 ring-1 ring-gold-accent/20' : 'opacity-60 hover:opacity-100'}
                            `}
                        >
                            <div className="p-4 flex items-center justify-between bg-gradient-to-br from-white/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg
                                        ${lp.is_active ? 'bg-gold-accent text-background border-b-2 border-amber-800 shadow-[0_4px_20px_rgba(245,158,11,0.2)]' : 'bg-foreground/5 text-foreground/20 border border-white-border'}
                                    `}>
                                        {lp.version_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            {editingTitle === lp.version_name ? (
                                                <input
                                                    type="text"
                                                    value={tempTitle}
                                                    onChange={(e) => setTempTitle(e.target.value)}
                                                    onBlur={() => { onRename(lp.version_name, tempTitle); setEditingTitle(null); }}
                                                    onKeyDown={(e) => e.key === 'Enter' && (onRename(lp.version_name, tempTitle), setEditingTitle(null))}
                                                    autoFocus
                                                    className="text-sm font-black uppercase tracking-tight bg-transparent border-b border-teal-accent text-foreground focus:outline-none w-32"
                                                />
                                            ) : (
                                                <span
                                                    className="text-sm font-black uppercase tracking-tight cursor-pointer hover:text-teal-accent transition-colors flex items-center gap-2 group/title"
                                                    onClick={() => { setEditingTitle(lp.version_name); setTempTitle(lp.display_name || `EDITION ${lp.version_name}`); }}
                                                >
                                                    {lp.display_name || `EDITION ${lp.version_name}`}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover/title:opacity-100 transition-opacity text-foreground/20"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                </span>
                                            )}

                                            {!lp.is_active && lp.version_name !== 'v1' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(lp.version_name); }}
                                                    className="p-1.5 rounded-md hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                                                {lp.is_active ? 'LIVE SYSTEM' : 'STABLE VERSION'}
                                            </span>
                                            <div className="flex items-center gap-1.5 pl-3 border-l border-white-border/10">
                                                <div className="w-1 h-1 rounded-full bg-teal-accent/50" />
                                                <span className="text-[8px] font-black text-teal-accent/60 uppercase tracking-tighter">
                                                    {lp.visitor_count || 0} Visitors
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(lp.version_name)}
                                        className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white-border text-foreground/40 hover:border-teal-accent hover:text-teal-accent hover:bg-teal-accent/10 hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all active:scale-95"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onActivate(lp.version_name)}
                                        disabled={lp.is_active}
                                        className={`
                                            px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                            ${lp.is_active
                                                ? 'bg-gold-accent/20 text-gold-accent border border-gold-500/30'
                                                : 'border border-white-border text-foreground/40 hover:border-gold-accent/30 hover:text-gold-accent'
                                            }
                                        `}
                                    >
                                        {lp.is_active ? 'Live' : 'Deploy'}
                                    </button>
                                </div>
                            </div>
                            {lp.is_active && (
                                <div className="h-[2px] w-full bg-gradient-to-r from-gold-accent via-yellow-accent to-gold-accent animate-shimmer" />
                            )}
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
    );
};
