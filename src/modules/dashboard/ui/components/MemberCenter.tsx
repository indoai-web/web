'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MoreVertical,
    Shield,
    User,
    MessageSquare,
    Download,
    Rocket,
    Crown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Settings,
    Filter,
    Plus,
    CheckCircle2,
    XCircle,
    ArrowUpAz,
    ArrowDownAz,
    Loader2,
    Upload,
    FileSpreadsheet,
    Copy,
    Timer,
    Coins,
    Clock,
    Link,
    ExternalLink,
    Pencil,
    GripVertical,
    Sparkles,
    Star
} from 'lucide-react';
import { motion, Reorder, AnimatePresence, Variants } from 'framer-motion';
import { PremiumBadge } from '@/shared/ui/PremiumBadge';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { MemberModal, DeleteConfirmModal } from './MemberModals';
import { InvitationModal } from './EventModals';
import { ToolAccessModal } from './ToolAccessModal';

interface Member {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    membership_tier: string[];
    is_active: boolean;
    assigned_landing_page: string;
    badge_level: string;
    role: string;
    notes?: string;
    source_event?: string;
}

interface Invitation {
    id: string;
    title: string;
    slug: string;
    membership_tier: string;
    badge_level: string;
    expires_at: string | null;
    wa_group_url: string;
    is_active: boolean;
    created_at: string;
    assigned_landing_page: string;
    is_discount_enabled: boolean;
    discount_code: string;
    is_countdown_enabled: boolean;
    countdown_duration_mins: number;
    is_affiliate_enabled: boolean;
    commission_per_sale: number;
}

interface MembershipTier {
    id: string;
    label: string;
    value: string;
    color?: string;
}

interface BadgeLevel {
    id: string;
    label: string;
    value: string;
    color_scheme: string;
}

type SortField = 'full_name' | 'email' | 'badge_level' | 'membership_tier';
type SortOrder = 'asc' | 'desc';

const DEFAULT_TIERS: MembershipTier[] = [
    { id: '1', label: 'Free', value: 'free', color: '#a3ff12' },
    { id: '2', label: 'PRO', value: 'premium', color: '#3b82f6' },
    { id: '4', label: 'Elite', value: 'elite', color: '#0FFFFF' },
    { id: '3', label: 'Sultan', value: 'sultan', color: '#fbbf24' }
];

const PREMIUM_COLORS = [
    { label: 'Stabilo Yellow', value: '#EFFF00' },
    { label: 'Neon Green', value: '#A3FF12' },
    { label: 'Electric Cyan', value: '#0FFFFF' },
    { label: 'Hot Pink', value: '#FF00FF' },
    { label: 'Vibrant Orange', value: '#FFAC1C' },
    { label: 'Atomic Purple', value: '#BF00FF' },
    { label: 'Laser Red', value: '#FF003C' },
    { label: 'Pure White', value: '#ffffff' }
];

const DEFAULT_BADGES: BadgeLevel[] = [
    { id: '1', label: 'Member', value: 'member', color_scheme: 'green' },
    { id: '2', label: 'Pro', value: 'pro', color_scheme: 'red' },
    { id: '3', label: 'Elite', value: 'elite', color_scheme: 'gold' },
    { id: '4', label: 'Sultan', value: 'sultan', color_scheme: 'sultan' }
];

/**
 * Smart Color Utility
 * Memberikan warna unik & konsisten dari PREMIUM_COLORS berdasarkan string tag.
 * Jika tag ada di config, gunakan warna config.
 */
const getTagColor = (tag: string, membershipTiers: MembershipTier[]) => {
    const tierCfg = membershipTiers.find(t => t.value === tag);
    if (tierCfg?.color) return tierCfg.color;

    // Hash-based logic untuk tag kustom
    let hash = 0;
    const str = tag.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Ambil warna dari palet (index 0-6, index 7 adalah putih, kita hindari kecuali terpaksa)
    const colorIndex = Math.abs(hash) % (PREMIUM_COLORS.length - 1);
    return PREMIUM_COLORS[colorIndex].value;
};



export const MemberCenter: React.FC = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState('All');
    const [activeEvents, setActiveEvents] = useState<Invitation[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Invitation | null>(null);
    const [selectedBadge, setSelectedBadge] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortField, setSortField] = useState<SortField>('full_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const [activeTab, setActiveTab] = useState<'members' | 'events' | 'affiliate' | 'config'>('members');
    const [affiliateSubTab, setAffiliateSubTab] = useState<'stats' | 'payouts' | 'armory' | 'ai'>('stats');
    const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
    const [newTierData, setNewTierData] = useState({ label: '', color: '#ffffff' });
    const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
    const [editTierData, setEditTierData] = useState({ label: '', color: '#ffffff' });
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [invitationsLoading, setInvitationsLoading] = useState(false);

    // Dynamic Config State
    const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
    const [badgeLevels, setBadgeLevels] = useState<BadgeLevel[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [configLoading, setConfigLoading] = useState(false);
    const [waConfig, setWaConfig] = useState({ api_token: '', device_id: '' });

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [selectedMemberForTools, setSelectedMemberForTools] = useState<Member | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const itemsPerPage = 10;

    const fetchMembers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            // Filters
            if (selectedTier !== 'All') {
                query = query.contains('membership_tier', [selectedTier.toLowerCase()]);
            }
            if (selectedBadge !== 'All') {
                query = query.eq('badge_level', selectedBadge.toLowerCase());
            }
            if (searchQuery) {
                query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
            }

            // Sorting
            query = query.order(sortField, { ascending: sortOrder === 'asc' });

            // Pagination
            const from = (currentPage - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;
            setMembers(data || []);
            setTotalCount(count || 0);
        } catch (error: any) {
            showToast(`Gagal memuat member: ${error.message || 'Kesalahan Database'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        setConfigLoading(true);
        try {
            // Fetch Tiers
            const { data: tiersData, error: tiersError } = await supabase
                .from('membership_tiers')
                .select('*')
                .order('sort_order', { ascending: true });

            if (tiersError) {
                console.warn('[IndoAi] Membership Tiers table not found. Using defaults.', tiersError.message);
                setMembershipTiers(DEFAULT_TIERS);
            } else {
                setMembershipTiers(tiersData && tiersData.length > 0 ? tiersData : DEFAULT_TIERS);
            }

            // Fetch Badges
            const { data: badgesData, error: badgesError } = await supabase
                .from('badge_levels')
                .select('*')
                .order('sort_order', { ascending: true });

            if (badgesError) {
                console.warn('[IndoAi] Badge Levels table not found. Using defaults.', badgesError.message);
                setBadgeLevels(DEFAULT_BADGES);
            } else {
                setBadgeLevels(badgesData && badgesData.length > 0 ? badgesData : DEFAULT_BADGES);
            }

            // Fetch Available Tags for Dropdown
            const tagsRes = await fetch('/api/dashboard/available-tags');
            const tagsJson = await tagsRes.json();
            if (tagsJson.success) {
                setAvailableTags(tagsJson.tags);
            }

            // Fetch WA Config
            const { data: waData } = await supabase
                .from('module_settings')
                .select('metadata')
                .eq('module_name', 'messaging-wa')
                .single();
            if (waData?.metadata) {
                setWaConfig(waData.metadata as { api_token: string; device_id: string });
            }

        } catch (err: any) {
            console.error('[IndoAi Critical] Config Fetch Unexpected Failure:', err);
            setMembershipTiers(DEFAULT_TIERS);
            setBadgeLevels(DEFAULT_BADGES);
        } finally {
            setConfigLoading(false);
        }
    };

    const handleReorderTiers = async (newOrder: MembershipTier[]) => {
        setMembershipTiers(newOrder);
        // Batch update sort_order in database
        const updates = newOrder.map((tier, index) => ({
            id: tier.id,
            label: tier.label,
            value: tier.value,
            color: tier.color,
            sort_order: index + 1
        }));
        const { error } = await supabase.from('membership_tiers').upsert(updates, { onConflict: 'id' });
        if (error) {
            console.error('[IndoAi] Tier Reorder Error:', error);
            showToast(`Gagal simpan urutan: ${error.message}`, 'error');
        }
    };

    const handleReorderBadges = async (newOrder: BadgeLevel[]) => {
        setBadgeLevels(newOrder);
        // Batch update sort_order in database
        const updates = newOrder.map((badge, index) => ({
            id: badge.id,
            label: badge.label,
            value: badge.value,
            color_scheme: badge.color_scheme,
            sort_order: index + 1
        }));
        const { error } = await supabase.from('badge_levels').upsert(updates, { onConflict: 'id' });
        if (error) {
            console.error('[IndoAi] Badge Reorder Error:', error);
            showToast(`Gagal simpan urutan: ${error.message}`, 'error');
        }
    };

    const fetchInvitations = async () => {
        setInvitationsLoading(true);
        try {
            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setInvitations(data || []);
        } catch (error: Error | any) {
            showToast(`Gagal: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setInvitationsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMembers();
            fetchInvitations();
            fetchConfig();
        }, 100);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedTier, selectedBadge, currentPage, sortField, sortOrder, activeTab]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const downloadTemplate = () => {
        // Headers with human-readable labels for the backend
        const headers = ['Full Name', 'Email', 'WhatsApp Phone', 'Membership Tier', 'Badge Level', 'Target Landing Page', 'Catatan'];
        // Mapping reference for the system (not in the CSV)
        const csvContent = [
            'sep=,', // Excel hint for separator
            headers.join(','),
            ['Budi Santosa', 'budi@indoai.id', '+628123456789', 'free', 'Member', 'v1', 'Member baru dari iklan FB'].join(','),
            ['Ani Wijaya', 'ani@indoai.id', '+628987654321', 'premium', 'VIP', 'v3', 'Loyal member, perhatikan akses tools'].join(',')
        ].join('\n');

        // Add BOM for Excel UTF-8 recognition
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'indoai_member_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Template berhasil diunduh! Nomor telepon akan tersimpan otomatis.', 'success');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Security check: File type
        if (!file.name.endsWith('.csv')) {
            showToast('Hanya file .csv yang diperbolehkan!', 'error');
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const allLines = text.split(/\r?\n/).filter(line => line.trim());

                if (allLines.length < 2) {
                    throw new Error('File CSV kosong atau tidak memiliki data');
                }

                // Skip 'sep=' line if present
                const startIndex = allLines[0].startsWith('sep=') ? 1 : 0;
                const headers = allLines[startIndex].split(',').map(h => h.trim());

                const headerMap: Record<string, string> = {
                    'Full Name': 'full_name',
                    'Email': 'email',
                    'WhatsApp Phone': 'phone_number',
                    'Membership Tier': 'membership_tier',
                    'Badge Level': 'badge_level',
                    'Target Landing Page': 'assigned_landing_page',
                    'Catatan': 'notes'
                };

                const validatedMembers: any[] = [];
                const errors: string[] = [];

                allLines.slice(startIndex + 1).forEach((line, idx) => {
                    const values = line.split(',').map(v => v.trim());
                    const rowNum = idx + startIndex + 2;
                    const member: any = {};

                    headers.forEach((h, i) => {
                        const dbField = headerMap[h] || h.toLowerCase().replace(/ /g, '_');
                        member[dbField] = values[i];
                    });

                    // Validation Rules
                    if (!member.full_name) errors.push(`Baris ${rowNum}: Nama Lengkap wajib diisi`);
                    if (!member.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
                        errors.push(`Baris ${rowNum}: Format Email tidak valid`);
                    }
                    if (member.phone) {
                        // Auto-convert 0 to 62 for consistency
                        if (member.phone.startsWith('0')) {
                            member.phone = '62' + member.phone.slice(1);
                        }
                        if (!/^\+?\d+$/.test(member.phone)) {
                            errors.push(`Baris ${rowNum}: Format Telepon harus angka (gunakan 62...)`);
                        }
                    }

                    validatedMembers.push({
                        id: crypto.randomUUID(),
                        ...member,
                        is_active: true,
                        role: 'member'
                    });
                });

                if (errors.length > 0) {
                    showToast(`Error Validasi: ${errors[0]} (ada ${errors.length} kesalahan)`, 'error');
                    setLoading(false);
                    return;
                }

                // Supabase Insertion
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert(validatedMembers);

                if (insertError) throw insertError;

                showToast(`Sukses! ${validatedMembers.length} member berhasil diimpor ke sistem.`, 'success');
                fetchMembers();
            } catch (error: any) {
                showToast(`Gagal Impor: ${error.message}`, 'error');
            } finally {
                setLoading(false);
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpAz size={10} className="ml-1 opacity-20" />;
        return sortOrder === 'asc' ? <ChevronUp size={12} className="ml-1 text-gold-accent" /> : <ChevronDown size={12} className="ml-1 text-gold-accent" />;
    };

    const FilterDropdown: React.FC<{
        label: string;
        value: string;
        options: { label: string; value: string }[];
        onChange: (val: string) => void;
    }> = ({ label, value, options, onChange }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedOption = options.find(opt => opt.value === value) || options[0];

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:text-gold-accent ${isOpen ? 'text-gold-accent bg-white/5 rounded-t-lg' : 'text-foreground/40'}`}
                >
                    <span>{label}: {selectedOption.label}</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold-accent' : 'opacity-30'}`} />
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                        <div className="absolute top-[calc(100%-1px)] left-0 min-w-[140px] bg-[#141417] border border-white-border/10 border-t-gold-accent/10 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] p-1 animate-in fade-in slide-in-from-top-1 duration-200 origin-top">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${value === opt.value ? 'bg-gold-accent text-background shadow-lg' : 'hover:bg-white/5 text-foreground/40 hover:text-white'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section - More Compact */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground/90 uppercase italic">Member <span className="text-gold-accent">Manager</span></h2>
                    <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                        Total: {totalCount} Accounts
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        Sorted by: {sortField.replace('_', ' ')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-6 py-2.5 rounded-xl bg-white/[0.02] border border-white-border/10 focus:border-gold-accent/40 focus:outline-none transition-all text-xs font-bold"
                        />
                    </div>

                    <div className="flex items-center gap-0 bg-white/[0.02] border border-white-border/10 rounded-xl overflow-visible">
                        <div className="flex items-center pl-3 pr-1 text-foreground/20">
                            <Filter size={12} />
                        </div>

                        <FilterDropdown
                            label="TAG"
                            value={selectedTier}
                            onChange={(val) => { setSelectedTier(val); setCurrentPage(1); }}
                            options={[
                                { label: 'All', value: 'All' },
                                ...membershipTiers.map(t => ({ label: t.label, value: t.value }))
                            ]}
                        />

                        <div className="w-px h-10 bg-white-border/5" />

                        <FilterDropdown
                            label="Badge"
                            value={selectedBadge}
                            onChange={(val) => { setSelectedBadge(val); setCurrentPage(1); }}
                            options={[
                                { label: 'All', value: 'All' },
                                ...badgeLevels.map(b => ({ label: b.label, value: b.value }))
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white-border/10">
                        <button
                            onClick={downloadTemplate}
                            className="p-2.5 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-gold-accent transition-all group relative"
                            title="Download Template"
                        >
                            <FileSpreadsheet size={14} />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F0F11] border border-white-border/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">Template</span>
                        </button>
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="p-2.5 rounded-lg hover:bg-white/5 text-foreground/20 hover:text-gold-accent transition-all group relative disabled:opacity-30"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin text-gold-accent" /> : <Upload size={14} />}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F0F11] border border-white-border/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                    {loading ? 'Processing...' : 'Import CSV'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (activeTab === 'members') setIsAddModalOpen(true);
                            else if (activeTab === 'events') setIsAddEventModalOpen(true);
                            else showToast('Fitur Konfigurasi Hub akan segera hadir!', 'info');
                        }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg ${activeTab === 'members'
                            ? 'bg-gold-accent text-background shadow-gold-accent/10'
                            : activeTab === 'events'
                                ? 'bg-[#a3ff12] text-black shadow-[#a3ff12]/10'
                                : 'bg-white/10 text-white/40 border border-white/5'
                            }`}
                    >
                        <Plus size={14} /> {activeTab === 'members' ? 'Add Member' : activeTab === 'events' ? 'Create Event Link' : 'Config Hub'}
                    </button>
                </div>
            </div>

            {/* Action Modals */}
            {isAddModalOpen && (
                <MemberModal
                    mode="add"
                    membershipTiers={membershipTiers}
                    badgeLevels={badgeLevels}
                    availableTags={availableTags}
                    onClose={() => setIsAddModalOpen(false)}
                    onRefresh={fetchMembers}
                />
            )}
            {isAddEventModalOpen && (
                <InvitationModal
                    membershipTiers={membershipTiers}
                    badgeLevels={badgeLevels}
                    onClose={() => setIsAddEventModalOpen(false)}
                    onRefresh={fetchInvitations}
                />
            )}
            {editingMember && (
                <MemberModal
                    mode="edit"
                    member={editingMember as any}
                    membershipTiers={membershipTiers}
                    badgeLevels={badgeLevels}
                    availableTags={availableTags}
                    onClose={() => setEditingMember(null)}
                    onRefresh={fetchMembers}
                />
            )}
            {memberToDelete && <DeleteConfirmModal member={memberToDelete as any} onClose={() => setMemberToDelete(null)} onRefresh={fetchMembers} />}
            {selectedMemberForTools && (
                <ToolAccessModal
                    member={selectedMemberForTools as any}
                    onClose={() => setSelectedMemberForTools(null)}
                    onRefresh={fetchMembers}
                />
            )}

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white-border/5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-gold-accent text-background shadow-lg shadow-gold-accent/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                >
                    Member List
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-gold-accent text-background shadow-lg shadow-gold-accent/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                >
                    Event Links
                </button>
                <button
                    onClick={() => setActiveTab('affiliate')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative group ${activeTab === 'affiliate'
                        ? 'bg-gold-accent text-background shadow-[0_10px_30px_rgba(251,191,36,0.2)]'
                        : 'text-foreground/30 hover:text-foreground/60'
                        }`}
                >
                    Affiliate Hub
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative group ${activeTab === 'config'
                        ? 'bg-gold-accent text-background shadow-[0_10px_30px_rgba(251,191,36,0.2)]'
                        : 'text-foreground/30 hover:text-foreground/60'
                        }`}
                >
                    Config Hub
                </button>
            </div>

            {activeTab === 'members' ? (
                <div className="rounded-[2rem] border border-white-border/5 bg-[#0A0A0B]/40 overflow-hidden relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-background/20 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={32} className="text-gold-accent animate-spin" />
                            <p className="text-[10px] font-black text-gold-accent uppercase tracking-widest">Synchronizing Data...</p>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse table-auto">
                        <thead>
                            <tr className="bg-white/5 border-b border-white-border/5">
                                <th
                                    className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30 cursor-pointer hover:text-gold-accent transition-colors"
                                    onClick={() => handleSort('full_name')}
                                >
                                    <div className="flex items-center">User Identity <SortIcon field="full_name" /></div>
                                </th>
                                <th
                                    className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30 cursor-pointer hover:text-gold-accent transition-colors"
                                    onClick={() => handleSort('badge_level')}
                                >
                                    <div className="flex items-center">Badge <SortIcon field="badge_level" /></div>
                                </th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Target Page</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Source</th>
                                <th
                                    className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30 cursor-pointer hover:text-gold-accent transition-colors"
                                    onClick={() => handleSort('membership_tier')}
                                >
                                    <div className="flex items-center">Access TAG <SortIcon field="membership_tier" /></div>
                                </th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-border/5">
                            {members.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-20 text-center">
                                        <p className="text-xs font-bold text-foreground/20 italic">No members found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                            {members.map((member) => (
                                <tr key={member.id} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white-border/5 group-hover:border-gold-accent/20 transition-all">
                                                <User size={14} className="text-foreground/20 group-hover:text-gold-accent" />
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[11px] font-black tracking-tight text-foreground/70 group-hover:text-white transition-colors">{member.full_name || 'Anonymous'}</span>
                                                <span className="text-[9px] font-bold text-foreground/20">{member.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <PremiumBadge level={member.badge_level} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-foreground/40 uppercase">
                                                {member.assigned_landing_page ? `ED.${member.assigned_landing_page.toUpperCase()}` : 'HOME'}
                                            </span>
                                            <Rocket size={10} className="text-foreground/10" />
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-[9px] font-bold text-gold-accent/40 uppercase tracking-tighter italic">
                                            {member.source_event || 'Direct'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5 min-h-[24px]">
                                            {(() => {
                                                const rawTier = member.membership_tier as any;
                                                const normalizeTiers = (raw: any): string[] => {
                                                    let result: string[] = [];
                                                    if (Array.isArray(raw)) {
                                                        raw.forEach(item => {
                                                            if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']')) {
                                                                try {
                                                                    const parsed = JSON.parse(item);
                                                                    if (Array.isArray(parsed)) result.push(...parsed);
                                                                    else result.push(item);
                                                                } catch (e) { result.push(item); }
                                                            } else { result.push(item); }
                                                        });
                                                    } else if (typeof raw === 'string') {
                                                        if (raw.startsWith('[') && raw.endsWith(']')) {
                                                            try {
                                                                const parsed = JSON.parse(raw);
                                                                if (Array.isArray(parsed)) result.push(...parsed);
                                                                else result.push(raw);
                                                            } catch (e) { result.push(raw); }
                                                        } else { result.push(raw); }
                                                    }
                                                    return result.filter(Boolean);
                                                };

                                                const tiers = normalizeTiers(rawTier);

                                                if (tiers.length === 0) {
                                                    return <div className="text-[7px] font-black uppercase text-foreground/20 italic">No Access</div>;
                                                }

                                                // Jika banyak tier -> Tampilkan Dots (Palette View)
                                                if (tiers.length > 1) {
                                                    return (
                                                        <div className="flex items-center gap-1.5 transition-all">
                                                            {tiers.map((tierValue: string, idx: number) => {
                                                                const color = getTagColor(tierValue, membershipTiers);
                                                                const tierCfg = membershipTiers.find(t => t.value === tierValue);

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        title={tierCfg?.label || tierValue}
                                                                        className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-lg transition-all hover:scale-125 cursor-help"
                                                                        style={{
                                                                            backgroundColor: color,
                                                                            boxShadow: `0 0 10px ${color}66`
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }

                                                // Jika hanya satu tier (Free atau Pro dll) -> Tampilkan Badge Label standar
                                                const singleTier = tiers[0];
                                                const color = getTagColor(singleTier, membershipTiers);
                                                const tierCfg = membershipTiers.find(t => t.value === singleTier);
                                                return (
                                                    <div
                                                        className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.1em] border transition-all"
                                                        style={{
                                                            color: color,
                                                            borderColor: `${color}33`,
                                                            backgroundColor: `${color}11`
                                                        }}
                                                    >
                                                        {tierCfg?.label || singleTier}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => window.open(`https://wa.me/${member.phone_number}`, '_blank')}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-green-500/10 text-foreground/10 hover:text-green-500 transition-all border border-white-border/5"
                                            >
                                                <MessageSquare size={12} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                                                    className={`p-2 rounded-lg bg-white/5 hover:bg-gold-accent/10 transition-all border border-white-border/5 ${activeMenuId === member.id ? 'text-gold-accent border-gold-accent/20' : 'text-foreground/10 hover:text-gold-accent'}`}
                                                >
                                                    <MoreVertical size={12} />
                                                </button>

                                                {activeMenuId === member.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                                        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[#0F0F11] border border-white-border/10 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => { setEditingMember(member); setActiveMenuId(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-white transition-all"
                                                            >
                                                                <User size={12} className="text-gold-accent" /> Edit Profile
                                                            </button>
                                                            <button
                                                                onClick={() => { showToast('Link pengaturan ulang kata sandi telah dikirim.', 'success'); setActiveMenuId(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-white transition-all"
                                                            >
                                                                <Rocket size={12} className="text-amber-500" /> Reset Password
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedMemberForTools(member); setActiveMenuId(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-white transition-all"
                                                            >
                                                                <ExternalLink size={12} className="text-cyan-500" /> Manage Tools
                                                            </button>
                                                            <div className="h-px bg-white-border/5 my-1" />
                                                            {member.role !== 'admin' ? (
                                                                <button
                                                                    onClick={() => { setMemberToDelete(member); setActiveMenuId(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-all"
                                                                >
                                                                    <XCircle size={12} /> Delete Member
                                                                </button>
                                                            ) : (
                                                                <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-foreground/10 cursor-not-allowed">
                                                                    <Shield size={12} className="text-gold-accent/40" /> Admin Protected
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="bg-white/[0.02] px-6 py-3 border-t border-white-border/5 flex items-center justify-between">
                        <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                            Showing <span className="text-foreground/40">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)}</span> of {totalCount}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg bg-white/5 border border-white-border/5 text-foreground/20 disabled:opacity-20 hover:text-gold-accent transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-gold-accent text-background' : 'bg-white/5 text-foreground/40 hover:bg-white/10'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-1.5 rounded-lg bg-white/5 border border-white-border/5 text-foreground/20 disabled:opacity-20 hover:text-gold-accent transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'events' ? (
                <div className="rounded-[2rem] border border-white-border/5 bg-[#0A0A0B]/40 overflow-hidden relative min-h-[400px] animate-in fade-in slide-in-from-right-4 duration-500">
                    <table className="w-full text-left border-collapse table-auto">
                        <thead>
                            <tr className="bg-white/5 border-b border-white-border/5">
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Event Title & Link</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Auto Settings</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Target LP</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Hooks</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-foreground/30 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-border/5">
                            {invitationsLoading && invitations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-20 text-center">
                                        <Loader2 size={24} className="text-gold-accent animate-spin mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-gold-accent uppercase tracking-[0.2em]">Synchronizing Events...</p>
                                    </td>
                                </tr>
                            )}
                            {invitations.length === 0 && !invitationsLoading && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-20 text-center">
                                        <p className="text-xs font-bold text-foreground/20 italic">No events created yet.</p>
                                    </td>
                                </tr>
                            )}
                            {invitations.map((inv) => (
                                <tr key={inv.id} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-black tracking-tight text-foreground/70 group-hover:text-gold-accent transition-colors italic">"{inv.title}"</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-bold text-foreground/40 bg-white/5 px-2 py-0.5 rounded-md border border-white-border/5">
                                                    /join/{inv.slug}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/join/${inv.slug}`;
                                                        navigator.clipboard.writeText(url);
                                                        showToast('Link Event berhasil disalin ke clipboard!', 'success');
                                                    }}
                                                    className="p-1.5 rounded-md hover:bg-gold-accent/10 text-foreground/20 hover:text-gold-accent transition-all"
                                                >
                                                    <Copy size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <PremiumBadge level={inv.badge_level} />
                                            <span
                                                className="text-[7px] font-black uppercase border px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: membershipTiers.find(t => t.value === inv.membership_tier)?.color || '#ffffff',
                                                    borderColor: `${membershipTiers.find(t => t.value === inv.membership_tier)?.color}33` || 'rgba(255,255,255,0.1)',
                                                    backgroundColor: `${membershipTiers.find(t => t.value === inv.membership_tier)?.color}11` || 'rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                {inv.membership_tier}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Rocket size={10} className="text-foreground/20" />
                                                <span className="text-[9px] font-black text-foreground/60 uppercase">LP.{inv.assigned_landing_page?.toUpperCase() || 'V1'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {inv.is_discount_enabled && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#a3ff12] shadow-[0_0_8px_rgba(163,255,18,0.5)]" />
                                                    <span className="text-[8px] font-black text-[#a3ff12] uppercase tracking-tighter">{inv.discount_code}</span>
                                                </div>
                                            )}
                                            {inv.is_countdown_enabled && (
                                                <div className="flex items-center gap-1.5">
                                                    <Timer size={10} className="text-gold-accent/40" />
                                                    <span className="text-[8px] font-bold text-gold-accent/60 uppercase">{inv.countdown_duration_mins}m</span>
                                                </div>
                                            )}
                                            {inv.is_affiliate_enabled && (
                                                <div className="flex items-center gap-1.5">
                                                    <Coins size={10} className="text-green-500/40" />
                                                    <span className="text-[8px] font-bold text-green-500/60 uppercase">Rp {inv.commission_per_sale?.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className={`w-2 h-2 rounded-full ${inv.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase.from('invitations').delete().eq('id', inv.id);
                                                if (error) showToast(error.message, 'error');
                                                else { showToast('Event berhasil dihapus', 'success'); fetchInvitations(); }
                                            }}
                                            className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500/20 hover:text-red-500 transition-all border border-red-500/10"
                                        >
                                            <XCircle size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'affiliate' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white-border/5 rounded-2xl w-fit">
                        {([
                            { id: 'stats', label: 'Overview', icon: Shield },
                            { id: 'armory', label: 'The Armory', icon: Rocket },
                            { id: 'ai', label: 'AI Multi-Model', icon: Clock },
                            { id: 'payouts', label: 'Payout Queue', icon: Coins }
                        ] as const).map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setAffiliateSubTab(sub.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${affiliateSubTab === sub.id ? 'bg-white/10 text-white shadow-xl' : 'text-foreground/30 hover:text-white/60'}`}
                            >
                                <sub.icon size={12} />
                                {sub.label}
                            </button>
                        ))}
                    </div>

                    {affiliateSubTab === 'stats' && (
                        <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-gold-accent/10 blur-[50px] rounded-full animate-pulse" />
                                <div className="relative p-8 rounded-full bg-white/[0.02] border border-white-border/10">
                                    <Shield size={48} className="text-gold-accent/20" />
                                </div>
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Integrated <span className="text-gold-accent">Affiliate Hub</span></h3>
                                <p className="text-[10px] font-bold text-foreground/30 leading-relaxed uppercase tracking-[0.2em]">Pusat komando mitigasi kustom, managemen amunisi, dan orkestrasi AI.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full max-w-lg pt-8">
                                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white-border/5 space-y-3">
                                    <Coins size={20} className="text-green-500/40" />
                                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Total Pending Payout</div>
                                    <div className="text-xl font-black text-foreground">Rp 0</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white-border/5 space-y-3">
                                    <Rocket size={20} className="text-blue-500/40" />
                                    <div className="text-xl font-black text-foreground">0 Member</div>
                                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">Active Affiliates</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {affiliateSubTab === 'armory' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[2.5rem] p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-foreground uppercase italic tracking-widest">Master <span className="text-gold-accent">Assets</span></h4>
                                    <button className="p-2 rounded-xl bg-white/5 text-foreground/40 hover:text-white transition-all">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.02]">
                                        <Upload size={32} className="text-foreground/10" />
                                    </div>
                                    <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Drag & drop Master Video/Image di sini</p>
                                </div>
                            </div>
                            <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[2.5rem] p-8 space-y-6">
                                <h4 className="text-xs font-black text-foreground uppercase italic tracking-widest">Template <span className="text-gold-accent">Overlay</span></h4>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white-border/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gold-accent/10 flex items-center justify-center">
                                                <User size={14} className="text-gold-accent" />
                                            </div>
                                            <span className="text-[9px] font-black text-foreground/60 uppercase">Affiliate Name Overlay</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-gold-accent">Enabled</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white-border/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <Link size={14} className="text-green-500" />
                                            </div>
                                            <span className="text-[9px] font-black text-foreground/60 uppercase">WhatsApp Link QR Code</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-green-500">Enabled</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {affiliateSubTab === 'ai' && (
                        <div className="bg-[#0F0F11]/50 border border-white-border/5 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="max-w-xl">
                                <h4 className="text-xs font-black text-foreground uppercase italic tracking-widest mb-2">AI <span className="text-gold-accent">Multi-Model Orchestrator</span></h4>
                                <p className="text-[9px] font-bold text-foreground/30 uppercase leading-relaxed tracking-widest font-mono">Status: Military Grade Auto-Fallback Active</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Primary: GROK 3 API</label>
                                        <input type="password" value="••••••••••••••••" readOnly className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2.5 text-[10px] font-bold text-gold-accent" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Fallback 1: GEMINI 1.5 PRO</label>
                                        <input type="password" placeholder="Input Gemini API Key..." className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2.5 text-[10px] font-bold placeholder:text-white/5 focus:outline-none focus:border-gold-accent/40" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Fallback 2: GPT-4O</label>
                                        <input type="password" placeholder="Input OpenAI API Key..." className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2.5 text-[10px] font-bold placeholder:text-white/5 focus:outline-none focus:border-gold-accent/40" />
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-gold-accent/[0.03] border border-gold-accent/10 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-gold-accent" />
                                        <h5 className="text-[10px] font-black text-gold-accent uppercase tracking-[0.2em]">Master Prompt Engine</h5>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-white-border/5 text-[9px] font-bold text-foreground/40 leading-relaxed uppercase tracking-widest font-mono italic">
                                        &quot;You are the Creative Director of IndoAi. Your voice transcends technology. Write executive-level hook for [EVENT_NAME]...&quot;
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <button className="text-[8px] font-black text-gold-accent uppercase tracking-widest hover:underline transition-all">Edit Master Prompt</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {affiliateSubTab === 'payouts' && (
                        <div className="rounded-[2rem] border border-white-border/5 bg-[#0A0A0B]/40 overflow-hidden relative min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
                            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-5 rounded-full bg-white/[0.02] border border-white-border/10">
                                    <CheckCircle2 size={32} className="text-foreground/10" />
                                </div>
                                <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Antrean pembayaran komisi kosong.</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : activeTab === 'config' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Tiers Management */}
                    <div className="bg-[#0F0F11]/30 border border-white-border/5 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-foreground/60 uppercase italic tracking-[0.2em]">Membership <span className="text-gold-accent">TAGS</span></h4>
                            <button
                                onClick={() => setIsAddTierModalOpen(!isAddTierModalOpen)}
                                className={`p-1.5 rounded-lg border transition-all ${isAddTierModalOpen ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold-accent/10 border-gold-accent/20 text-gold-accent hover:bg-gold-accent hover:text-background'}`}
                            >
                                {isAddTierModalOpen ? <XCircle size={12} /> : <Plus size={12} />}
                            </button>
                        </div>

                        {isAddTierModalOpen && (
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Nama Membership TAG</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Premium Master"
                                        value={newTierData.label}
                                        onChange={(e) => setNewTierData({ ...newTierData, label: e.target.value })}
                                        className="w-full bg-black/40 border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:outline-none focus:border-gold-accent/30 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Pilih Identitas Warna</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PREMIUM_COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setNewTierData({ ...newTierData, color: c.value })}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${newTierData.color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!newTierData.label) return showToast('Nama Tier wajib diisi', 'error');
                                        const value = newTierData.label.toLowerCase().replace(/\s+/g, '_');
                                        const { error } = await supabase.from('membership_tiers').insert([{
                                            label: newTierData.label,
                                            value,
                                            color: newTierData.color,
                                            sort_order: membershipTiers.length + 1
                                        }]);
                                        if (error) showToast(error.message, 'error');
                                        else {
                                            showToast('Tier ditambahkan!', 'success');
                                            setNewTierData({ label: '', color: '#ffffff' });
                                            setIsAddTierModalOpen(false);
                                            fetchConfig();
                                        }
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-gold-accent text-background font-black text-[9px] uppercase tracking-widest shadow-lg shadow-gold-accent/10 active:scale-[0.98] transition-all"
                                >
                                    Create Membership TAG
                                </button>
                            </div>
                        )}
                        <Reorder.Group axis="y" values={membershipTiers} onReorder={handleReorderTiers} className="space-y-1.5">
                            {membershipTiers.map(tier => (
                                <React.Fragment key={tier.id}>
                                    <Reorder.Item
                                        value={tier}
                                        className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/[0.015] border border-white-border/5 group cursor-grab active:cursor-grabbing hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical size={12} className="text-foreground/10 group-hover:text-gold-accent/40" />
                                            <span
                                                className="text-[9px] font-black uppercase tracking-widest p-1.5 px-3 rounded-lg border bg-black/20"
                                                style={{
                                                    color: tier.color || '#ffffff',
                                                    borderColor: `${tier.color}22` || 'rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                {tier.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTier(tier);
                                                    setEditTierData({ label: tier.label, color: tier.color || '#ffffff' });
                                                }}
                                                className="p-1.5 text-gold-accent/30 hover:text-gold-accent transition-all"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Hapus tier ini?')) {
                                                        const { error } = await supabase.from('membership_tiers').delete().eq('id', tier.id);
                                                        if (error) showToast(error.message, 'error');
                                                        else { showToast('Tier dihapus!', 'success'); fetchConfig(); }
                                                    }
                                                }}
                                                className="p-1.5 text-red-500/30 hover:text-red-500 transition-all"
                                            >
                                                <XCircle size={12} />
                                            </button>
                                        </div>
                                    </Reorder.Item>

                                    {editingTier?.id === tier.id && (
                                        <div className="p-4 rounded-2xl bg-gold-accent/[0.02] border border-gold-accent/10 space-y-4 my-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Edit Nama TAG</label>
                                                <input
                                                    type="text"
                                                    value={editTierData.label}
                                                    onChange={(e) => setEditTierData({ ...editTierData, label: e.target.value })}
                                                    className="w-full bg-black/40 border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:outline-none focus:border-gold-accent/30 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Ubah Identitas Warna</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {PREMIUM_COLORS.map(c => (
                                                        <button
                                                            key={c.value}
                                                            onClick={() => setEditTierData({ ...editTierData, color: c.value })}
                                                            className={`w-5 h-5 rounded-full border-2 transition-all ${editTierData.color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                            style={{ backgroundColor: c.value }}
                                                            title={c.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingTier(null)}
                                                    className="flex-1 py-2 rounded-xl bg-white/5 text-foreground/30 font-black text-[8px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!editTierData.label) return showToast('Nama Tier wajib diisi', 'error');
                                                        const value = editTierData.label.toLowerCase().replace(/\s+/g, '_');
                                                        const { error } = await supabase.from('membership_tiers')
                                                            .update({
                                                                label: editTierData.label,
                                                                value,
                                                                color: editTierData.color
                                                            })
                                                            .eq('id', tier.id);

                                                        if (error) showToast(error.message, 'error');
                                                        else {
                                                            showToast('Tier diperbarui!', 'success');
                                                            setEditingTier(null);
                                                            fetchConfig();
                                                        }
                                                    }}
                                                    className="flex-[2] py-2 rounded-xl bg-gold-accent text-background font-black text-[8px] uppercase tracking-widest shadow-lg shadow-gold-accent/10 active:scale-[0.98] transition-all"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </Reorder.Group>
                    </div>

                    {/* Badges Management */}
                    <div className="bg-[#0F0F11]/30 border border-white-border/5 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-foreground/60 uppercase italic tracking-[0.2em]">Badge <span className="text-gold-accent">Levels</span></h4>
                            <button
                                onClick={async () => {
                                    const label = prompt('Masukkan Label Badge:');
                                    if (label) {
                                        const value = label.toLowerCase().replace(/\s+/g, '_');
                                        const { error } = await supabase.from('badge_levels').insert([{ label, value, sort_order: badgeLevels.length + 1 }]);
                                        if (error) showToast(error.message, 'error');
                                        else { showToast('Badge ditambahkan!', 'success'); fetchConfig(); }
                                    }
                                }}
                                className="p-1.5 rounded-lg bg-gold-accent/10 border border-gold-accent/20 text-gold-accent hover:bg-gold-accent hover:text-background transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <Reorder.Group axis="y" values={badgeLevels} onReorder={handleReorderBadges} className="space-y-1.5">
                            {badgeLevels.map(badge => (
                                <Reorder.Item
                                    key={badge.id}
                                    value={badge}
                                    className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/[0.015] border border-white-border/5 group cursor-grab active:cursor-grabbing hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical size={12} className="text-foreground/10 group-hover:text-gold-accent/40" />
                                        <PremiumBadge level={badge.value} />
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm('Hapus badge ini?')) {
                                                const { error } = await supabase.from('badge_levels').delete().eq('id', badge.id);
                                                if (error) showToast(error.message, 'error');
                                                else { showToast('Badge dihapus!', 'success'); fetchConfig(); }
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500/30 hover:text-red-500 transition-all"
                                    >
                                        <XCircle size={12} />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>

                    {/* General Config Notice */}
                    <div className="md:col-span-2 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white-border/5 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                            <Settings size={32} />
                        </div>
                        <h4 className="text-xl font-bold italic tracking-tight uppercase">General <span className="text-gold-accent">Settings</span></h4>
                        <p className="text-xs text-foreground/40 max-w-sm">Kelola pengaturan dasar membership dan badge. Pengaturan WhatsApp kini memiliki menu sendiri di Sidebar untuk kemudahan akses.</p>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/5 w-full text-left">
                            <h5 className="text-[8px] font-black uppercase tracking-widest text-foreground/40 mb-2">Notice:</h5>
                            <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-wider italic">
                                Konfigurasi Membership TAG dan Badge Level berdampak langsung pada hak akses member di landing page.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Compact Legend */}
            <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white-border/5 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-accent shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Profil Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Akun Ditangguhkan</span>
                </div>
                <div className="flex items-center gap-2 ml-auto text-right">
                    <span className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] italic">Sinkronisasi Supabase Real-time Aktif</span>
                </div>
            </div>
        </div>
    );
};
