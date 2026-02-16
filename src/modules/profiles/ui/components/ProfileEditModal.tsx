'use client';

import React, { useState, useRef } from 'react';
import { X, Save, Camera, Upload, Loader2, User as UserIcon } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';
import { PremiumBadge } from '@/shared/ui/PremiumBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileEditModalProps {
    profile: any;
    onClose: () => void;
    onRefresh: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profile, onClose, onRefresh }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        avatar_url: profile?.avatar_url || ''
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showToast('Hanya file JPG atau PNG yang diperbolehkan.', 'error');
            return;
        }

        if (file.size > 1024 * 1024) {
            showToast('Ukuran file maksimal adalah 1MB.', 'error');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            showToast('Foto profil berhasil diunggah!', 'success');
        } catch (error: any) {
            showToast(`Gagal mengunggah foto: ${error.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    avatar_url: formData.avatar_url,
                })
                .eq('id', profile.id);

            if (error) throw error;

            showToast('Profil berhasil diperbarui!', 'success');
            onRefresh();
            onClose();
        } catch (error: any) {
            showToast(`Gagal memperbarui profil: ${error.message}`, 'error');
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
                className="absolute inset-0 bg-background/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#0F0F11] border border-white-border/10 rounded-[32px] shadow-2xl overflow-hidden z-[110]"
            >
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold-accent/10 to-transparent pointer-events-none" />

                <div className="relative p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic text-gold-accent">Edit <span className="text-white">Profile</span></h2>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Update your personal identity</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/5 text-foreground/20 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[28px] bg-white/[0.03] border-2 border-dashed border-white-border/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-gold-accent/40">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={32} className="text-foreground/10" />
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                                            <Loader2 size={24} className="text-gold-accent animate-spin" />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-xs"
                                    >
                                        <Camera size={20} className="text-white" />
                                    </button>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 scale-75 whitespace-nowrap">
                                    <PremiumBadge level={profile.badge_level} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/jpeg,image/png"
                                />
                            </div>
                            <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest italic">JPG, PNG (Max 1MB)</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Full Name</label>
                                <input
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-gold-accent/40 transition-all placeholder:text-foreground/10"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Phone Number</label>
                                <input
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full bg-white/[0.02] border border-white-border/10 rounded-xl px-4 py-2.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-gold-accent/40 transition-all placeholder:text-foreground/10"
                                    placeholder="e.g. 62812345678"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/40"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-2 flex items-center justify-center gap-2 py-3 px-8 rounded-2xl bg-gold-accent text-background text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold-accent/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
