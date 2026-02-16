'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    MessageSquare,
    Users,
    Send,
    Shield,
    CheckCircle2,
    Loader2,
    Coins,
    Crown,
    Star,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/shared/ui/Toast';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

interface WaBlastModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableTags: string[];
}

export const WaBlastModal: React.FC<WaBlastModalProps> = ({ isOpen, onClose, availableTags }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [targetCount, setTargetCount] = useState(0);
    const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    // Count targets based on selected tags
    useEffect(() => {
        const countTargets = async () => {
            if (selectedTags.length === 0) {
                setTargetCount(0);
                return;
            }

            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .contains('membership_tier', selectedTags);

            if (!error) setTargetCount(count || 0);
        };

        countTargets();
    }, [selectedTags]);

    const handleSendBlast = async () => {
        if (selectedTags.length === 0) return showToast('Pilih minimal satu target TAG!', 'error');
        if (!message) return showToast('Pesan tidak boleh kosong!', 'error');

        setLoading(true);
        setSendingStatus('sending');

        try {
            // 1. Get all target phone numbers
            const { data: targets, error: targetError } = await supabase
                .from('profiles')
                .select('phone_number')
                .contains('membership_tier', selectedTags);

            if (targetError) throw targetError;

            const phoneNumbers = targets
                .map(t => t.phone_number)
                .filter(p => !!p);

            if (phoneNumbers.length === 0) {
                showToast('Tidak ada nomor WA di kategori ini!', 'error');
                setSendingStatus('idle');
                setLoading(false);
                return;
            }

            // 2. Call Send API
            const res = await fetch('/api/wa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targets: phoneNumbers,
                    message: message
                })
            });

            const json = await res.json();
            if (json.success) {
                showToast(`Blast Terkirim ke ${phoneNumbers.length} Member!`, 'success');
                setSendingStatus('success');
                setTimeout(() => {
                    onClose();
                    setSendingStatus('idle');
                }, 2000);
            } else {
                throw new Error(json.error);
            }

        } catch (error: any) {
            showToast(`Gagal Blast: ${error.message}`, 'error');
            setSendingStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white-border/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white-border/5 bg-gradient-to-r from-green-500/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <MessageSquare size={28} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground lowercase italic">IndoAi <span className="text-green-500">WA Blast Center</span></h3>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Sistem Amunisi Komunikasi Massal</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-xl bg-white/5 text-foreground/20 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Target Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                                <Users size={12} className="text-green-500" /> Pilih Target Audiens (TAG)
                            </label>
                            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                {targetCount} Member Terfilter
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                        )
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${selectedTags.includes(tag)
                                        ? 'bg-green-500 border-green-500 text-background shadow-lg shadow-green-500/20'
                                        : 'bg-white/5 border-white-border/5 text-foreground/40 hover:bg-white/10'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                            <Send size={12} className="text-green-500" /> Draft Amunisi Pesan
                        </label>
                        <div className="relative group">
                            <textarea
                                id="wa-message-area"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tuliskan pesan broadcast di sini... 
Tips: Gunakan [NAMA] untuk menyebut nama member secara otomatis."
                                className="w-full h-48 bg-white/[0.02] border border-white-border/10 rounded-3xl p-6 text-[11px] font-bold text-foreground/80 placeholder:text-foreground/10 focus:outline-none focus:border-green-500/40 transition-all resize-none leading-relaxed"
                            />
                            <div className="absolute right-6 bottom-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        const textarea = document.getElementById('wa-message-area') as HTMLTextAreaElement;
                                        if (textarea) {
                                            const start = textarea.selectionStart;
                                            const end = textarea.selectionEnd;
                                            const newText = message.substring(0, start) + '[NAMA]' + message.substring(end);
                                            setMessage(newText);
                                            // Focus back
                                            setTimeout(() => {
                                                textarea.focus();
                                                textarea.setSelectionRange(start + 6, start + 6);
                                            }, 10);
                                        }
                                    }}
                                    className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-background transition-all flex items-center gap-2 group/btn shadow-lg shadow-green-500/5"
                                    title="Sematkan Tag Nama Member"
                                >
                                    <User size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover/btn:block">Sematkan [NAMA]</span>
                                </button>
                                <div className="p-3 rounded-xl bg-white/5 border border-white-border/5 text-foreground/20">
                                    <Shield size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 gap-6">
                        <div className="flex-1 space-y-1">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Peringatan Keamanan:</p>
                            <p className="text-[8px] font-bold text-foreground/40 leading-relaxed uppercase tracking-wider italic">
                                Jeda antar pesan diatur otomatis (2-5 detik secara acak) oleh sistem untuk meminimalisir risiko blokir WhatsApp.
                            </p>
                        </div>

                        <button
                            onClick={handleSendBlast}
                            disabled={loading || selectedTags.length === 0 || !message}
                            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl relative ${sendingStatus === 'success' ? 'bg-green-500 text-background' :
                                loading ? 'bg-green-500/50 text-background cursor-not-allowed' :
                                    'bg-green-500 text-background hover:brightness-110 active:scale-95 shadow-green-500/20'
                                }`}
                        >
                            {sendingStatus === 'sending' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Sedang Menyerang...
                                </>
                            ) : sendingStatus === 'success' ? (
                                <>
                                    <CheckCircle2 size={16} /> Finish!
                                </>
                            ) : (
                                <>
                                    <Send size={16} /> Luncurkan Amunisi
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress Bar (Fake but encouraging) */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className="h-1 bg-green-500 absolute bottom-0 left-0 shadow-[0_-4px_10px_rgba(34,197,94,0.5)]"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
