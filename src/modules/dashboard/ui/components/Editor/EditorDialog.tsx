'use client';

import React from 'react';

interface EditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    header: React.ReactNode;
    footer?: React.ReactNode;
}

export const EditorDialog: React.FC<EditorDialogProps> = ({
    isOpen,
    onClose,
    children,
    header,
    footer
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-card/40 border border-white-border rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(45,212,191,0.1)] animate-in zoom-in-95 duration-500">
                {header}
                <div className="flex-1 flex overflow-hidden">
                    {children}
                </div>
                {footer}
            </div>
        </div>
    );
};
