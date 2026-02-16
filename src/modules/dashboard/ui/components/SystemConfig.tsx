'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Palette, Save, Eye, EyeOff, ShieldCheck, Box, Loader2, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

export const SystemConfig: React.FC = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();

    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        site_name: 'IndoAi Studio',
        professional_title: 'Digital Creative Agency',
        primary_color: '#fbbf24',
        system_mode: 'Production'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('module_settings')
                .select('*')
                .eq('module_name', 'system-config')
                .single();

            if (data && data.metadata) {
                setConfig(prev => ({
                    ...prev,
                    ...data.metadata
                }));
            }
        } catch (err) {
            console.error('Failed to fetch system config');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleKeyVisibility = (key: string) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('module_settings')
                .upsert({
                    module_name: 'system-config',
                    is_enabled: true,
                    metadata: config,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToast('Konfigurasi sistem berhasil disimpan!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Gagal menyimpan konfigurasi', 'error');
        } finally {
            setSaving(false);
        }
    };


    const ConfigSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                    <Icon size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );

    const ConfigInput: React.FC<{
        label: string;
        value: string;
        isKey?: boolean;
        id: string;
        onChange: (val: string) => void;
        onTest?: () => void;
        onDelete?: () => void;
        testStatus?: 'idle' | 'loading' | 'success' | 'error';
    }> = ({ label, value, isKey, id, onChange, onTest, onDelete, testStatus }) => (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/10 space-y-2 group hover:border-gold-accent/20 transition-all relative">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{label}</label>
                {isKey && value && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-lg text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            title="Hapus Key"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>
            <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                    <input
                        type={isKey && !showKeys[id] ? 'password' : 'text'}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-bold text-foreground focus:outline-none focus:ring-0 py-1 pr-10"
                        placeholder={isKey ? '••••••••••••••••' : `Enter ${label}`}
                    />
                    {isKey && (
                        <button
                            onClick={() => toggleKeyVisibility(id)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-gold-accent transition-colors"
                        >
                            {showKeys[id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
                {isKey && (
                    <button
                        onClick={onTest}
                        disabled={!value || testStatus === 'loading'}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${testStatus === 'success'
                            ? 'bg-green-500/20 text-green-500 border border-green-500/20'
                            : testStatus === 'error'
                                ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                                : 'bg-white/5 text-foreground/40 hover:bg-white/10 hover:text-gold-accent'
                            } disabled:opacity-20`}
                    >
                        {testStatus === 'loading' ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : testStatus === 'success' ? (
                            <CheckCircle2 size={12} />
                        ) : (
                            <Play size={12} />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {testStatus === 'success' ? 'Ready' : 'Test'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="text-gold-accent animate-spin" size={32} />
        </div>
    );

    return (
        <div className="space-y-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 border-b border-white-border/5">
                <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground/80">System Configuration</h3>
                    <p className="text-[10px] font-bold text-gold-accent uppercase tracking-widest">Administrative Control Panel</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-accent text-background font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-gold-accent/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Deploy Changes'}
                </button>
            </div>


            {/* Branding Settings */}
            <ConfigSection title="Branding & Identity" icon={Globe}>
                <ConfigInput
                    label="System Name"
                    id="site"
                    value={config.site_name}
                    onChange={(v) => setConfig({ ...config, site_name: v })}
                />
                <ConfigInput
                    label="Professional Title"
                    id="title"
                    value={config.professional_title}
                    onChange={(v) => setConfig({ ...config, professional_title: v })}
                />
            </ConfigSection>

            {/* Aesthetic Control */}
            <ConfigSection title="Aesthetic Engine" icon={Palette}>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/10 flex items-center justify-between">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Primary Accent</label>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gold-accent shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            <span className="text-sm font-bold text-foreground/80 uppercase">Golden Premium</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-gold-accent/40 uppercase tracking-widest bg-gold-accent/5 px-2 py-1 rounded-md">Locked per Branding</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white-border/10 flex items-center justify-between">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Interface Mode</label>
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                            <ShieldCheck size={14} className="text-gold-accent" />
                            <span>PRODUCTION MODE</span>
                        </div>
                    </div>
                </div>
            </ConfigSection>


            {/* Notice Footer */}
            <div className="p-6 rounded-3xl bg-gold-accent/5 border border-gold-accent/10 flex items-start gap-4">
                <Box className="text-gold-accent shrink-0" size={24} />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gold-accent">Keamanan System</h4>
                    <p className="text-xs text-gold-accent/60 leading-relaxed">
                        Seluruh kunci API dan konfigurasi sensitif disimpan dengan enkripsi tingkat lanjut di database Supabase Anda.
                        Pastikan Anda tidak membagikan akses Dashboard ini kepada pihak yang tidak berwenang.
                    </p>
                </div>
            </div>
        </div>
    );
};
