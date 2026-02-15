'use client';

import React from 'react';

interface FileExplorerProps {
    files: string[];
    selectedFile: string;
    onSelectFile: (file: string) => void;
    onCreateFile: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
    files,
    selectedFile,
    onSelectFile,
    onCreateFile
}) => {
    return (
        <div className="w-48 bg-[#18181b] border-r border-white-border flex flex-col">
            <div className="p-3 border-b border-white-border/50 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Files</h4>
                <button
                    onClick={onCreateFile}
                    className="text-teal-accent hover:rotate-90 transition-transform p-1"
                    title="Tambah File Baru"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
                {files.map((file) => (
                    <button
                        key={file}
                        onClick={() => onSelectFile(file)}
                        className={`
                            w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all truncate
                            ${selectedFile === file
                                ? 'bg-teal-accent/10 text-teal-accent'
                                : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                            }
                        `}
                    >
                        {file}
                    </button>
                ))}
            </div>
        </div>
    );
};
