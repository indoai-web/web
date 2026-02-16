'use client';

import React, { useState, useEffect } from 'react';
import {
    Download,
    Lock,
    Cpu,
    Video,
    FileText,
    ArrowRight,
    Search,
    Filter,
    Crown,
    Coins
} from 'lucide-react';

interface Material {
    id: string;
    title: string;
    description: string;
    category: 'Video' | 'PDF' | 'E-Book' | 'Template';
    is_locked: boolean;
    badge_level: 'Member' | 'VIP' | 'Sultan';
    allowed_batches?: string[];
}

const MOCK_MATERIALS: Material[] = [
    { id: '1', title: 'Panduan Dasar AI Marketing', description: 'Pelajari cara menggunakan AI untuk meningkatkan penjualan agensi Anda.', category: 'PDF', is_locked: false, badge_level: 'Member', allowed_batches: [] },
    { id: '2', title: 'Template Content Planner 2026', description: 'Template excel otomatis untuk planning konten selama 1 tahun.', category: 'Template', is_locked: true, badge_level: 'VIP', allowed_batches: [] },
    { id: '3', title: 'Video Masterclass: AI Influencer', description: 'Video eksklusif cara membangun influencer AI dari nol.', category: 'Video', is_locked: true, badge_level: 'Sultan', allowed_batches: ['VIP Access'] },
];

export const MemberLibrary: React.FC = () => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [specialOffers, setSpecialOffers] = useState<any[]>([]);

    const fetchSpecialOffers = async () => {
        try {
            const res = await fetch('/api/invitations?special=true');
            const json = await res.json();
            if (json.success) setSpecialOffers(json.data);
        } catch (err) {
            console.error('Failed to fetch special offers:', err);
        }
    };

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/resources');
            const json = await res.json();
            if (json.success) {
                setResources(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
        fetchSpecialOffers();

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    const handleDownload = async (materialId: string, title: string, url: string) => {
        setDownloadingId(materialId);
        try {
            // Check if it's a direct URL or needs secure link
            if (url.startsWith('http')) {
                window.open(url, '_blank');
            } else {
                const response = await fetch('/api/facilities/secure-link', {
                    method: 'POST',
                    body: JSON.stringify({
                        materialId,
                        bucketName: 'materials',
                        filePath: url
                    }),
                });

                const data = await response.json();
                if (data.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                } else {
                    alert(data.error || 'Gagal membuat link aman.');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDownloadingId(null);
        }
    };

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupName)
                ? prev.filter(g => g !== groupName)
                : [...prev, groupName]
        );
    };

    const groupedResources = resources.reduce((acc: Record<string, any[]>, item) => {
        const group = item.group_name || 'Stand-alone';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Catalog Hero */}
            <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-gold-accent/10 to-transparent border border-gold-accent/10 overflow-hidden shadow-2xl shadow-gold-accent/5">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-gold-accent text-background text-[9px] font-black uppercase tracking-widest">EXCLUSIVE CONTENT</div>
                        <h2 className="text-3xl font-black tracking-tighter text-foreground/90 uppercase italic">Library <span className="text-gold-accent">Materi</span></h2>
                    </div>
                    <p className="text-sm font-bold text-foreground/40 max-w-2xl leading-relaxed">
                        Akses materi eksklusif, template, dan video pembelajaran terbaik dari IndoAi Studio. Hubungi Admin jika Anda ingin upgrade akses ke materi Sultan.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-gold-accent/5 blur-[100px] rounded-full" />
            </div>

            {/* Exclusive Special Offers (New!) */}
            {specialOffers.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                    <div className="flex items-center gap-2 ml-4">
                        <Crown size={14} className="text-[#a3ff12] animate-pulse" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a3ff12]/60 italic">Exclusive Member Offers (Access TAG)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialOffers.map(offer => (
                            <div key={offer.id} className="group relative p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-700 overflow-hidden flex items-center justify-between gap-6 shadow-2xl shadow-indigo-500/5">
                                <div className="space-y-3 relative z-10 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[7px] font-black uppercase tracking-widest">
                                            {offer._offerType === 'resource' ? 'DIRECT ACCESS' : 'EXCLUSIVE UNLOCK'}
                                        </div>
                                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Special Price</span>
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-indigo-400 transition-colors leading-tight">
                                        {offer.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-foreground/30 line-clamp-1 leading-relaxed uppercase tracking-wide">
                                        {offer.product_description || offer.sale_description || 'Dapatkan akses eksklusif sekarang.'}
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="text-lg font-black text-[#a3ff12]">Rp {offer.member_discount?.toLocaleString()}</span>
                                        {offer.price > 0 && (
                                            <span className="text-[10px] font-bold text-foreground/20 line-through">Rp {offer.price?.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 relative z-10">
                                    <button
                                        onClick={() => {
                                            const url = offer.direct_checkout_url || (offer._offerType === 'invitation' ? `/join/${offer.slug}` : '#');
                                            if (url !== '#') window.open(url, '_blank');
                                            else alert('Link pembayaran belum tersedia. Hubungi Admin.');
                                        }}
                                        className="px-8 py-4 rounded-2xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                                    >
                                        Unlock Now
                                    </button>

                                    <button
                                        onClick={() => window.location.href = `/dashboard?tab=affiliate&campaign=${offer.slug || offer._offerType + '-' + offer.id}`}
                                        className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground/40 font-black text-[9px] uppercase tracking-widest hover:bg-[#a3ff12]/10 hover:text-[#a3ff12] hover:border-[#a3ff12]/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Coins size={12} /> Be Affiliate
                                    </button>
                                </div>

                                {/* Decorative Aura */}
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full group-hover:bg-indigo-500/10 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-8 relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-[40px]">
                        <div className="w-10 h-10 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
                    </div>
                )}

                <div className="space-y-12">
                    {Object.entries(groupedResources).map(([groupName, items]) => {
                        const isStandAlone = groupName === 'Stand-alone';
                        const isExpanded = expandedGroups.includes(groupName);

                        return (
                            <div key={groupName} className="space-y-6">
                                {!isStandAlone && (
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className="flex items-center gap-4 group w-full text-left"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center text-gold-accent group-hover:scale-110 transition-all">
                                            <Cpu size={24} className={isExpanded ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground/80 group-hover:text-gold-accent transition-colors">
                                                {groupName}
                                            </h3>
                                            <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
                                                {items.length} Files Included • Click to {isExpanded ? 'Collapse' : 'Expand'}
                                            </p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2 pr-4">
                                            <div className={`w-8 h-8 rounded-full border border-white-border/10 flex items-center justify-center text-foreground/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {(isStandAlone || isExpanded) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                                        {items.map((m: any) => (
                                            <div key={m.id} className="group relative p-6 rounded-[24px] bg-white/[0.01] border border-white-border/5 hover:border-gold-accent/20 transition-all duration-500 overflow-hidden flex flex-col justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gold-accent group-hover:scale-110 transition-transform">
                                                            {m.category === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                                        </div>
                                                        <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
                                                            {m.allowed_tiers.map((tier: string) => (
                                                                <span key={tier} className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/40">
                                                                    {tier === 'premium' ? 'PRO' : tier}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <h3 className="text-sm font-black tracking-tight text-foreground/80 group-hover:text-gold-accent transition-colors leading-tight">
                                                            {m.title}
                                                        </h3>
                                                        <p className="text-[10px] font-bold text-foreground/30 line-clamp-2 leading-relaxed">
                                                            {m.description || 'Tidak ada deskripsi tambahan.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 flex items-center justify-between border-t border-white-border/5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20 italic">
                                                        {m.category}
                                                    </span>
                                                    <button
                                                        disabled={downloadingId === m.id}
                                                        onClick={() => handleDownload(m.id, m.title, m.content_url)}
                                                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-gold-accent/10 text-gold-accent hover:bg-gold-accent hover:text-background disabled:opacity-50`}
                                                    >
                                                        {downloadingId === m.id ? 'Processing...' : (
                                                            m.type === 'tool' ? <>Open Access <ArrowRight size={12} /></> : <>Access File <ArrowRight size={12} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {!loading && resources.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-foreground/10">
                                <Lock size={32} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-foreground/40 text-center">No Content Available</h4>
                                <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest mt-2">Materi mungkin belum tersedia untuk TAG Anda atau belum ditambahkan oleh Admin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tools Area */}
            <div className="space-y-6 pt-12 border-t border-white-border/5">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground/80 uppercase italic">AI Tools <span className="text-gold-accent">Center</span></h2>
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Aplikasi & Alat Khusus Member IndoAi</p>
                </div>
                <div className="p-10 rounded-[32px] bg-white/[0.01] border border-white-border/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gold-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10 space-y-3">
                        <p className="text-lg font-black text-foreground italic uppercase">Kirim Tool Kreasi Anda?</p>
                        <p className="text-[11px] font-bold text-foreground/20 uppercase tracking-widest max-w-md leading-relaxed">Dapatkan apresiasi dan akses spesial dengan berbagi tool AI buatan Anda bersama komunitas IndoAi.</p>
                    </div>
                    <button className="relative z-10 px-10 py-4 rounded-2xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold-accent/20 hover:scale-105 active:scale-95 transition-all">
                        Submit My Tool Access
                    </button>
                </div>
            </div>
        </div>
    );
};

