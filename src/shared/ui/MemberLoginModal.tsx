'use client';

import React, { useState } from 'react';
import { X, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

interface MemberLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            showToast(authError.message, 'error');
            setLoading(false);
            return;
        }

        // Check if user is registered in our closed system
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, assigned_landing_page, is_active')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !profile) {
            await supabase.auth.signOut();
            showToast('Akses Ditolak: Profil Anda tidak ditemukan.', 'error');
            setLoading(false);
            return;
        }

        if (!profile.is_active) {
            await supabase.auth.signOut();
            showToast('Akun Anda dinonaktifkan.', 'warning');
            setLoading(false);
            return;
        }

        showToast('Selamat Datang Kembali!', 'success');

        // Members go to the Hub
        window.location.href = '/member';
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0A0A0B]/90 border border-white-border/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300 backdrop-blur-xl">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 text-foreground/20 hover:text-foreground transition-all"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-gold-accent to-yellow-accent flex items-center justify-center shadow-xl shadow-gold-accent/20">
                        <Shield size={32} className="text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-gold-accent">Member <span className="text-foreground/90">Authentication</span></h2>
                        <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] mt-1">Portal Eksklusif IndoAi Studio</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Registered Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white-border/10 focus:border-gold-accent/50 outline-none transition-all text-sm font-bold"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Access Key</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white-border/10 focus:border-gold-accent/50 outline-none transition-all text-sm font-bold"
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-foreground/10 hover:text-gold-accent transition-all"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-gold-accent/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Pro Hub'}
                    </button>
                </form>

                <p className="text-center mt-8 text-[8px] font-bold text-foreground/10 uppercase tracking-widest">
                    Keamanan Akun Terenkripsi oleh IndoAi Security System
                </p>
            </div>
        </div>
    );
};
