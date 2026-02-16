'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { Phone, Mail, Lock, User, Crown, Rocket, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff, Timer, Copy, Check } from 'lucide-react';

export default function JoinPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: ''
    });

    const [referrerId, setReferrerId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!params.slug) return;

            // Check for referral in URL
            const urlParams = new URLSearchParams(window.location.search);
            const affCode = urlParams.get('aff');
            if (affCode) {
                const { data: refData } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('referral_code', affCode)
                    .single();
                if (refData) setReferrerId(refData.id);
            }

            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .eq('slug', params.slug)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                showToast('Link tidak valid atau sudah kadaluarsa', 'error');
                router.push('/');
                return;
            }

            // Check expiry
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                showToast('Link sudah kadaluarsa', 'error');
                router.push('/');
                return;
            }

            setEvent(data);
            if (data.is_countdown_enabled) {
                setTimeLeft(data.countdown_duration_mins * 60);
            }
            setLoading(false);
        };
        fetchEvent();
    }, [params.slug]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showToast('KODE Diskon Copyed!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Gagal menyalin kode', 'error');
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        if (val.startsWith('0')) {
            val = '62' + val.slice(1);
        }
        setFormData({ ...formData, phone: val });
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Gagal membuat akun');

            // 2. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    full_name: formData.full_name,
                    phone_number: formData.phone,
                    membership_tier: event.membership_tier,
                    badge_level: event.badge_level,
                    source_event: event.title,
                    is_active: true,
                    role: 'member'
                }]);

            if (profileError) throw profileError;

            if (authData.user) {
                // Record referral if exists
                if (referrerId && event.is_affiliate_enabled) {
                    await supabase.from('affiliate_referrals').insert([{
                        referrer_id: referrerId,
                        referred_id: authData.user.id,
                        invitation_id: event.id,
                        commission_amount: event.commission_per_sale || 0,
                        status: 'pending'
                    }]);
                }

                showToast('Pendaftaran Berhasil! Mempersiapkan akses kustom Anda...', 'success');
                setSuccess(true);

                // Automatic Login
                await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                // Success Animation & Redirect sequence
                setTimeout(() => {
                    const waUrl = event.wa_group_url || 'https://chat.whatsapp.com/sample';
                    window.open(waUrl, '_blank');

                    const targetLp = event.assigned_landing_page || 'v1';
                    router.push(`/?v=${targetLp}`);
                }, 4000);
            }
        } catch (error: any) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            showToast(`Gagal: ${message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="text-gold-accent animate-spin" size={48} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 rounded-3xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(251,191,36,0.1)] relative">
                        <CheckCircle2 size={48} className="text-gold-accent" />
                        <div className="absolute inset-0 rounded-3xl bg-gold-accent/5 animate-ping" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Active <span className="text-gold-accent">Vip Access</span></h1>
                        <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed">
                            Pendaftaran Berhasil. Selamat Bergabung di Inner Circle.
                        </p>
                    </div>

                    {event?.is_discount_enabled && (
                        <div className="relative group/reward">
                            <div className="absolute -inset-1 bg-green-500/10 blur-xl opacity-30" />
                            <div className="relative p-5 rounded-[2rem] bg-black/20 border-2 border-dashed border-[#a3ff12]/30 backdrop-blur-xl mb-4">
                                <p className="text-[8px] font-black text-[#a3ff12]/60 uppercase tracking-[0.2em] mb-2 italic">Executive Reward Unlocked</p>
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-xl font-black text-[#a3ff12] uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(163,255,18,0.2)]">
                                        {event.discount_code}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(event.discount_code)}
                                        className="p-2.5 rounded-xl bg-[#a3ff12]/10 border border-[#a3ff12]/20 text-[#a3ff12] hover:bg-[#a3ff12] hover:text-black transition-all active:scale-95 group/btn"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} className="group-hover/btn:rotate-12 transition-transform" />}
                                    </button>
                                </div>
                                <p className="text-[7px] font-bold text-[#a3ff12]/30 uppercase tracking-widest mt-2 text-center">Copy code for extra benefits</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.4em]">Connecting to Intelligence Base...</p>
                            <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-accent w-1/2 animate-[loading_3.5s_ease-in-out_infinite]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-gold-accent/30 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-accent/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Branding */}
                <div className="text-center mb-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-accent/10 border border-gold-accent/20 mb-4 animate-bounce duration-[3000ms]">
                        <Crown size={12} className="text-gold-accent" />
                        <span className="text-[10px] font-black text-gold-accent uppercase tracking-[0.2em]">Exclusive Invitation</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {event.title}
                    </h1>
                    <p className="text-foreground/30 text-[10px] font-bold uppercase tracking-[0.4em]">IndoAi Executive Onboarding</p>

                    {event?.is_countdown_enabled && timeLeft !== null && (
                        <div className="pt-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                            <div className="inline-flex flex-col items-center">
                                <span className="text-[8px] font-black text-gold-accent/40 uppercase tracking-[0.5em] mb-2 mb-2">Access will expire in:</span>
                                <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-gold-accent/5 border border-gold-accent/20 shadow-[0_0_30px_rgba(251,191,36,0.05)]">
                                    <Timer size={14} className="text-gold-accent animate-pulse" />
                                    <span className="text-xl font-black text-gold-accent tabular-nums tracking-wider drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-[#0A0A0B]/60 backdrop-blur-3xl border-2 border-gold-accent/50 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(251,191,36,0.25)] relative group transition-all duration-700">
                    {/* Decorative Outer Aura */}
                    <div className="absolute -inset-2 rounded-[3.2rem] bg-gold-accent/10 blur-3xl -z-10 opacity-50 animate-pulse" />

                    {event?.is_discount_enabled && (
                        <div className="relative group/reward mb-8">
                            <div className="absolute -inset-1 bg-green-500/20 blur-xl opacity-50 transition-all" />
                            <div className="relative p-6 rounded-[2rem] bg-black/40 border-2 border-dashed border-[#a3ff12]/40 backdrop-blur-xl">
                                <p className="text-[9px] font-black text-[#a3ff12]/60 uppercase tracking-[0.2em] mb-3 italic">Exclusive Reward Unlocked</p>
                                <div className="flex items-center justify-between gap-4">
                                    <h2 className="text-2xl font-black text-[#a3ff12] uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(163,255,18,0.3)]">
                                        {event.discount_code}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(event.discount_code)}
                                        className="p-3 rounded-xl bg-[#a3ff12]/10 border border-[#a3ff12]/20 text-[#a3ff12] hover:bg-[#a3ff12] hover:text-black transition-all active:scale-95 group/btn"
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                                    </button>
                                </div>
                                <p className="text-[8px] font-bold text-[#a3ff12]/40 uppercase tracking-widest mt-3 text-center">Copy code for exclusive member benefits</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleJoin} className="space-y-4" autoComplete="off">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">Full Identity</label>
                            <div className="relative group">
                                <User size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-gold-accent/60 focus:outline-none transition-all text-white shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">Email Access</label>
                            <div className="relative group">
                                <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white-border/5 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold focus:border-gold-accent/40 focus:outline-none transition-all text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">WhatsApp Connect</label>
                            <div className="relative group">
                                <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:border-gold-accent/60 focus:outline-none transition-all text-white shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gold-accent/40 ml-1 italic">Security Key</label>
                            <div className="relative group">
                                <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white-border/5 rounded-2xl pl-12 pr-14 py-3 text-xs font-bold focus:border-gold-accent/40 focus:outline-none transition-all text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-foreground/20 hover:text-gold-accent hover:bg-gold-accent/10 transition-all active:scale-95"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-tr from-gold-accent to-yellow-600 text-background font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(251,191,36,0.2)]"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Activate My VIP Access</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[9px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
                    Restricted Registration. By Invitation Only.
                </p>
            </div>
        </div>
    );
}
