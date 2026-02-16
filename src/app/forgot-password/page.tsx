'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            showToast(error.message, 'error');
        } else {
            setSubmitted(true);
            showToast('Link reset password telah dikirim ke email Anda', 'success');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-accent/5 rounded-full blur-[120px]" />

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white-border/10 rounded-[2.5rem] p-10 shadow-2xl">
                    <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-gold-accent transition-all mb-8 group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="space-y-2 mb-10">
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Access <span className="text-gold-accent">Recovery</span></h1>
                        <p className="text-foreground/30 text-[9px] font-bold uppercase tracking-[0.3em]">IndoAi Security Protocol</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleResetRequest} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">Registered Email</label>
                                <div className="relative group">
                                    <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white-border/5 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/10"
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-tr from-gold-accent to-yellow-600 text-background font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gold-accent/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <span>Send Recovery Link</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center mx-auto">
                                <Mail size={32} className="text-gold-accent" />
                            </div>
                            <p className="text-xs font-bold text-foreground/60 leading-relaxed uppercase tracking-widest">
                                Check your inbox. We've sent a secure link to <span className="text-white italic">{email}</span>.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-[9px] font-black uppercase tracking-widest text-gold-accent hover:underline"
                            >
                                Didn't receive it? Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
