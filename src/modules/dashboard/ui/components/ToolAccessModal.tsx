'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Unlock, Save, Loader2, Package } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

interface PremiumTool {
    id: string;
    name: string;
    badge_text: string;
    allowed_badges?: string[];
    allowed_tags?: string[];
}

interface Member {
    id: string;
    full_name: string;
    allowed_tools: string[];
}

interface ToolAccessModalProps {
    member: Member;
    onClose: () => void;
    onRefresh: () => void;
}

export const ToolAccessModal: React.FC<ToolAccessModalProps> = ({ member, onClose, onRefresh }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();

    const [tools, setTools] = useState<PremiumTool[]>([]);
    const [selectedTools, setSelectedTools] = useState<string[]>(member.allowed_tools || []);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTools = async () => {
            const { data } = await supabase
                .from('premium_tools')
                .select('id, name, badge_text, allowed_badges, allowed_tags')
                .order('name');
            if (data) setTools(data);
            setLoading(false);
        };
        fetchTools();
    }, [supabase]);

    const handleToggle = (id: string) => {
        setSelectedTools(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ allowed_tools: selectedTools })
            .eq('id', member.id);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast(`Hak akses Tool untuk ${member.full_name} diperbarui`, 'success');
            onRefresh();
            onClose();
        }
        setSaving(false);
    };

    const publicTools = tools.filter(t => (t.allowed_badges?.length || 0) > 0 || (t.allowed_tags?.length || 0) > 0);
    const specialTools = tools.filter(t => (t.allowed_badges?.length || 0) === 0 && (t.allowed_tags?.length || 0) === 0);

    const renderToolItem = (tool: PremiumTool) => {
        const isGranted = selectedTools.includes(tool.id);
        return (
            <button
                key={tool.id}
                onClick={() => handleToggle(tool.id)}
                className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${isGranted ? 'bg-gold-accent/5 border-gold-accent/20 text-gold-accent' : 'bg-white/[0.02] border-white-border/5 text-foreground/40 hover:border-white/10'}`}
            >
                <div className="flex items-center gap-3">
                    <Package size={14} className={isGranted ? 'text-gold-accent' : 'text-foreground/10'} />
                    <div className="text-left">
                        <div className="text-[10px] font-black uppercase tracking-tight italic">{tool.name}</div>
                        {tool.badge_text && <div className="text-[7px] font-bold opacity-40 uppercase">{tool.badge_text}</div>}
                    </div>
                </div>
                {isGranted ? <Unlock size={14} /> : <Lock size={14} className="opacity-20" />}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0F0F11] border border-white-border/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="px-8 py-6 border-b border-white-border/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <h3 className="text-lg font-black text-foreground/90 uppercase italic tracking-tight">
                            Key <span className="text-gold-accent">Permissions</span>
                        </h3>
                        <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">{member.full_name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-foreground/40">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={12} className="text-gold-accent" />
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Manual Access Grants</label>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="py-10 flex justify-center">
                                    <Loader2 size={24} className="text-gold-accent animate-spin" />
                                </div>
                            ) : tools.length === 0 ? (
                                <p className="text-[9px] font-bold text-foreground/10 uppercase text-center py-10">No premium tools registered yet.</p>
                            ) : (
                                <>
                                    {specialTools.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="px-3 text-[7px] font-black uppercase text-gold-accent tracking-[0.3em] opacity-50 mb-3">Special Operations (Individual)</div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {specialTools.map(renderToolItem)}
                                            </div>
                                        </div>
                                    )}

                                    {publicTools.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="px-3 text-[7px] font-black uppercase text-foreground/30 tracking-[0.3em] mb-3">General Assets (Tier/Tag Based)</div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {publicTools.map(renderToolItem)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-gold-accent/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};
