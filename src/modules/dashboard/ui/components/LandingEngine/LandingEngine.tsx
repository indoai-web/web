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

import { MoreVertical, Edit3, Trash2, Rocket, Play, Activity } from 'lucide-react';

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
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40">Version Control</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onUploadClick}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white-border text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <Rocket size={14} className="text-gold-accent" />
                        {uploading ? 'Uploading...' : 'Upload ZIP'}
                    </button>
                    <button
                        onClick={onCreate}
                        disabled={creating}
                        className="px-4 py-2 rounded-xl bg-gold-accent text-background text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                    >
                        <Play size={14} fill="currentColor" />
                        New Edition
                    </button>
                    <button
                        onClick={onSync}
                        disabled={syncing}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white-border text-[10px] font-bold uppercase tracking-widest hover:text-gold-accent transition-all flex items-center gap-2"
                    >
                        <div className={`w-2 h-2 rounded-full bg-gold-accent ${syncing ? 'animate-ping' : 'animate-pulse'}`} />
                        {syncing ? 'Syncing...' : 'Sync Disk'}
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white-border bg-card/10 backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white-border bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 w-16 text-center">ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Display Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 w-32 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 w-32 text-center">Stats</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 w-40 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white-border/5">
                        {landingPages.map((lp, index) => (
                            <tr
                                key={lp.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`group hover:bg-white/[0.03] transition-colors cursor-move ${lp.is_active ? 'bg-gold-accent/[0.03]' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${lp.is_active ? 'bg-gold-accent text-background' : 'bg-white/5 text-foreground/20 border border-white-border/10'}`}>
                                        {lp.version_name.toUpperCase()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingTitle === lp.version_name ? (
                                        <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            onBlur={() => { onRename(lp.version_name, tempTitle); setEditingTitle(null); }}
                                            onKeyDown={(e) => e.key === 'Enter' && (onRename(lp.version_name, tempTitle), setEditingTitle(null))}
                                            autoFocus
                                            className="bg-transparent border-b border-gold-accent text-sm font-bold text-foreground focus:outline-none py-1 w-full max-w-[200px]"
                                        />
                                    ) : (
                                        <div
                                            className="flex items-center gap-2 group/title cursor-text"
                                            onClick={() => { setEditingTitle(lp.version_name); setTempTitle(lp.display_name || `Edition ${lp.version_name}`); }}
                                        >
                                            <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover/title:text-gold-accent transition-colors">
                                                {lp.display_name || `Edition ${lp.version_name}`}
                                            </span>
                                            <Edit3 size={10} className="opacity-0 group-hover/title:opacity-100 transition-opacity text-foreground/20" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {lp.is_active ? (
                                        <span className="px-2 py-0.5 rounded-full bg-gold-accent/10 text-gold-accent text-[9px] font-black uppercase tracking-widest border border-gold-accent/20">
                                            Live
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-foreground/40 text-[9px] font-black uppercase tracking-widest border border-white-border/10">
                                            Stable
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-gold-accent/60">
                                        <Activity size={10} />
                                        <span className="text-[10px] font-bold tracking-tighter">{lp.visitor_count || 0} hits</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(lp.version_name)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-gold-accent/10 text-foreground/40 hover:text-gold-accent transition-all"
                                            title="Edit Content"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => onActivate(lp.version_name)}
                                            disabled={lp.is_active}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-gold-accent/10 text-foreground/40 hover:text-gold-accent transition-all disabled:opacity-0 disabled:pointer-events-none"
                                            title="Activate Edition"
                                        >
                                            <Rocket size={14} />
                                        </button>
                                        {!lp.is_active && lp.version_name !== 'v1' && (
                                            <button
                                                onClick={() => onDelete(lp.version_name)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-400/10 text-foreground/40 hover:text-red-400 transition-all"
                                                title="Delete Version"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button className="p-2 text-foreground/10 hover:text-foreground/40 transition-colors">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
