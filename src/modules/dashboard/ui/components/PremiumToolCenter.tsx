'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import {
    Package,
    Lock,
    Unlock,
    Plus,
    Pencil,
    Trash2,
    ExternalLink,
    Search,
    LayoutGrid,
    Settings2,
    X,
    ChevronLeft,
    Monitor,
    Shield,
    Check,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/shared/ui/Toast';
import { PremiumBadge } from '@/shared/ui/PremiumBadge';

interface PremiumTool {
    id: string;
    name: string;
    slug: string;
    description: string;
    iframe_url: string;
    icon_name: string;
    badge_text: string;
    allowed_badges: string[];
    allowed_tags: string[];
    is_active: boolean;
    sort_order: number;
}

interface MembershipTier {
    id: string;
    label: string;
    value: string;
    color?: string;
}

interface UserProfile {
    id: string;
    role: string;
    membership_tier: string[]; // This is the TAGS (Program)
    badge_level: string;     // This is the Badge (Level)
    allowed_tools: string[];
}

export const PremiumToolCenter: React.FC = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast, confirm } = useToast();

    // States
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState<PremiumTool[]>([]);
    const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [viewMode, setViewMode] = useState<'member' | 'admin'>('member');
    const [selectedTool, setSelectedTool] = useState<PremiumTool | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Admin Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<PremiumTool | null>(null);
    const [formData, setFormData] = useState<Partial<PremiumTool>>({
        name: '',
        slug: '',
        description: '',
        iframe_url: '',
        icon_name: 'Box',
        badge_text: '',
        allowed_badges: [],
        allowed_tags: [],
        is_active: true
    });

    const fetchTools = useCallback(async () => {
        const { data, error } = await supabase
            .from('premium_tools')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            showToast('Gagal memuat daftar alat', 'error');
        } else {
            setTools(data || []);
        }
    }, [supabase, showToast]);

    const fetchProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, role, membership_tier, badge_level, allowed_tools')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setProfile(data);
                // IF admin, default to admin view? or keep member for testing? 
                // Let's keep it based on user preference or defaulting to member
            }
        }
    }, [supabase]);

    const fetchConfig = useCallback(async () => {
        const { data } = await supabase
            .from('membership_tiers')
            .select('*')
            .order('sort_order', { ascending: true });
        if (data) setMembershipTiers(data);
    }, [supabase]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchTools(), fetchProfile(), fetchConfig()]);
            setLoading(false);
        };
        init();
    }, [fetchTools, fetchProfile]);

    const handleSaveTool = async () => {
        if (!formData.name || !formData.iframe_url) {
            showToast('Nama dan URL wajib diisi', 'error');
            return;
        }

        const payload = {
            ...formData,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        };

        let error;
        if (editingTool) {
            ({ error } = await supabase.from('premium_tools').update(payload).eq('id', editingTool.id));
        } else {
            ({ error } = await supabase.from('premium_tools').insert([payload]));
        }

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast(editingTool ? 'Alat diperbarui' : 'Alat baru terpasang!', 'success');
            setIsModalOpen(false);
            setEditingTool(null);
            fetchTools();
        }
    };

    const handleDeleteTool = (tool: PremiumTool) => {
        confirm({
            title: 'Hapus Alat',
            message: `Hapus "${tool.name}" secara permanen?`,
            confirmText: 'Ya, Hapus',
            onConfirm: async () => {
                const { error } = await supabase.from('premium_tools').delete().eq('id', tool.id);
                if (error) showToast(error.message, 'error');
                else {
                    showToast('Alat berhasil dihapus', 'success');
                    fetchTools();
                    if (selectedTool?.id === tool.id) setSelectedTool(null);
                }
            }
        });
    };

    const canAccess = (tool: PremiumTool) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;

        // 1. Check by Badge (Level: Sultan, Elite, dsb)
        const hasBadge = tool.allowed_badges?.includes(profile.badge_level);
        if (hasBadge) return true;

        // 2. Check by Tag (Product: n8n, Youtube, dsb)
        const hasTag = profile.membership_tier?.some(t => tool.allowed_tags?.includes(t));
        if (hasTag) return true;

        // 3. Check individual access (Special)
        return profile.allowed_tools?.includes(tool.id);
    };

    const filteredTools = tools.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gold-accent uppercase tracking-widest">Scanning Premium Armory...</p>
        </div>
    );

    // Iframe View
    if (selectedTool) {
        return (
            <div className="flex flex-col h-full min-h-[700px] animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6 px-6 py-4 bg-white/5 border border-white-border/10 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedTool(null)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground/40 hover:text-white transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic">
                                IndoAi <span className="text-gold-accent">{selectedTool.name}</span>
                            </h3>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest leading-none">Embedded Premium Module</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Secured Connection</span>
                        </div>
                        <button
                            onClick={() => window.open(selectedTool.iframe_url, '_blank')}
                            className="p-2 rounded-xl bg-gold-accent/10 text-gold-accent hover:bg-gold-accent hover:text-background transition-all"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-[600px] rounded-[2.5rem] border border-white-border/10 bg-black overflow-hidden relative group/frame shadow-2xl">
                    <iframe
                        src={selectedTool.iframe_url}
                        className="w-full h-full border-none"
                        title={selectedTool.name}
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/frame:opacity-100 transition-opacity">
                        <div className="px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                            IndoAi Sandboxed Environment
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center p-1 bg-white/[0.02] border border-white-border/5 rounded-2xl">
                        <button
                            onClick={() => setViewMode('member')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'member' ? 'bg-white/10 text-white shadow-xl' : 'text-foreground/30 hover:text-white/60'}`}
                        >
                            <LayoutGrid size={12} />
                            My tools
                        </button>
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => setViewMode('admin')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'admin' ? 'bg-gold-accent/10 text-gold-accent' : 'text-foreground/30 hover:text-gold-accent/60'}`}
                            >
                                <Settings2 size={12} />
                                Manager
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" />
                        <input
                            type="text"
                            placeholder="Find application..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/[0.02] border border-white-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-[10px] font-bold text-foreground focus:outline-none focus:border-gold-accent/40 w-64 transition-all"
                        />
                    </div>
                </div>

                {viewMode === 'admin' && (
                    <button
                        onClick={() => {
                            setEditingTool(null);
                            setFormData({
                                name: '',
                                slug: '',
                                description: '',
                                iframe_url: '',
                                icon_name: 'Box',
                                badge_text: '',
                                allowed_badges: [],
                                allowed_tags: [],
                                is_active: true
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-accent text-background text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Plus size={14} />
                        Register New Tool
                    </button>
                )}
            </div>

            {/* Member View: Grid of Tools */}
            {viewMode === 'member' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem]">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-foreground/10">
                                <Package size={32} />
                            </div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">No tools found for your TAGS or Badge level.</p>
                        </div>
                    )}

                    {filteredTools.map((tool) => {
                        const accessible = canAccess(tool);
                        return (
                            <motion.div
                                key={tool.id}
                                whileHover={accessible ? { y: -5 } : {}}
                                className="relative group"
                            >
                                <div className={`h-full p-8 rounded-[2.5rem] border bg-[#0F0F11]/40 overflow-hidden transition-all duration-300 flex flex-col ${accessible ? 'border-white-border/5 hover:border-gold-accent/20 hover:bg-gold-accent/[0.02]' : 'border-white-border/5 opacity-80'}`}>
                                    {/* Icon & Badge */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${accessible ? 'bg-gold-accent/10 border-gold-accent/20 text-gold-accent group-hover:bg-gold-accent group-hover:text-background' : 'bg-white/5 border-white-border/5 text-foreground/20'}`}>
                                            <Package size={24} />
                                        </div>
                                        {tool.badge_text && (
                                            <div className="px-3 py-1 rounded-full bg-gold-accent/10 text-gold-accent text-[8px] font-black uppercase tracking-widest border border-gold-accent/20">
                                                {tool.badge_text}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-8 flex-1">
                                        <h4 className={`text-lg font-black tracking-tighter uppercase italic leading-none ${accessible ? 'text-foreground group-hover:text-gold-accent' : 'text-foreground/20'}`}>
                                            {tool.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-foreground/30 leading-relaxed line-clamp-2 uppercase tracking-wide">
                                            {tool.description}
                                        </p>
                                    </div>

                                    {/* Syarat Badge & Tag */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {tool.allowed_badges?.map(badge => (
                                            <PremiumBadge key={badge} level={badge} className="scale-75 origin-left" />
                                        ))}
                                        {tool.allowed_tags?.map(tag => (
                                            <div key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white-border/10 text-[7px] font-black uppercase text-foreground/40 tracking-widest">
                                                Tag: {tag}
                                            </div>
                                        ))}
                                        {(!tool.allowed_badges?.length && !tool.allowed_tags?.length) && (
                                            <div className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[7px] font-black uppercase text-red-500 tracking-widest">
                                                Individual Only
                                            </div>
                                        )}
                                    </div>

                                    {/* Action */}
                                    {accessible ? (
                                        <button
                                            onClick={() => setSelectedTool(tool)}
                                            className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-white/5 hover:bg-gold-accent text-white hover:text-background text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-black/20"
                                        >
                                            <Unlock size={14} />
                                            Launch Application
                                        </button>
                                    ) : (
                                        <div className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-red-500/5 text-red-500/40 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10 cursor-not-allowed">
                                            <Lock size={14} />
                                            Access Locked
                                        </div>
                                    )}

                                    {/* Decoration */}
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Admin View: Management Table */}
            {viewMode === 'admin' && (
                <div className="rounded-[2.5rem] border border-white-border/10 bg-[#0A0A0B]/60 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white-border/10">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/40">Application</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/40">Requirements (Badge / Tag)</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-border/5">
                            {tools.map((tool) => (
                                <tr key={tool.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-foreground/20 group-hover:text-gold-accent transition-all border border-white-border/10">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-foreground uppercase tracking-tight italic group-hover:text-gold-accent transition-colors">{tool.name}</div>
                                                <div className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest font-mono">/Tool/{tool.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {tool.allowed_badges?.map(badge => (
                                                <PremiumBadge key={badge} level={badge} className="scale-75 origin-left" />
                                            ))}
                                            {tool.allowed_tags?.map(tag => (
                                                <div key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white-border/10 text-[7px] font-black uppercase text-foreground/40 tracking-widest">
                                                    {tag}
                                                </div>
                                            ))}
                                            {(!tool.allowed_badges?.length && !tool.allowed_tags?.length) && (
                                                <div className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-[6px] font-black uppercase">Individual</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${tool.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                {tool.is_active ? 'Online' : 'Hidden'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 pr-2">
                                            <button
                                                onClick={() => {
                                                    setEditingTool(tool);
                                                    setFormData(tool);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-3 rounded-xl bg-white/5 text-foreground/20 hover:text-gold-accent transition-all hover:bg-gold-accent/10 border border-white-border/5"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTool(tool)}
                                                className="p-3 rounded-xl bg-red-500/5 text-red-500/20 hover:text-red-500 transition-all hover:bg-red-500/10 border border-red-500/10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Admin Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-3xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0F0F11] border border-white-border/10 rounded-[3rem] shadow-2xl p-6 sm:p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">
                                        {editingTool ? 'Refine' : 'Register'} <span className="text-gold-accent">Premium Tool</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Configure Armory Assets</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground/40 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Application Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Bulk WA Blaster"
                                        className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-gold-accent/40 text-foreground transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Access Slug (/Tool/slug)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. blaster"
                                        className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-gold-accent/40 text-foreground transition-all"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Internal application URL</label>
                                    <div className="relative">
                                        <Monitor size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                                        <input
                                            type="text"
                                            value={formData.iframe_url}
                                            onChange={(e) => setFormData({ ...formData, iframe_url: e.target.value })}
                                            placeholder="/Tool/app-name/index.html"
                                            className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl pl-10 pr-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-gold-accent/40 text-gold-accent transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Brief Mission Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what this tool does..."
                                        rows={3}
                                        className="w-full bg-white/[0.04] border border-white-border/10 rounded-3xl px-4 py-3 text-[11px] font-bold focus:outline-none focus:border-gold-accent/40 text-foreground transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Promo Badge Label</label>
                                    <input
                                        type="text"
                                        value={formData.badge_text}
                                        onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                                        placeholder="NEW / HOT / V1.0"
                                        className="w-full bg-white/[0.04] border border-white-border/10 rounded-2xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:border-gold-accent/40 text-foreground transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-2">Tool Status</label>
                                    <button
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-full py-2.5 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest ${formData.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                                    >
                                        {formData.is_active ? 'Active Operation' : 'Asset Deactivated'}
                                    </button>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white-border/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={12} className="text-gold-accent" />
                                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Target Clearance (Badge)</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['free', 'premium', 'elite', 'sultan'].map(badge => (
                                            <button
                                                key={badge}
                                                onClick={() => {
                                                    const current = formData.allowed_badges || [];
                                                    const updated = current.includes(badge)
                                                        ? current.filter(b => b !== badge)
                                                        : [...current, badge];
                                                    setFormData({ ...formData, allowed_badges: updated });
                                                }}
                                                className={`flex items-center gap-2 px-1 py-1 rounded-full border transition-all ${formData.allowed_badges?.includes(badge) ? 'border-gold-accent/40 bg-gold-accent/10' : 'border-white/5 bg-white-border/2'}`}
                                            >
                                                <PremiumBadge level={badge} className={`scale-75 ${formData.allowed_badges?.includes(badge) ? '' : 'grayscale opacity-30'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white-border/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package size={12} className="text-gold-accent" />
                                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Target Specialization (Tags)</label>
                                    </div>

                                    <TagMultiSelect
                                        options={membershipTiers}
                                        selectedTags={formData.allowed_tags || []}
                                        onChange={(tags) => setFormData({ ...formData, allowed_tags: tags })}
                                    />
                                </div>

                                {(!formData.allowed_badges?.length && !formData.allowed_tags?.length) && (
                                    <div className="sm:col-span-2">
                                        <p className="text-[7px] font-bold text-red-500/60 uppercase tracking-widest mt-2 text-center">
                                            No Badge or Tag selected? This tool will be **Individual Only** (Special Order).
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSaveTool}
                                className="w-full py-5 rounded-[2rem] bg-gold-accent text-background font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-gold-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                            >
                                {editingTool ? 'Commit Changes' : 'Execute Registration'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Visual Legend */}
            <div className="flex items-center gap-8 px-8 py-6 rounded-3xl bg-white/[0.02] border border-white-border/5">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gold-accent/10 border border-gold-accent/20">
                        <Unlock size={12} className="text-gold-accent" />
                    </div>
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest italic">Ready to Deployment</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white-border/5 text-foreground/20">
                        <Lock size={12} />
                    </div>
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest italic">Requires High Clearance</span>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.4em]">IndoAi Secured Module v1.0 / Military Grade Sandbox</p>
                </div>
            </div>
        </div>
    );
};

const TagMultiSelect = ({
    selectedTags,
    onChange,
    options
}: {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    options: MembershipTier[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/[0.04] border border-white-border/10 rounded-2xl px-4 py-2.5 text-[11px] font-bold text-foreground focus:outline-none focus:border-gold-accent/40 transition-all hover:bg-white/[0.06]"
            >
                <div className="flex flex-wrap gap-1.5">
                    {selectedTags.length > 0 ? (
                        selectedTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 text-[9px] uppercase tracking-wider text-foreground/80">
                                {options.find(o => o.value === tag)?.label || tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-foreground/30 uppercase tracking-widest">Select Access Tags...</span>
                    )}
                </div>
                <ChevronDown size={14} className={`text-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1A1A1D] border border-white-border/10 rounded-2xl shadow-2xl z-[70] p-2 max-h-[240px] overflow-y-auto"
                        >
                            {options.length === 0 && (
                                <div className="p-4 text-center text-[9px] text-foreground/30 uppercase tracking-widest">
                                    No TAGS configured in Config Hub.
                                </div>
                            )}
                            {options.map(option => {
                                const isSelected = selectedTags.includes(option.value);
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            const newTags = isSelected
                                                ? selectedTags.filter(t => t !== option.value)
                                                : [...selectedTags, option.value];
                                            onChange(newTags);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all group ${isSelected ? 'bg-gold-accent/10 border border-gold-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: option.color || '#fff', boxShadow: `0 0 10px ${option.color}40` }} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-gold-accent' : 'text-foreground/60 group-hover:text-foreground'}`}>
                                                {option.label}
                                            </span>
                                        </div>
                                        {isSelected && <Check size={12} className="text-gold-accent" />}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
