'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/shared/ui/Toast';
import {
    Library,
    Plus,
    FileText,
    Cpu,
    Download,
    ExternalLink,
    Shield,
    Trash2,
    Eye,
    CheckCircle2,
    Clock,
    Lock,
    Coins,
    Loader2
} from 'lucide-react';
import { ResourceModal } from './ResourceModal';
import { WaBlastModal } from './WaBlastModal';
import { AnimatePresence } from 'framer-motion';

interface Material {
    id: string;
    title: string;
    category: string;
    min_badge: string;
    downloads: number;
}

interface AiTool {
    id: string;
    name: string;
    owner: string;
    status: 'Approved' | 'Pending';
    is_public: boolean;
}

const MOCK_MATERIALS: Material[] = [
    { id: '1', title: 'Strategi AI Marketing 2026', category: 'PDF', min_badge: 'VIP', downloads: 145 },
    { id: '2', title: 'Prompt Engineering Masterclass', category: 'Video', min_badge: 'Sultan', downloads: 89 },
];

const MOCK_TOOLS: AiTool[] = [
    { id: '1', name: 'Nano Banana Automation', owner: 'Admin', status: 'Approved', is_public: true },
    { id: '2', name: 'Batik Pattern Generator', owner: 'Member: Budi', status: 'Pending', is_public: true },
];

export const FacilityCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'materials' | 'tools'>('materials');
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<{ meta: any, items: any[] } | null>(null);
    const [isWaBlastModalOpen, setIsWaBlastModalOpen] = useState(false);
    const [isWaConnected, setIsWaConnected] = useState(false);
    const [isCheckingWa, setIsCheckingWa] = useState(true);
    const { showToast } = useToast();

    const checkWaStatus = async () => {
        try {
            const res = await fetch('/api/wa/status');
            const json = await res.json();

            // Check connection status in multiple places for robustness
            const deviceList = Array.isArray(json.data) ? json.data : (json.data?.device ? [json.data] : []);
            const connected = (
                ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(json.device_status?.toLowerCase()) ||
                deviceList.some((d: any) => {
                    const s = typeof d.status === 'string' ? d.status : (typeof d.device_status === 'string' ? d.device_status : '');
                    return ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(s.toLowerCase());
                })
            );

            setIsWaConnected(connected);
        } catch (err) {
            console.error('Failed to check WA status in Facility Center');
        } finally {
            setIsCheckingWa(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const fetchAvailableTags = async () => {
        try {
            const res = await fetch('/api/dashboard/available-tags');
            const json = await res.json();
            if (json.success) setAvailableTags(json.tags);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus resource ini?')) return;
        try {
            const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                fetchResources();
            } else {
                alert('Gagal menghapus: ' + json.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    React.useEffect(() => {
        fetchResources();
        fetchAvailableTags();
        checkWaStatus();
    }, []);

    const handleLaunchBlast = () => {
        if (!isWaConnected) {
            showToast('Pairing dulu Bos di menu WhatsApp Center agar bisa kirim Blast!', 'info');
            return;
        }
        setIsWaBlastModalOpen(true);
    };

    const filteredMaterials = resources.filter(r => r.type === 'material');
    const filteredTools = resources.filter(r => r.type === 'tool');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground/80 lowercase italic">Facility & <span className="text-gold-accent">Resources</span></h2>
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Manage Materials and AI Assets Distribution</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-gold-accent/20"
                >
                    <Plus size={14} /> Add New {activeTab === 'materials' ? 'Material' : 'Tool'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white-border/5 w-fit">
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'materials' ? 'bg-gold-accent/10 text-gold-accent' : 'text-foreground/40 hover:text-foreground/60'}`}
                >
                    <Library size={14} /> Library Materi
                </button>
                <button
                    onClick={() => setActiveTab('tools')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-gold-accent/10 text-gold-accent' : 'text-foreground/40 hover:text-foreground/60'}`}
                >
                    <Cpu size={14} /> AI Tools Sharing
                </button>
            </div>

            {/* Content Table */}
            <div className="rounded-[2.5rem] border border-white-border/5 bg-white/[0.01] overflow-hidden backdrop-blur-sm min-h-[200px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="w-8 h-8 border-2 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
                    </div>
                )}

                {activeTab === 'materials' ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white-border/5">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">Resource Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">TAG Required</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">Stats</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-border/5 text-[11px] font-bold">
                            {(() => {
                                // Grouping logic for Unique Project View
                                const projectsMap: Record<string, { meta: any, items: any[] }> = {};
                                const standaloneItems: any[] = [];

                                filteredMaterials.forEach(m => {
                                    if (m.group_name) {
                                        if (!projectsMap[m.group_name]) {
                                            projectsMap[m.group_name] = {
                                                meta: { group_name: m.group_name, allowed_tiers: m.allowed_tiers },
                                                items: []
                                            };
                                        }
                                        projectsMap[m.group_name].items.push(m);
                                    } else {
                                        standaloneItems.push(m);
                                    }
                                });

                                return [
                                    ...Object.entries(projectsMap).map(([name, group]) => (
                                        <tr key={name} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gold-accent/5 flex items-center justify-center border border-gold-accent/10 group-hover:border-gold-accent/30 transition-all">
                                                        <Library size={22} className="text-gold-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black tracking-tight text-foreground/80 lowercase italic">{name}</p>
                                                        <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-0.5">{group.items.length} Materials Inside</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {group.meta.allowed_tiers.map((tier: string) => (
                                                        <span key={tier} className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${tier === 'sultan' ? 'border-gold-accent/30 text-gold-accent bg-gold-accent/5' :
                                                            tier === 'elite' ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/5' :
                                                                tier === 'premium' ? 'border-blue-400/30 text-blue-400 bg-blue-400/5' :
                                                                    'border-white/10 text-white/40'
                                                            }`}>
                                                            {tier === 'premium' ? 'PRO' : tier}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    {group.items.some(m => m.is_special_offer) && (
                                                        <div className="flex items-center gap-1.5 text-indigo-400 font-black">
                                                            <Coins size={12} />
                                                            <span className="text-[10px] uppercase tracking-wider">💰 Marketplace</span>
                                                        </div>
                                                    )}
                                                    {group.items.every(m => !m.content_url) ? (
                                                        <div className="flex items-center gap-1.5 text-red-500 font-black animate-pulse">
                                                            <Clock size={12} className="animate-spin-slow" />
                                                            <span className="text-[10px] uppercase tracking-wider">⚠️ Input Materi!</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-foreground/20 font-black">
                                                            <CheckCircle2 size={12} className="text-green-500/40" />
                                                            <span className="text-[10px] uppercase tracking-wider">Project Active</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProject({ meta: group.meta, items: group.items });
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gold-accent font-black text-[9px] uppercase tracking-[0.2em] hover:bg-gold-accent hover:text-background transition-all shadow-lg shadow-gold-accent/5"
                                                >
                                                    Manage Workshop
                                                </button>
                                            </td>
                                        </tr>
                                    )),
                                    ...standaloneItems.map(m => (
                                        <tr key={m.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-accent/30 transition-all">
                                                        <FileText size={22} className="text-foreground/40 group-hover:text-gold-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black tracking-tight text-foreground/80">{m.title}</p>
                                                        <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-0.5">{m.category} DOCUMENT</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {m.allowed_tiers.map((tier: string) => (
                                                        <span key={tier} className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${tier === 'sultan' ? 'border-gold-accent/30 text-gold-accent bg-gold-accent/5' :
                                                            tier === 'elite' ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/5' :
                                                                tier === 'premium' ? 'border-blue-400/30 text-blue-400 bg-blue-400/5' :
                                                                    'border-white/10 text-white/40'
                                                            }`}>
                                                            {tier === 'premium' ? 'PRO' : tier}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 lowercase">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {m.is_special_offer && (
                                                        <div className="flex items-center gap-1.5 text-indigo-400 font-black">
                                                            <Coins size={12} />
                                                            <span className="text-[10px] uppercase tracking-wider">💰 Marketplace</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 text-foreground/20">
                                                        <Download size={12} />
                                                        <span className="text-[10px] font-bold">{m.downloads_count || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => {
                                                        setSelectedProject({
                                                            meta: {
                                                                group_name: m.group_name || m.title,
                                                                allowed_tiers: m.allowed_tiers,
                                                                is_special_offer: m.is_special_offer,
                                                                price: m.price,
                                                                member_discount: m.member_discount,
                                                                commission_per_sale: m.commission_per_sale,
                                                                sale_description: m.sale_description,
                                                                direct_checkout_url: m.direct_checkout_url
                                                            },
                                                            items: [m]
                                                        });
                                                        setIsModalOpen(true);
                                                    }} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-gold-accent transition-all">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(m.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-red-400 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ];
                            })()}
                            {filteredMaterials.length === 0 && !loading && (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest italic">No materials found</td></tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white-border/5">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">Tool Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">Allowed TAGs</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-border/5">
                            {filteredTools.map(t => (
                                <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-accent/30 group-hover:bg-gold-accent/5 transition-all">
                                                <Cpu size={18} className="text-gold-accent/60 group-hover:text-gold-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black tracking-tight text-foreground/80">{t.name || t.title}</p>
                                                <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">SHARED TOOL</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {t.allowed_tiers.map((tier: string) => (
                                                <span key={tier} className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${tier === 'sultan' ? 'border-gold-accent/30 text-gold-accent bg-gold-accent/5' : tier === 'premium' ? 'border-blue-400/30 text-blue-400 bg-blue-400/5' : 'border-white/10 text-white/40'}`}>
                                                    {tier}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle2 size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => window.open(t.content_url, '_blank')}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-gold-accent hover:border-gold-accent/20 transition-all font-bold text-[9px] uppercase tracking-widest px-4"
                                            >
                                                Open <ExternalLink size={12} className="inline ml-1" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-red-400 hover:border-red-400/20 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTools.length === 0 && !loading && (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest italic">No tools found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* WA Blast Panel */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white-border/5 space-y-4">
                <div className="flex items-center gap-3 text-gold-accent">
                    <Shield size={20} />
                    <h3 className="text-sm font-black tracking-widest uppercase">Member Broadcast Control</h3>
                </div>
                <p className="text-[10px] font-bold text-foreground/30 leading-relaxed max-w-2xl lowercase">
                    Gunakan panel ini untuk menginformasikan materi atau tools baru kepada member secara massal via WhatsApp. Sistem akan mengirimkan pesan otomatis sesuai dengan TAG yang dipilih.
                </p>
                <div className="pt-4">
                    <button
                        onClick={handleLaunchBlast}
                        disabled={isCheckingWa}
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all relative ${isWaConnected
                            ? 'bg-green-500 text-background hover:brightness-110 shadow-lg shadow-green-500/20'
                            : 'bg-white/5 border border-gold-accent/20 text-gold-accent hover:bg-gold-accent hover:text-background'
                            } ${isCheckingWa ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isCheckingWa ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" /> Checking System...
                            </div>
                        ) : (
                            isWaConnected ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Launch WhatsApp Blast Center
                                </div>
                            ) : (
                                'Launch WhatsApp Blast Center'
                            )
                        )}
                    </button>
                    {!isWaConnected && !isCheckingWa && (
                        <p className="mt-4 text-[9px] font-bold text-red-500/40 uppercase tracking-widest italic animate-pulse">
                            * Perangkat belum tertaut. Silakan pairing di menu WhatsApp Center.
                        </p>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ResourceModal
                        type={activeTab === 'materials' ? 'material' : 'tool'}
                        availableTags={availableTags}
                        initialMetaData={selectedProject?.meta}
                        initialItems={selectedProject?.items}
                        onClose={handleCloseModal}
                        onRefresh={() => {
                            fetchResources();
                            fetchAvailableTags();
                        }}
                    />
                )}
                {isWaBlastModalOpen && (
                    <WaBlastModal
                        isOpen={isWaBlastModalOpen}
                        onClose={() => setIsWaBlastModalOpen(false)}
                        availableTags={availableTags}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

