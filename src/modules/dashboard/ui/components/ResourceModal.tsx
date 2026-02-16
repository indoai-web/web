'use client';

import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Link as LinkIcon, Video, FileText, Image as ImageIcon, ChevronDown, CheckCircle2, Check, Plus, GripVertical, Upload } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

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

const getTagColor = (tag: string) => {
    let hash = 0;
    const str = tag.toLowerCase().trim();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % (PREMIUM_COLORS.length - 1);
    return PREMIUM_COLORS[colorIndex].value;
};

interface ResourceModalProps {
    type: 'material' | 'tool';
    availableTags: string[];
    onClose: () => void;
    onRefresh: () => void;
    initialMetaData?: {
        group_name: string;
        allowed_tiers: string[];
        is_special_offer?: boolean;
        price?: number;
        member_discount?: number;
        commission_per_sale?: number;
        sale_description?: string;
        direct_checkout_url?: string;
    };
    initialItems?: any[];
}

export const ResourceModal: React.FC<ResourceModalProps> = ({ type, availableTags, onRefresh, onClose, initialMetaData, initialItems }) => {
    const [loading, setLoading] = useState(false);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [metaData, setMetaData] = useState({
        group_name: initialMetaData?.group_name || '',
        allowed_tiers: initialMetaData?.allowed_tiers || ['sultan'],
        is_special_offer: initialMetaData?.is_special_offer || false,
        price: initialMetaData?.price || 0,
        member_discount: initialMetaData?.member_discount || 0,
        commission_per_sale: initialMetaData?.commission_per_sale || 0,
        sale_description: initialMetaData?.sale_description || '',
        direct_checkout_url: initialMetaData?.direct_checkout_url || ''
    });

    // Ensure initial items have a temporary ID for Reorder if not present
    const processedInitialItems = initialItems?.map((item, idx) => ({
        ...item,
        _reorderId: item.id || `temp-${Date.now()}-${idx}`
    })) || [
            { title: '', category: 'link', content_url: '', _reorderId: `temp-${Date.now()}-0` }
        ];

    const [lessons, setLessons] = useState(processedInitialItems);

    const standardTags = [
        { id: 'free', label: 'Free' },
        { id: 'premium', label: 'PRO' },
        { id: 'elite', label: 'Elite' },
        { id: 'sultan', label: 'Sultan' },
    ];

    const categories = [
        { id: 'link', label: 'Link', icon: LinkIcon },
        { id: 'video', label: 'Video', icon: Video },
        { id: 'pdf', label: 'PDF', icon: FileText },
        { id: 'image', label: 'Asset', icon: ImageIcon },
    ];

    const [isOpenTags, setIsOpenTags] = useState(false);
    const [searchTag, setSearchTag] = useState('');

    const [openCategoryIdx, setOpenCategoryIdx] = useState<number | null>(null);

    const toggleTag = (tagId: string) => {
        setMetaData(prev => ({
            ...prev,
            allowed_tiers: prev.allowed_tiers.includes(tagId)
                ? prev.allowed_tiers.filter(t => t !== tagId)
                : [...prev.allowed_tiers, tagId]
        }));
    };

    const addLesson = () => {
        setLessons([...lessons, { title: '', category: 'link', content_url: '', _reorderId: `temp-${Date.now()}-${lessons.length}` }]);
    };

    const removeLesson = (reorderId: string) => {
        const itemToRemove = lessons.find(l => l._reorderId === reorderId);
        if (itemToRemove?.id) {
            setDeletedIds(prev => [...prev, itemToRemove.id]);
        }
        if (lessons.length > 1) {
            setLessons(lessons.filter(l => l._reorderId !== reorderId));
        } else {
            setLessons([{ title: '', category: 'link', content_url: '', _reorderId: `temp-${Date.now()}-0` }]);
        }
    };

    const updateLesson = (idx: number, field: string, value: string) => {
        const newLessons = [...lessons];
        newLessons[idx] = { ...newLessons[idx], [field]: value };
        setLessons(newLessons);
        setOpenCategoryIdx(null); // Auto close after select
    };

    const handleFileUpload = async (idx: number, file: File) => {
        setUploadingIdx(idx);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                updateLesson(idx, 'content_url', data.url);
                // Auto-detect category
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (['mp4', 'mkv', 'mov'].includes(ext || '')) updateLesson(idx, 'category', 'video');
                else if (['pdf'].includes(ext || '')) updateLesson(idx, 'category', 'pdf');
                else if (['jpg', 'png', 'webp', 'gif'].includes(ext || '')) updateLesson(idx, 'category', 'image');
            } else {
                alert('Upload gagal: ' + data.error);
            }
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setUploadingIdx(null);
        }
    };

    const getFullColor = (tag: string) => {
        const standard = standardTags.find(s => s.id === tag.toLowerCase());
        if (standard?.id === 'premium') return '#3b82f6';
        if (standard?.id === 'elite') return '#06b6d4';
        if (standard?.id === 'sultan') return '#fbbf24';
        if (standard?.id === 'free') return '#a3ff12';
        return getTagColor(tag);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (metaData.allowed_tiers.length === 0) {
            alert('Pilih minimal satu TAG yang diizinkan!');
            return;
        }

        const validLessons = lessons
            .filter(l => l.title.trim() !== '' && l.content_url.trim() !== '')
            .map((l, sort_order) => {
                const { _reorderId, ...rest } = l;
                return { ...rest, sort_order };
            });

        if (validLessons.length === 0 && deletedIds.length === 0) {
            alert('Isi minimal satu judul materi dan URL.');
            return;
        }

        setLoading(true);
        try {
            const items = validLessons.map(l => ({
                ...l,
                ...metaData,
                type
            }));

            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, deletedIds, type })
            });

            const json = await res.json();
            if (json.success) {
                onRefresh();
                onClose();
            } else {
                alert('Gagal menyimpan: ' + json.error);
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.8)] z-[110] overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gold-accent/15 to-transparent pointer-events-none" />

                <div className="relative h-full max-h-[90vh] flex flex-col">
                    {/* Header Slim */}
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gold-accent rounded-2xl flex items-center justify-center shadow-lg shadow-gold-accent/20">
                                <Plus size={20} className="text-background" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter italic text-gold-accent">
                                    Workshop <span className="text-white">Builder</span>
                                </h2>
                                <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Slim Edition • Drag & Sync</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/5 text-foreground/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

                            {/* SECTION 1: MAIN - Slimmed */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-1">Event Title</label>
                                        <input
                                            required
                                            value={metaData.group_name}
                                            onChange={e => setMetaData({ ...metaData, group_name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-gold-accent/30 transition-all placeholder:text-white/10"
                                            placeholder="cth: Workshop Video AI"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-1">Kasta Utama (Badges)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {standardTags.map(t => {
                                                const isActive = metaData.allowed_tiers.includes(t.id);
                                                const color = getFullColor(t.id);
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => toggleTag(t.id)}
                                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${isActive ? '' : 'opacity-30 hover:opacity-100'}`}
                                                        style={isActive ? { borderColor: `${color}44`, color: color, backgroundColor: `${color}11` } : { borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                                                    >
                                                        {t.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 relative">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 ml-1">Materi Tags</label>
                                    <div
                                        onClick={() => setIsOpenTags(!isOpenTags)}
                                        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[12px] font-bold rounded-xl flex items-center justify-between hover:border-gold-accent/30 transition-all cursor-pointer min-h-[48px]"
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {metaData.allowed_tiers.some(tag => !standardTags.some(st => st.id === tag.toLowerCase())) ? (
                                                metaData.allowed_tiers
                                                    .filter(tag => !standardTags.some(st => st.id === tag.toLowerCase()))
                                                    .map(v => (
                                                        <span key={v} className="px-2.5 py-1 rounded-md border border-gold-accent/20 bg-gold-accent/5 text-gold-accent text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                            {v}
                                                            <X size={10} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTag(v); }} />
                                                        </span>
                                                    ))
                                            ) : (
                                                <span className="text-white/10 italic">Tambah materi tags (Opsional)</span>
                                            )}
                                        </div>
                                        <ChevronDown size={14} className={`text-white/20 transition-transform ${isOpenTags ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isOpenTags && (
                                        <>
                                            <div className="fixed inset-0 z-[120]" onClick={() => setIsOpenTags(false)} />
                                            <div className="absolute top-full left-0 right-0 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-[130] p-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                                                <input
                                                    autoFocus
                                                    value={searchTag}
                                                    onChange={e => setSearchTag(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[12px] font-bold focus:outline-none mb-1"
                                                    placeholder="Cari tag..."
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                                    {availableTags
                                                        .filter(tag => tag && !standardTags.some(st => st.id === tag.toLowerCase()))
                                                        .filter(tag => tag.toLowerCase().includes(searchTag.toLowerCase()))
                                                        .map(tag => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => toggleTag(tag)}
                                                                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${metaData.allowed_tiers.includes(tag) ? 'bg-gold-accent/10 text-gold-accent' : 'hover:bg-white/5 text-white/40'}`}
                                                            >
                                                                {tag}
                                                                {metaData.allowed_tiers.includes(tag) && <Check size={12} />}
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* SECTION 1.5: COMMERCE & AFFILIATE */}
                                <div className="p-6 rounded-[24px] bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <Plus size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 italic">Internal Marketplace</h3>
                                                <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">Jual materi ini ke member & buka sistem afiliasi</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMetaData({ ...metaData, is_special_offer: !metaData.is_special_offer })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${metaData.is_special_offer ? 'bg-indigo-500' : 'bg-white/5 border border-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${metaData.is_special_offer ? 'right-1 bg-white' : 'left-1 bg-white/20'}`} />
                                        </button>
                                    </div>

                                    {metaData.is_special_offer && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-500 pt-2">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Harga Normal (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={metaData.price}
                                                    onChange={e => setMetaData({ ...metaData, price: Number(e.target.value) })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-indigo-500/30"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Harga Member (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={metaData.member_discount}
                                                    onChange={e => setMetaData({ ...metaData, member_discount: Number(e.target.value) })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-[#a3ff12]/30 text-[#a3ff12]"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Komisi Afiliasi (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={metaData.commission_per_sale}
                                                    onChange={e => setMetaData({ ...metaData, commission_per_sale: Number(e.target.value) })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-gold-accent/30 text-gold-accent"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="col-span-full space-y-1.5 pt-1">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Ringkasan Penawaran (Tampil di Katalog)</label>
                                                <input
                                                    value={metaData.sale_description}
                                                    onChange={e => setMetaData({ ...metaData, sale_description: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-indigo-500/30"
                                                    placeholder="Contoh: Akses eksklusif materi strategi AI Masterclass..."
                                                />
                                            </div>
                                            <div className="col-span-full space-y-1.5">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Direct Checkout URL (Opsional)</label>
                                                <input
                                                    value={metaData.direct_checkout_url}
                                                    onChange={e => setMetaData({ ...metaData, direct_checkout_url: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold focus:outline-none focus:border-indigo-500/30 text-blue-400"
                                                    placeholder="https://lynk.id/your-product..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* SECTION 2: CHILD (Daftar Bab) - Drag & Drop Content */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-3.5 bg-teal-accent/50 rounded-full" />
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white/60">Daftar Materi</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addLesson}
                                        className="px-5 py-2 rounded-xl bg-teal-accent/5 text-teal-accent border border-teal-accent/10 hover:bg-teal-accent hover:text-background transition-all text-[9px] font-black uppercase tracking-[0.2em]"
                                    >
                                        + Tambah Bab
                                    </button>
                                </div>

                                <Reorder.Group axis="y" values={lessons} onReorder={setLessons} className="space-y-2">
                                    {lessons.map((lesson, idx) => (
                                        <Reorder.Item
                                            key={lesson._reorderId}
                                            value={lesson}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileDrag={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                            className="grid grid-cols-12 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl relative group hover:bg-white/[0.025] transition-colors"
                                        >
                                            <div className="col-span-[0.5] flex items-center justify-center cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors">
                                                <GripVertical size={16} />
                                            </div>

                                            <div className="col-span-[5.5] md:col-span-4 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-white/20 ml-0.5">Judul Bab {idx + 1}</label>
                                                <input
                                                    required
                                                    value={lesson.title}
                                                    onChange={e => updateLesson(idx, 'title', e.target.value)}
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3.5 py-2.5 text-[12px] font-bold focus:outline-none focus:border-teal-accent/30 placeholder:text-white/5"
                                                    placeholder="Input Judul..."
                                                />
                                            </div>

                                            <div className="col-span-3 md:col-span-3 space-y-1.5 relative">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-white/20 ml-0.5">Tipe</label>
                                                <div
                                                    onClick={() => setOpenCategoryIdx(openCategoryIdx === idx ? null : idx)}
                                                    className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2.5 text-[12px] font-bold flex items-center justify-between cursor-pointer hover:border-teal-accent/30 transition-all uppercase tracking-wider"
                                                >
                                                    <span className="truncate">{categories.find(c => c.id === lesson.category)?.label}</span>
                                                    <ChevronDown size={14} className={`text-white/20 transition-transform ${openCategoryIdx === idx ? 'rotate-180' : ''}`} />
                                                </div>

                                                {openCategoryIdx === idx && (
                                                    <>
                                                        <div className="fixed inset-0 z-[120]" onClick={() => setOpenCategoryIdx(null)} />
                                                        <div className="absolute top-full left-0 right-0 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-[130] p-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                                                            {categories.map(c => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => updateLesson(idx, 'category', c.id)}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${lesson.category === c.id ? 'bg-teal-accent/10 text-teal-accent' : 'hover:bg-white/5 text-white/40'}`}
                                                                >
                                                                    <c.icon size={14} />
                                                                    {c.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="col-span-4 md:col-span-4 space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-white/20 ml-0.5">Link / File</label>
                                                <div className="relative group/input">
                                                    <input
                                                        required
                                                        value={lesson.content_url}
                                                        onChange={e => updateLesson(idx, 'content_url', e.target.value)}
                                                        className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-3.5 pr-10 py-2.5 text-[12px] font-bold focus:outline-none focus:border-teal-accent/30 placeholder:text-white/5 truncate"
                                                        placeholder="URL atau Upload..."
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={uploadingIdx !== null}
                                                        onClick={() => fileInputRefs.current[idx]?.click()}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-white/5 border border-white/5 flex items-center justify-center text-teal-accent hover:bg-teal-accent hover:text-background transition-all disabled:opacity-50"
                                                    >
                                                        {uploadingIdx === idx ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                                    </button>
                                                    <input
                                                        type="file"
                                                        ref={el => { fileInputRefs.current[idx] = el; }}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(idx, file);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeLesson(lesson._reorderId)}
                                                className="absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                            >
                                                <X size={12} />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        </div>

                        {/* Footer Compact */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <div className="hidden sm:block">
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest italic">Ready to Sync: {lessons.length} Chapters</p>
                            </div>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-7 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/30"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || uploadingIdx !== null}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 py-3 px-10 rounded-xl bg-gold-accent text-background text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold-accent/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Sync Workshop
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
