'use client';

import React, { useState, useEffect } from 'react';
import {
    Coins, Rocket, Link, Copy, Check, Download,
    TrendingUp, Users, ArrowRight, Shield, Layout,
    ExternalLink, Share2, Play, Landmark, Smartphone, Crown
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { PayoutSettingsModal } from './PayoutSettingsModal';

export const AffiliateCenter: React.FC = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(prof);

            const { data: events } = await supabase
                .from('invitations')
                .select('*')
                .eq('is_affiliate_enabled', true)
                .eq('is_active', true);

            const { data: resOffers } = await supabase
                .from('resources')
                .select('*')
                .eq('is_special_offer', true)
                .gt('commission_per_sale', 0);

            const allCampaigns = [
                ...(events || []).map(e => ({ ...e, _campaignType: 'invitation' })),
                ...(resOffers || []).map(r => ({
                    ...r,
                    _campaignType: 'resource',
                    slug: `res-${r.id}`, // Generate a slug for resource campaign
                }))
            ];

            setActiveEvents(allCampaigns);

            // Handle Deep Linking from Member Library
            const params = new URLSearchParams(window.location.search);
            const campaignSlug = params.get('campaign');

            if (campaignSlug) {
                const target = allCampaigns.find(c => c.slug === campaignSlug || `resource-${c.id}` === campaignSlug);
                if (target) setSelectedEvent(target);
                else if (allCampaigns.length > 0) setSelectedEvent(allCampaigns[0]);
            } else if (allCampaigns.length > 0) {
                setSelectedEvent(allCampaigns[0]);
            }

            const { data: payLogs } = await supabase
                .from('affiliate_payouts')
                .select('*')
                .order('created_at', { ascending: false });
            setPayouts(payLogs || []);

            setLoading(false);
        };
        fetchData();
    }, []);

    const copyLink = (code: string) => {
        if (!selectedEvent) return;
        const url = `${window.location.origin}/r/${selectedEvent.slug}/${code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        showToast('Link Afiliasi berhasil disalin!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-10 h-10 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Memuat Amunisi...</span>
        </div>
    );

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area with Payout Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic">Affiliate <span className="text-[#a3ff12]">Armory</span></h2>
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Portal Komisi & Amunisi Marketing IndoAi</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 rounded-[13px] bg-white/[0.02] border border-white-border/5 flex items-center gap-4 min-w-[280px]">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            {profile?.payout_details?.type === 'ewallet' ? <Smartphone size={20} /> : <Landmark size={20} />}
                        </div>
                        <div className="flex-1">
                            <div className="text-[8px] font-black text-foreground/20 uppercase tracking-widest">Akun Pembayaran</div>
                            <div className="text-[11px] font-bold text-foreground leading-tight truncate">
                                {profile?.payout_details ? (
                                    `${profile.payout_details.provider} - ${profile.payout_details.account_number || profile.payout_details.phone}`
                                ) : (
                                    'Belum Diatur'
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPayoutModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-gold-accent/10 text-gold-accent text-[9px] font-black uppercase hover:bg-gold-accent hover:text-background transition-all"
                        >
                            {profile?.payout_details ? 'Ubah' : 'Atur'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-6 rounded-[13px] bg-card border border-white-border/5 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Coins size={48} />
                    </div>
                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Total Pendapatan</div>
                    <div className="text-2xl font-black text-foreground">Rp 0</div>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-green-500">
                        <TrendingUp size={10} /> +0% dari bulan lalu
                    </div>
                </div>
                <div className="p-6 rounded-[13px] bg-card border border-white-border/5 space-y-2">
                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Referral Berhasil</div>
                    <div className="text-2xl font-black text-foreground">0</div>
                    <div className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest italic">Leads Terkonversi</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-card border border-white-border/5 space-y-2">
                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Tingkat Konversi</div>
                    <div className="text-2xl font-black text-foreground">0%</div>
                    <div className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest italic">Statistik Optimasi</div>
                </div>
                <div className="p-6 rounded-[13px] bg-gold-accent text-background space-y-2 shadow-lg shadow-gold-accent/20">
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Status Afiliasi</div>
                    <div className="text-2xl font-black uppercase italic tracking-tighter">Elite Partner</div>
                    <button className="text-[8px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Tarik Cuan</button>
                </div>
            </div>

            {/* Campaign Selector & Cloaked Link */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[13px] p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-sm font-black text-foreground uppercase italic tracking-widest">Active <span className="text-gold-accent">Campaigns</span></h3>
                            <div className="flex flex-wrap gap-2">
                                {activeEvents.map(ev => (
                                    <button
                                        key={ev.id}
                                        onClick={() => setSelectedEvent(ev)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedEvent?.id === ev.id ? 'bg-gold-accent text-background' : 'bg-white/5 text-foreground/40 hover:text-white'} flex items-center gap-2`}
                                    >
                                        {ev.is_special_offer && <Crown size={10} className="text-[#a3ff12]" />}
                                        {ev.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedEvent && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="p-8 rounded-[13px] bg-white/[0.02] border border-dashed border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gold-accent/10 flex items-center justify-center">
                                                <Shield size={20} className="text-gold-accent" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-foreground uppercase tracking-tight">Link Cloaking Profesional Anda</div>
                                                <div className="text-[8px] font-bold text-foreground/30 uppercase italic">Anti-Scam & Estetika Eksekutif</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase">Komisi: Rp {selectedEvent.commission_per_sale?.toLocaleString()}</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 border border-white-border/10 rounded-2xl px-6 py-4 flex items-center justify-between group/link cursor-pointer hover:border-gold-accent/30 transition-all font-mono text-[11px] text-foreground/60">
                                            <span>{window.location.origin}/r/{selectedEvent.slug}/{profile?.referral_code || 'generate...'}</span>
                                            <Share2 size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        </div>
                                        <button
                                            onClick={() => copyLink(profile?.referral_code)}
                                            className="px-8 rounded-2xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold-accent/10"
                                        >
                                            {copied ? <Check size={18} /> : 'Salin Link'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[13px] bg-white/[0.01] border border-white-border/5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Layout size={16} className="text-blue-400" />
                                            <span className="text-[9px] font-black text-foreground/60 uppercase">
                                                {selectedEvent.is_special_offer ? 'Product Category' : 'Access TAG'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                                {selectedEvent.is_special_offer ? 'EXCLUSIVE PRODUCT' : `TAG: ${selectedEvent.membership_tier?.toUpperCase()}`}
                                            </span>
                                            {selectedEvent.is_special_offer && (
                                                <span className="text-[9px] font-black text-white/40">Rp {selectedEvent.price?.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/[0.01] border border-white-border/5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Coins size={16} className="text-[#a3ff12]" />
                                            <span className="text-[9px] font-black text-foreground/60 uppercase">Market Value / Discount</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[#a3ff12] uppercase tracking-wider">
                                                {selectedEvent.is_special_offer ? `ONLY Rp ${selectedEvent.member_discount?.toLocaleString()}` : (selectedEvent.discount_code || 'VIP_ACCESS')}
                                            </span>
                                            <div className="w-2 h-2 rounded-full bg-[#a3ff12] animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gold-accent/10 to-transparent border border-gold-accent/20 rounded-[13px] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-gold-accent text-background">
                                <Rocket size={20} />
                            </div>
                            <h3 className="text-sm font-black text-foreground uppercase italic tracking-widest">The <span className="text-gold-accent">Armory</span></h3>
                        </div>
                        <p className="text-[9px] font-bold text-foreground/40 leading-relaxed uppercase tracking-widest">Amunisi pemasaran premium untuk membantu Anda mencapai konversi maksimal.</p>

                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <Play size={14} className="text-gold-accent" />
                                    <span className="text-[9px] font-black text-foreground/60 uppercase">High-End Teaser (AI)</span>
                                </div>
                                <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <Layout size={14} className="text-blue-500" />
                                    <span className="text-[9px] font-black text-foreground/60 uppercase">Cyber Banner Pack</span>
                                </div>
                                <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <button className="w-full py-3 rounded-xl border border-white/5 text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] hover:bg-white/5 transition-all">Request Custom Asset</button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[13px] bg-[#a3ff12]/5 border border-[#a3ff12]/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#a3ff12]" />
                            <h4 className="text-[10px] font-black text-[#a3ff12] uppercase tracking-[0.2em]">Strategy Insight</h4>
                        </div>
                        <p className="text-[9px] font-bold text-[#a3ff12]/40 leading-relaxed uppercase tracking-widest italic">&quot;Fokus pada Story WhatsApp &amp; TikTok. Gunakan kata kunci &apos;Agency Masa Depan&apos; untuk konversi 2x lebih cepat.&quot;</p>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[13px] p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-foreground uppercase italic tracking-widest">Riwayat <span className="text-gold-accent">Penarikan</span></h3>
                    <div className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-bold text-foreground/40 uppercase">10 Transaksi Terakhir</div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white-border/5">
                                <th className="text-left py-4 text-[9px] font-black text-foreground/20 uppercase tracking-widest px-4">Tanggal</th>
                                <th className="text-left py-4 text-[9px] font-black text-foreground/20 uppercase tracking-widest px-4">Jumlah</th>
                                <th className="text-left py-4 text-[9px] font-black text-foreground/20 uppercase tracking-widest px-4">Status</th>
                                <th className="text-right py-4 text-[9px] font-black text-foreground/20 uppercase tracking-widest px-4">Bukti Transfer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-[10px] font-bold text-foreground/10 uppercase tracking-widest italic">Belum ada riwayat penarikan komisi.</td>
                                </tr>
                            ) : (
                                payouts.map(item => (
                                    <tr key={item.id} className="border-b border-white-border/5 hover:bg-white/[0.01] transition-all">
                                        <td className="py-4 px-4 text-[10px] font-bold text-foreground/60">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="py-4 px-4 text-[11px] font-black text-foreground">Rp {item.amount.toLocaleString()}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${item.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {item.proof_url ? (
                                                <a href={item.proof_url} target="_blank" className="text-[9px] font-black text-gold-accent uppercase hover:underline">Lihat Bukti</a>
                                            ) : (
                                                <span className="text-[9px] font-bold text-foreground/10 uppercase italic">Diproses...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayoutSettingsModal
                isOpen={isPayoutModalOpen}
                onClose={() => setIsPayoutModalOpen(false)}
                currentDetails={profile?.payout_details}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
};
