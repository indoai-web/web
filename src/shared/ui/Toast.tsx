'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        setConfirmModal(options);
    }, []);

    const handleConfirm = () => {
        if (confirmModal) {
            confirmModal.onConfirm();
            setConfirmModal(null);
        }
    };

    const handleCancel = () => {
        if (confirmModal) {
            confirmModal.onCancel?.();
            setConfirmModal(null);
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Toasts Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto min-w-[300px] px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-aurora
                            ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                toast.type === 'success' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
                                    'bg-gold-accent/10 border-gold-accent/20 text-gold-accent'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-500' : 'bg-gold-accent'}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-card/60 border border-white-border rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.variant === 'destructive' ? 'bg-red-500/10 border border-red-500/20' : 'bg-gold-accent/10 border border-gold-accent/20'}`}>
                                <div className={`w-3 h-3 rounded-full ${confirmModal.variant === 'destructive' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gold-accent shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`} />
                            </div>
                            <h3 className={`text-lg font-black uppercase tracking-tight italic ${confirmModal.variant === 'destructive' ? 'text-red-400' : ''}`}>{confirmModal.title}</h3>
                            <p className="text-sm text-foreground/60 font-medium leading-relaxed whitespace-pre-wrap">{confirmModal.message}</p>

                            <div className="flex w-full gap-3 mt-4">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white-border text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                                >
                                    {confirmModal.cancelText || 'Batal'}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`
                                        flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                                        ${confirmModal.variant === 'destructive'
                                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                                            : 'bg-gold-accent text-background hover:bg-yellow-accent shadow-gold-accent/20'}
                                    `}
                                >
                                    {confirmModal.confirmText || 'Ya, Lanjutkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
