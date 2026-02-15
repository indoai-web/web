'use client';

import React from 'react';

interface PreviewAreaProps {
    previewMode: string;
    version: string;
    selectedFile: string;
    refreshCounter: number;
    onRefresh: () => void;
    onOpenNewTab: () => void;
    saving: boolean;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
    previewMode,
    version,
    selectedFile,
    refreshCounter,
    onRefresh,
    onOpenNewTab,
    saving
}) => {
    const src = `${previewMode === 'react'
        ? `/preview?version=${version}`
        : `/api/landing-pages/view/${version}/${selectedFile.endsWith('.html') ? selectedFile : 'index.html'}`
        }&t=${refreshCounter}`;

    return (
        <div className="flex-1 bg-white relative">
            <div className="w-full h-full relative">
                <iframe
                    src={src}
                    className="w-full h-full border-none bg-white"
                    title="Live Preview"
                    key={refreshCounter}
                />
                {saving && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={onRefresh}
                    className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest hover:bg-teal-accent hover:text-background hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all border border-white/10"
                >
                    Refresh ⟳
                </button>
                <button
                    onClick={onOpenNewTab}
                    className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest hover:bg-teal-accent hover:text-background hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all border border-white/10"
                >
                    Open New Tab ↗
                </button>
            </div>
        </div>
    );
};
