'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { Lock, Loader2, Save, Rocket, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Konfirmasi password tidak cocok', 'error');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            showToast(error.message, 'error');
        } else {
            setSuccess(true);
            showToast('Password berhasil diperbarui!', 'success');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center mx-auto">
                        <ShieldCheck size={40} className="text-gold-accent" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Security Updated</h2>
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-relaxed">
                        Sandi Anda telah berhasil diperbarui. Mengarahkan kembali ke Portal Login...
                    </p>
                    <div className="pt-4 flex justify-center">
                        <Loader2 className="text-gold-accent animate-spin" size={24} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-gold-accent/5 rounded-full blur-[100px]" />

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white-border/10 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="space-y-2 mb-10">
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Update <span className="text-gold-accent">Identity</span></h1>
                        <p className="text-foreground/30 text-[9px] font-bold uppercase tracking-[0.3em]">Create your new Security Key</p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">New Password</label>
                            <div className="relative group">
                                <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white-border/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/10"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">Confirm Security Key</label>
                            <div className="relative group">
                                <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white-border/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/10"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-tr from-gold-accent to-yellow-600 text-background font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gold-accent/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <span>Reset Security Key</span>
                                    <Save size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
