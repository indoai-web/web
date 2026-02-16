'use client';

import React, { useState, useEffect } from 'react';
import { MemberLibrary } from '@/modules/dashboard/ui/components/MemberLibrary';
import { AffiliateCenter } from '@/modules/dashboard/ui/components/AffiliateCenter';
import { LogOut, User as UserIcon, LayoutDashboard, Settings, Coins, BookOpen, Edit2, Loader2, Sparkles, Shield } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { PremiumBadge } from '@/shared/ui/PremiumBadge';
import { ProfileEditModal } from '@/modules/profiles/ui/components/ProfileEditModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberPage() {
    const [activeTab, setActiveTab] = useState<'hub' | 'affiliate'>('hub');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [membershipTiers, setMembershipTiers] = useState<any[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }

            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch Tiers Configuration
            const { data: tiersData } = await supabase
                .from('membership_tiers')
                .select('*')
                .order('sort_order', { ascending: true });

            setMembershipTiers(tiersData || []);
        } catch (error: any) {
            console.error('[IndoAi] Member Hub Fetch Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-gold-accent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 animate-pulse">Synchronizing Identity...</p>
                </div>
            </div>
        );
    }

    const normalizeTiers = (raw: any): string[] => {
        if (!raw) return [];
        let result: string[] = [];
        try {
            if (typeof raw === 'string') {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    result = parsed.map(v => typeof v === 'string' && (v.startsWith('[') || v.startsWith('{')) ? normalizeTiers(v) : v).flat();
                } else {
                    result = [raw];
                }
            } else if (Array.isArray(raw)) {
                result = raw.map(v => typeof v === 'string' && (v.startsWith('[') || v.startsWith('{')) ? normalizeTiers(v) : v).flat();
            } else {
                result = [String(raw)];
            }
        } catch {
            result = [String(raw)];
        }
        return Array.from(new Set(result.filter(Boolean)));
    };

    const tiers = normalizeTiers(profile?.membership_tier);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-gold-accent/30 overflow-x-hidden">
            {/* Premium Aurora Background */}
            <div className="fixed top-0 left-1/4 w-1/2 h-1/2 bg-gold-accent/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-aurora" />

            {/* Simple Member Nav */}
            <nav className="border-b border-white-border/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-gold-accent to-yellow-accent rounded-xl flex items-center justify-center shadow-lg shadow-gold-accent/20">
                            <UserIcon size={20} className="text-secondary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tighter uppercase italic text-gold-accent">IndoAi <span className="text-foreground/90">Member Hub</span></h1>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Exclusive Access Area</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-gold-accent transition-all hidden md:block">Back to Site</Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.03] border border-white-border/10 text-foreground/40 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all shadow-lg"
                        >
                            Sign Out <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-4 pb-12 space-y-3">
                {/* Hero Profile Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-white-border/5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield size={12} className="text-gold-accent" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gold-accent/40">Authorized Hub Access</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white/90">Selamat Datang</h3>
                        <p className="text-sm font-bold text-foreground/20 uppercase tracking-[0.2em]">Pilih area Creatif kamu di bawah ini</p>
                    </div>

                    {/* Premium Profile Card in Hero Area with Refined Cyber Effects */}
                    <div className="flex items-center gap-6 p-3 rounded-[9px] bg-white/[0.04] border border-white-border/20 backdrop-blur-2xl shadow-2xl relative group hover:border-gold-accent/40 transition-all min-w-[320px] overflow-hidden">
                        {/* 1. Digital Dust Particles - Increased Density */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-gold-accent/60 rounded-full blur-[1px]"
                                    animate={{
                                        x: [Math.random() * 400, Math.random() * 400],
                                        y: [Math.random() * 150, Math.random() * 150],
                                        opacity: [0, 0.8, 0],
                                        scale: [0.5, 1.2, 0.5]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                        </div>

                        {/* 2. Holographic Scan Beam */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-[4px] bg-gradient-to-r from-transparent via-gold-accent/60 to-transparent z-10 pointer-events-none blur-[2px]"
                            animate={{ left: ['-20%', '120%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        />

                        {/* 3. Intense Electrical Sparks */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            <motion.svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <motion.path
                                    d="M 5 5 L 20 10 L 10 25 L 30 20"
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: [0, 1, 0],
                                        opacity: [0, 1, 0, 1, 0],
                                        x: [0, 5, -3, 2, 0],
                                        y: [0, -3, 4, -2, 0]
                                    }}
                                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
                                />
                                <motion.path
                                    d="M 315 90 L 300 75 L 310 60 L 290 55"
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: [0, 1, 0],
                                        opacity: [0, 1, 0, 1, 0],
                                        x: [0, -4, 3, -1, 0],
                                        y: [0, 5, -2, 3, 0]
                                    }}
                                    transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 4 }}
                                />
                                <motion.path
                                    d="M 150 10 L 160 25 L 145 35"
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: [0, 1, 0],
                                        opacity: [0, 0.8, 0],
                                    }}
                                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 6 }}
                                />
                            </motion.svg>
                        </div>

                        <div className="relative z-30">
                            <div className="w-20 h-20 rounded-[9px] bg-white/[0.05] border border-white-border/20 overflow-hidden flex items-center justify-center transition-all group-hover:border-gold-accent shadow-[0_0_20px_rgba(251,191,36,0.2)] relative">
                                {/* Inner Pulsing Glow for Avatar */}
                                <motion.div
                                    className="absolute inset-0 bg-gold-accent/10 pointer-events-none"
                                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={24} className="text-foreground/20" />
                                )}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-40">
                                <PremiumBadge level={profile?.badge_level || 'member'} />
                            </div>
                        </div>

                        <div className="flex flex-col relative z-30">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white via-gold-accent to-white bg-[length:200%_auto] animate-shine bg-clip-text text-transparent pr-4">
                                    {profile?.full_name || 'Anonymous User'}
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-gold-accent/10 border border-white-border/5 text-foreground/20 hover:text-gold-accent transition-all group h-fit"
                                >
                                    <Edit2 size={12} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            {/* Tiers Access List - Cleaned */}
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                {tiers.length > 0 ? tiers.map((t, i) => {
                                    const cfg = membershipTiers.find(x => x.value === t);
                                    return (
                                        <div
                                            key={i}
                                            className="px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                                            style={{
                                                borderColor: cfg?.color ? `${cfg.color}33` : 'rgba(255,255,255,0.1)',
                                                color: cfg?.color || 'white',
                                                backgroundColor: cfg?.color ? `${cfg.color}11` : 'rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: cfg?.color || 'white' }} />
                                            {cfg?.label || t}
                                        </div>
                                    );
                                }) : (
                                    <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">No Active Access</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 p-1.5 bg-white/[0.02] border border-white-border/5 rounded-[13px] w-fit shadow-xl">
                    <button
                        onClick={() => setActiveTab('hub')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'hub' ? 'bg-gold-accent text-background shadow-lg shadow-gold-accent/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                    >
                        <BookOpen size={14} /> Library Hub
                    </button>
                    <button
                        onClick={() => setActiveTab('affiliate')}
                        className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'affiliate' ? 'bg-[#a3ff12] text-black shadow-lg shadow-[#a3ff12]/20' : 'text-foreground/30 hover:text-foreground/60'}`}
                    >
                        <Coins size={14} /> Affiliate Hub
                    </button>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {activeTab === 'hub' ? <MemberLibrary /> : <AffiliateCenter />}
                </motion.div>
            </main>

            {/* Profile Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <ProfileEditModal
                        profile={profile}
                        onClose={() => setIsEditModalOpen(false)}
                        onRefresh={fetchData}
                    />
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white-border/5 text-center">
                <p className="text-[10px] font-bold text-foreground/10 uppercase tracking-[0.5em]">
                    Copyright 2026 IndoAi Studio - All Rights Reserved
                </p>
            </footer>
        </div>
    );
}
