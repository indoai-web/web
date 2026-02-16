'use client';

import React, { useState } from 'react';
import { X, Save, Link, Group, Calendar, Check, ChevronDown, Copy, Info, Coins, Crown } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

interface CustomDropdownProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}

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

interface InvitationModalProps {
    onClose: () => void;
    onRefresh: () => void;
    membershipTiers: any[];
    badgeLevels: any[];
}

export const InvitationModal: React.FC<InvitationModalProps> = ({ onClose, onRefresh, membershipTiers, badgeLevels }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        membership_tier: 'free',
        badge_level: 'Member',
        wa_group_url: 'https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV',
        expiry_type: '24h',
        assigned_landing_page: 'v1',
        is_discount_enabled: false,
        discount_code: '',
        is_countdown_enabled: false,
        countdown_duration_mins: 80,
        is_affiliate_enabled: false,
        commission_per_sale: 0,
        is_special_offer: false,
        price: 0,
        member_discount: 0,
        product_description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let expires_at = null;
            if (formData.expiry_type === '1h') expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            if (formData.expiry_type === '24h') expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            if (formData.expiry_type === '7d') expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { error } = await supabase
                .from('invitations')
                .insert([{
                    title: formData.title,
                    slug: formData.slug.toLowerCase().replace(/ /g, '-'),
                    membership_tier: formData.membership_tier,
                    badge_level: formData.badge_level,
                    wa_group_url: formData.wa_group_url,
                    assigned_landing_page: formData.assigned_landing_page,
                    is_discount_enabled: formData.is_discount_enabled,
                    discount_code: formData.discount_code,
                    is_countdown_enabled: formData.is_countdown_enabled,
                    countdown_duration_mins: formData.countdown_duration_mins,
                    is_affiliate_enabled: formData.is_affiliate_enabled,
                    commission_per_sale: formData.commission_per_sale,
                    is_special_offer: formData.is_special_offer,
                    price: formData.price,
                    member_discount: formData.member_discount,
                    product_description: formData.product_description,
                    expires_at
                }]);

            if (error) throw error;

            // AUTO-SYNC: Create a placeholder in Workshop Builder
            try {
                await fetch('/api/resources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{
                            title: `[INPUT MATERI] ${formData.title}`,
                            category: 'link',
                            content_url: '', // Empty URL to trigger warning
                            allowed_tiers: [formData.membership_tier],
                            group_name: formData.title,
                            type: 'material'
                        }],
                        type: 'material'
                    })
                });
            } catch (err) {
                console.error('Auto-sync Workshop failed:', err);
                // We don't throw here to not block the event creation success
            }

            showToast('Event Link berhasil dibuat!', 'success');
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
                <div className="px-8 py-5 border-b border-white-border/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <h3 className="text-lg font-black text-foreground/90 uppercase italic tracking-tight">
                            Create <span className="text-gold-accent">Event Link</span>
                        </h3>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Exclusive Invitation Logic</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-foreground/40">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Event Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5"
                            placeholder="e.g. Join Member VIP / Friday Sale"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">URL Slug</label>
                                <div className="relative group/tooltip">
                                    <Info
                                        size={10}
                                        className="text-gold-accent/40 cursor-help hover:text-gold-accent transition-colors"
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#1A1A1E] border border-white-border/10 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                                        <p className="text-[9px] font-bold text-foreground/60 leading-relaxed uppercase tracking-widest">
                                            Gunakan <span className="text-gold-accent">huruf kecil</span> & <span className="text-gold-accent">tanda hubung (-)</span> sebagai pengganti spasi. <br /> Contoh: <span className="italic text-white/40">friday-sale</span>
                                        </p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1A1A1E]" />
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <Link size={10} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" />
                                <input
                                    required
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5"
                                    placeholder="friday-sale"
                                />
                            </div>
                        </div>
                        <CustomDropdown
                            label="Link Expiry"
                            value={formData.expiry_type}
                            onChange={(val) => setFormData({ ...formData, expiry_type: val })}
                            options={[
                                { label: '1 Jam', value: '1h' },
                                { label: '24 Jam', value: '24h' },
                                { label: '7 Hari', value: '7d' },
                                { label: 'Selamanya', value: 'never' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">WA Group URL</label>
                        <div className="relative">
                            <Group size={10} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" />
                            <input
                                required
                                value={formData.wa_group_url}
                                onChange={e => setFormData({ ...formData, wa_group_url: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all"
                                placeholder="https://chat.whatsapp.com/..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <CustomDropdown
                            label="Auto-TAG Assignment"
                            value={formData.membership_tier}
                            onChange={(val) => setFormData({ ...formData, membership_tier: val })}
                            options={membershipTiers?.map(t => ({ label: t.label, value: t.value })) || []}
                        />
                        <CustomDropdown
                            label="Auto-Badge Level"
                            value={formData.badge_level}
                            onChange={(val) => setFormData({ ...formData, badge_level: val })}
                            options={badgeLevels || []}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <CustomDropdown
                            label="Target Landing Page"
                            value={formData.assigned_landing_page}
                            onChange={(val) => setFormData({ ...formData, assigned_landing_page: val })}
                            options={[
                                { label: 'V1 - Digital Agency', value: 'v1' },
                                { label: 'V2 - Tech Modern', value: 'v2' },
                                { label: 'V3 - Batik Cyber', value: 'v3' },
                                { label: 'V4 - Minimalist', value: 'v4' }
                            ]}
                        />
                        <div className="space-y-1.5 flex flex-col justify-end">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Discount System</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_discount_enabled: !formData.is_discount_enabled })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.is_discount_enabled ? 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent' : 'bg-white/[0.02] border-white-border/10 text-foreground/40'}`}
                            >
                                <div className={`w-3 h-3 rounded-full transition-all ${formData.is_discount_enabled ? 'bg-gold-accent shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-foreground/20'}`} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{formData.is_discount_enabled ? 'Enabled' : 'Disabled'}</span>
                            </button>
                        </div>
                    </div>

                    {formData.is_discount_enabled && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Voucher Code (Neon Green State)</label>
                                <div className="relative group/tooltip">
                                    <Info
                                        size={10}
                                        className="text-gold-accent/40 cursor-help hover:text-gold-accent transition-colors"
                                    />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#1A1A1E] border border-white-border/10 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                                        <p className="text-[9px] font-bold text-foreground/60 leading-relaxed uppercase tracking-widest">
                                            Pastikan KODE ini sudah <span className="text-gold-accent">Sesuai/Aktif</span> di platform <span className="text-gold-accent">lynk.id</span> atau alat pembayaran lainnya.
                                        </p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1A1A1E]" />
                                    </div>
                                </div>
                            </div>
                            <input
                                value={formData.discount_code}
                                onChange={e => setFormData({ ...formData, discount_code: e.target.value })}
                                className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all placeholder:text-white/5"
                                placeholder="e.g. INDOAI_SPECIAL"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white-border/5">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Affiliate Program</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_affiliate_enabled: !formData.is_affiliate_enabled })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.is_affiliate_enabled ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/[0.02] border-white-border/10 text-foreground/40'}`}
                            >
                                <Coins size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{formData.is_affiliate_enabled ? 'Affiliate Active' : 'Off'}</span>
                            </button>
                        </div>
                        {formData.is_affiliate_enabled && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Commission (IDR)</label>
                                <input
                                    type="number"
                                    value={formData.commission_per_sale}
                                    onChange={e => setFormData({ ...formData, commission_per_sale: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-green-500/40 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-green-500"
                                    placeholder="e.g. 50000"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white-border/5">
                        <div className="space-y-1.5 focus-within:ring-1 focus-within:ring-gold-accent/20 transition-all rounded-xl p-0.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Special Internal Offer</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_special_offer: !formData.is_special_offer })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all w-full ${formData.is_special_offer ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.02] border-white-border/10 text-foreground/40'}`}
                            >
                                <Crown size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{formData.is_special_offer ? 'Offer Active' : 'Off'}</span>
                            </button>
                        </div>
                        {formData.is_special_offer && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#a3ff12] ml-1">Member Price (Nett)</label>
                                <input
                                    type="number"
                                    value={formData.member_discount}
                                    onChange={e => setFormData({ ...formData, member_discount: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-[#a3ff12]/40 focus:outline-none transition-all text-[#a3ff12]"
                                    placeholder="e.g. 99000"
                                />
                            </div>
                        )}
                    </div>

                    {formData.is_special_offer && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Normal Price</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-white-border/20 focus:outline-none transition-all text-white/40 line-through decoration-red-500/50"
                                    placeholder="e.g. 199000"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Product Intro</label>
                                <textarea
                                    value={formData.product_description}
                                    onChange={e => setFormData({ ...formData, product_description: e.target.value })}
                                    rows={1}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all resize-none overflow-hidden"
                                    placeholder="Short hook..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white-border/5">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Countdown Clock</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_countdown_enabled: !formData.is_countdown_enabled })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.is_countdown_enabled ? 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent' : 'bg-white/[0.02] border-white-border/10 text-foreground/40'}`}
                            >
                                <Calendar size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{formData.is_countdown_enabled ? 'Timer Active' : 'Off'}</span>
                            </button>
                        </div>
                        {formData.is_countdown_enabled && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    value={formData.countdown_duration_mins}
                                    onChange={e => setFormData({ ...formData, countdown_duration_mins: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2 text-[10px] font-bold focus:border-gold-accent/40 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold-accent text-background font-black text-[9px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-gold-accent/20 disabled:opacity-50"
                        >
                            {loading ? <LoaderAnimation /> : <Save size={14} />}
                            Generate Event Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LoaderAnimation = () => (
    <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce" />
    </div>
);
