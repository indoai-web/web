'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

export default function LoginForm() {
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Login Berhasil!', 'success');
            window.location.href = '/dashboard';
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md p-8 rounded-[2rem] bg-card backdrop-blur-2xl border border-white-border shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-teal-accent">Welcome Back</h2>
                <p className="text-foreground/50 text-sm">Please enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 px-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-background/50 border border-white-border focus:border-teal-accent outline-none transition-all text-foreground placeholder:text-foreground/20"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 px-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-background/50 border border-white-border focus:border-violet-accent outline-none transition-all text-foreground placeholder:text-foreground/20"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-accent to-violet-accent text-white font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>

            <div className="text-center">
                <button className="text-sm text-foreground/40 hover:text-teal-accent transition-colors">
                    Forgot your password?
                </button>
            </div>
        </div>
    );
}
