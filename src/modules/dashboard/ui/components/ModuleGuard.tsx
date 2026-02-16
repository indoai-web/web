'use client';

import React from 'react';
import { AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

interface ModuleGuardProps {
    moduleName: string;
    isEnabled: boolean;
    children: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ moduleName, isEnabled, children }) => {
    if (isEnabled) return <>{children}</>;

    return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="max-w-md w-full p-10 rounded-[2rem] bg-card border border-white-border/10 border-dashed relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5 text-gold-accent group-hover:scale-110 transition-transform">
                    <ShieldAlert size={120} />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-gold-accent/10 flex items-center justify-center text-gold-accent shadow-xl shadow-gold-accent/5">
                        <Cpu size={32} className="animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight text-foreground uppercase italic underline decoration-gold-accent/30 decoration-4 underline-offset-8">
                            Module <span className="text-gold-accent">Deactivated</span>
                        </h3>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em] mt-4">
                            Sistem / {moduleName.replace('-', ' ')}
                        </p>
                    </div>

                    <p className="text-xs font-bold text-foreground/40 leading-relaxed uppercase tracking-widest bg-white/5 p-4 rounded-xl border border-white/5">
                        Modul ini sedang dinonaktifkan oleh administrator. Silakan aktifkan kembali fitur ini melalui
                        <span className="text-gold-accent ml-1 italic underline">Module Manager</span> untuk melanjutkan.
                    </p>

                    <div className="flex items-center gap-2 text-[9px] font-black text-gold-accent/60 uppercase tracking-tighter italic">
                        <AlertCircle size={10} />
                        Fungsi "Otak" sistem sedang diputus sementara.
                    </div>
                </div>
            </div>
        </div>
    );
};
