'use client';

import React from 'react';

interface EditorHeaderProps {
    version: string;
    noCodeMode: boolean;
    onToggleNoCode: () => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    hasUnsavedChanges: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    version,
    noCodeMode,
    onToggleNoCode,
    onSave,
    onCancel,
    saving,
    hasUnsavedChanges
}) => {
    return (
        <div className="p-6 border-b border-white-border flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-accent/10 border border-teal-accent/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-accent"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Content Editor</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-teal-accent uppercase tracking-[0.2em]">Editing Edition {version}</p>
                        <span className="text-foreground/10 px-2">|</span>
                        <button
                            onClick={onToggleNoCode}
                            className={`
                                px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2
                                ${noCodeMode
                                    ? 'bg-[#2dd4bf] text-[#000000] shadow-[0_0_30px_rgba(45,212,191,0.6)]'
                                    : 'bg-[#18181b] border-2 border-white/20 text-[#2dd4bf] hover:bg-white/5'
                                }
                                active:scale-95
                            `}
                        >
                            {noCodeMode && <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                            {noCodeMode ? 'Visual Edit: Active' : 'Visual Edit: Inactive'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl border border-white-border text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={`
                        relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_20px_rgba(250,204,21,0.3)]
                        ${hasUnsavedChanges ? 'shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-pulse border-2 border-white/50' : ''}
                    `}
                >
                    {saving ? 'Menyimpan...' : 'SIMPAN'}
                    {hasUnsavedChanges && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};
