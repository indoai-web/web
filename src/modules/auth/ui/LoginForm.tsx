'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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
            const errorMsg = profileError?.message || 'Profil tidak ditemukan';
            showToast(`Akses Ditolak: ${errorMsg}`, 'error');
            setLoading(false);
            return;
        }

        if (!profile.is_active) {
            await supabase.auth.signOut();
            showToast('Akun Anda dinonaktifkan. Silakan hubungi admin.', 'warning');
            setLoading(false);
            return;
        }

        showToast('Login Berhasil!', 'success');

        // Dynamic Redirection based on Admin's setting
        if (profile.role === 'admin') {
            window.location.href = '/dashboard';
        } else {
            // Member goes to their assigned campaign or default home
            window.location.href = profile.assigned_landing_page ? `/?v=${profile.assigned_landing_page}` : '/';
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md p-8 rounded-[2rem] bg-card backdrop-blur-2xl border border-white-border/30 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-gold-accent uppercase italic">IndoAi <span className="text-foreground/80">Control</span></h2>
                <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em]">Authorized Admin Gateway</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-accent/40 px-1 italic">Member Identifier</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white/[0.02] border border-white-border/10 focus:border-gold-accent outline-none transition-all text-foreground placeholder:text-foreground/10 text-sm font-bold"
                        autoComplete="off"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-accent/40 px-1 italic">Security Key</label>
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white/[0.02] border border-white-border/10 focus:border-gold-accent outline-none transition-all text-foreground placeholder:text-foreground/10 text-sm font-bold"
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-foreground/20 hover:text-gold-accent hover:bg-gold-accent/10 transition-all active:scale-95"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-tr from-gold-accent to-yellow-600 text-background font-black text-xs uppercase tracking-[0.4em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gold-accent/20"
                >
                    {loading ? 'Authenticating...' : 'Enter Dashboard'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => window.location.href = '/forgot-password'}
                        className="text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-gold-accent transition-all italic hover:underline underline-offset-4"
                    >
                        Trouble Accessing? Forgot Password
                    </button>
                </div>
            </form>

            <div className="text-center pt-4 border-t border-white-border/5">
                <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] italic">
                    Restricted Area. Authorized Staff Only.
                </p>
            </div>
        </div>
    );
}
