'use client';

import React, { useState } from 'react';
import { X, Save, User, Shield, Phone, Mail, Rocket, XCircle, ChevronDown, Check, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

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

const getTagColor = (tag: string, membershipTiers: any[]) => {
    const tierCfg = membershipTiers.find(t => t.value === tag);
    if (tierCfg?.color) return tierCfg.color;

    let hash = 0;
    const str = tag.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % (PREMIUM_COLORS.length - 1);
    return PREMIUM_COLORS[colorIndex].value;
};

interface CustomDropdownProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}

const MultiSelectDropdown: React.FC<{
    label: string;
    selectedValues: string[];
    options: { label: string; value: string; color?: string; category?: string }[];
    onChange: (values: string[]) => void;
}> = ({ label, selectedValues, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const toggleOption = (val: string) => {
        if (selectedValues.includes(val)) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange([...selectedValues, val]);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        opt.value.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-1.5 relative">
            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/[0.02] border border-white-border/10 px-4 py-2 text-[10px] font-bold text-left flex items-center justify-between hover:border-gold-accent/20 transition-all focus:outline-none min-h-[38px] ${isOpen ? 'rounded-t-xl border-b-transparent ring-1 ring-gold-accent/20' : 'rounded-xl'}`}
            >
                <div className="flex flex-wrap gap-1">
                    {(() => {
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

                        const tiers = normalizeTiers(selectedValues);

                        if (tiers.length > 0) {
                            return tiers.map(v => {
                                const color = getTagColor(v, options);
                                const opt = options.find(o => o.value === v);
                                return (
                                    <span
                                        key={v}
                                        className="px-2 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-wider"
                                        style={{
                                            color: color,
                                            borderColor: `${color}44`,
                                            backgroundColor: `${color}11`
                                        }}
                                    >
                                        {opt?.label || v}
                                    </span>
                                );
                            });
                        }
                        return <span className="text-foreground/20 italic">Select Access TAGs...</span>;
                    })()}
                </div>
                <ChevronDown size={14} className={`text-foreground/20 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[calc(100%-1px)] left-0 right-0 bg-[#141417] border border-white-border/10 border-t-gold-accent/10 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[120] p-1.5 animate-in fade-in slide-in-from-top-1 duration-200 origin-top overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-white-border/5">
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tiers or program tags..."
                                className="w-full bg-white/5 border border-white-border/10 rounded-lg px-3 py-1.5 text-[9px] font-bold focus:outline-none focus:border-gold-accent/40"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = selectedValues.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => toggleOption(opt.value)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mb-0.5 last:mb-0 ${isSelected ? 'bg-gold-accent/20 text-gold-accent border border-gold-accent/20' : 'hover:bg-white/5 text-foreground/40 hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${isSelected ? 'border-transparent' : 'border-gold-accent/40'}`}
                                                    style={{ backgroundColor: isSelected ? opt.color : 'transparent' }}
                                                >
                                                    {isSelected && <Check size={8} className="text-black" />}
                                                </div>
                                                <span
                                                    className="transition-colors"
                                                    style={{ color: isSelected ? opt.color : 'inherit' }}
                                                >
                                                    {opt.label}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-[8px] font-bold text-foreground/10 uppercase tracking-widest">No matching options</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="space-y-1.5 relative">
            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/[0.02] border border-white-border/10 px-4 py-2 text-[10px] font-bold text-left flex items-center justify-between hover:border-gold-accent/20 transition-all focus:outline-none ${isOpen ? 'rounded-t-xl border-b-transparent ring-1 ring-gold-accent/20' : 'rounded-xl'}`}
            >
                <span className="uppercase tracking-wider">{selectedOption.label}</span>
                <ChevronDown size={14} className={`text-foreground/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[calc(100%-1px)] left-0 right-0 bg-[#141417] border border-white-border/10 border-t-gold-accent/10 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[120] p-1.5 animate-in fade-in slide-in-from-top-1 duration-200 origin-top">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${value === opt.value ? 'bg-gold-accent text-background shadow-lg shadow-gold-accent/20' : 'hover:bg-white/5 text-foreground/40 hover:text-white'}`}
                            >
                                {opt.label}
                                {value === opt.value && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

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

interface MemberModalProps {
    mode: 'add' | 'edit';
    member?: Member | null;
    membershipTiers: any[];
    badgeLevels: any[];
    availableTags: string[];
    onClose: () => void;
    onRefresh: () => void;
}


export const MemberModal: React.FC<MemberModalProps> = ({ mode, member, membershipTiers, badgeLevels, availableTags, onClose, onRefresh }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: member?.full_name || '',
        email: member?.email || '',
        phone_number: member?.phone_number || '',
        membership_tier: (() => {
            const raw = member?.membership_tier as any;
            const normalizeTiers = (val: any): string[] => {
                let result: string[] = [];
                if (Array.isArray(val)) {
                    val.forEach(item => {
                        if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']')) {
                            try {
                                const parsed = JSON.parse(item);
                                if (Array.isArray(parsed)) result.push(...parsed);
                                else result.push(item);
                            } catch (e) { result.push(item); }
                        } else { result.push(item); }
                    });
                } else if (typeof val === 'string') {
                    if (val.startsWith('[') && val.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(val);
                            if (Array.isArray(parsed)) result.push(...parsed);
                            else result.push(val);
                        } catch (e) { result.push(val); }
                    } else { result.push(val); }
                }
                return result.filter(Boolean);
            };
            return normalizeTiers(raw);
        })(),
        badge_level: member?.badge_level?.toLowerCase() || 'member',
        assigned_landing_page: member?.assigned_landing_page || 'v1',
        is_active: member?.is_active ?? true,
        notes: member?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'edit' && member) {
                const { error } = await supabase
                    .from('profiles')
                    .update(formData)
                    .eq('id', member.id);

                if (error) throw error;
                showToast('Profil member berhasil diperbarui!', 'success');
            } else {
                // For 'add', we normally need to handle auth.signUp or a custom edge function
                // For simplicity in this admin dashboard, we'll assume an admin can insert directly
                // (Though usually auth is handled separately)
                const { error } = await supabase
                    .from('profiles')
                    .insert([{ ...formData }]);

                if (error) throw error;
                showToast('Member baru berhasil ditambahkan ke database.', 'success');

                // OTOMASI WA: Notifikasi Selamat Datang (Tanpa await agar tidak blocking UI)
                if (formData.phone_number) {
                    fetch('/api/wa/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            targets: [formData.phone_number],
                            message: `Halo *${formData.full_name}*, selamat bergabung di *IndoAi Member Hub*! 🚀\n\nAkun kamu sudah aktif dengan akses *${formData.membership_tier.join(', ').toUpperCase()}*. Silakan login untuk mulai mengakses materi premium.\n\n_Pesan otomatis dari IndoAi Management_`
                        })
                    }).catch(err => console.error('WA Welcome Failed:', err));
                }
            }
            onRefresh();
            onClose();
        } catch (error: any) {
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#0F0F11] border border-white-border/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header - Slimmer */}
                <div className="px-8 py-5 border-b border-white-border/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <h3 className="text-lg font-black text-foreground/90 uppercase italic tracking-tight">
                            {mode === 'add' ? 'Add' : 'Edit'} <span className="text-gold-accent">Member</span>
                        </h3>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Profile Configuration</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-foreground/40">
                        <X size={18} />
                    </button>
                </div>

                {/* Form - More Compact */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Full Name</label>
                            <input
                                required
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5"
                                placeholder="Enter full name..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5"
                                placeholder="name@email.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">WhatsApp Phone</label>
                            <div className="relative group">
                                <Phone size={10} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-gold-accent transition-colors" />
                                <input
                                    value={formData.phone_number}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (val.startsWith('0')) {
                                            val = '62' + val.slice(1);
                                        }
                                        setFormData({ ...formData, phone_number: val });
                                    }}
                                    placeholder="628..."
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <CustomDropdown
                            label="Target Landing Page"
                            value={formData.assigned_landing_page}
                            onChange={(val) => setFormData({ ...formData, assigned_landing_page: val })}
                            options={[
                                { label: 'Edition V1 (Agency)', value: 'v1' },
                                { label: 'Edition V3 (Webinar)', value: 'v3' },
                                { label: 'Edition V4 (Sultan)', value: 'v4' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-4">
                            <MultiSelectDropdown
                                label="Member Access TAGs (Program & Tiers)"
                                selectedValues={formData.membership_tier}
                                onChange={(vals) => setFormData({ ...formData, membership_tier: vals })}
                                options={[
                                    ...membershipTiers.map(t => ({ label: t.label, value: t.value, color: t.color })),
                                    ...availableTags
                                        .filter(tag => !membershipTiers.some(t => t.value.toLowerCase() === tag.toLowerCase()))
                                        .map(tag => ({ label: tag, value: tag }))
                                ]}
                            />
                        </div>

                        <div className="space-y-4">
                            <CustomDropdown
                                label="Badge Level"
                                value={formData.badge_level}
                                onChange={(val) => setFormData({ ...formData, badge_level: val as any })}
                                options={badgeLevels.map(b => ({ label: b.label, value: b.value }))}
                            />
                            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white-border/5 space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20">Active Access Keys:</p>
                                <div className="flex flex-wrap gap-1">
                                    {formData.membership_tier.map(tier => {
                                        const color = getTagColor(tier, membershipTiers);
                                        return (
                                            <span key={tier}
                                                className="px-2 py-0.5 rounded-md border text-gold-accent text-[7px] font-black uppercase flex items-center gap-1 group"
                                                style={{
                                                    color: color,
                                                    borderColor: `${color}33`,
                                                    backgroundColor: `${color}11`
                                                }}
                                            >
                                                {tier === 'premium' ? 'PRO' : tier}
                                                {!membershipTiers.some(t => t.value === tier) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, membership_tier: formData.membership_tier.filter(v => v !== tier) })}
                                                        className="hover:text-white"
                                                    >
                                                        <X size={8} />
                                                    </button>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Catatan :</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-3 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5 min-h-[80px] resize-none"
                            placeholder="Tulis catatan perilaku member di sini..."
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${formData.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                        >
                            <Shield size={12} /> {formData.is_active ? 'Akun Aktif' : 'Akun Ditangguhkan'}
                        </button>

                        <button
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold-accent text-background font-black text-[9px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-gold-accent/20 disabled:opacity-50"
                        >
                            {loading ? <Save size={14} className="animate-spin" /> : <Save size={14} />}
                            {mode === 'add' ? 'Create Account' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DeleteConfirmModalProps {
    member: Member;
    onClose: () => void;
    onRefresh: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ member, onClose, onRefresh }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (member.role === 'admin') {
            showToast('Akun Admin dilindungi dan tidak dapat dihapus.', 'error');
            onClose();
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', member.id);

            if (error) throw error;
            showToast('Data member telah berhasil dihapus.', 'success');
            onRefresh();
            onClose();
        } catch (error: any) {
            showToast(`Gagal menghapus: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-[#0F0F11] border border-red-500/20 rounded-[2rem] shadow-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <XCircle size={32} className="text-red-500" />
                </div>

                <h3 className="text-xl font-black text-foreground/90 uppercase italic mb-2">Hapus <span className="text-red-500">Member?</span></h3>
                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest leading-loose mb-8">
                    Data member <span className="text-white">{member.full_name}</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={loading || member.role === 'admin'}
                        className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : member.role === 'admin' ? 'PROTECTED' : ' YA, HAPUS PERMANEN'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                    >
                        Batalkan
                    </button>
                </div>
            </div>
        </div>
    );
};
