import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Shield,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle,
    History,
    Calendar,
    Search,
    RefreshCw,
    XCircle,
    User,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Trash2,
    Check,
    CheckCheck,
    Brain,
    Cpu,
    Key,
    Eye,
    EyeOff,
    Play,
    Save
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

const formatPhone = (phone: string) => {
    if (!phone) return phone;
    // Format: 62-857-2050-5555
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
        return `62-${cleaned.substring(2, 5)}-${cleaned.substring(5, 9)}-${cleaned.substring(9)}`;
    }
    return phone;
};

export const WhatsAppCenter: React.FC = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast, confirm } = useToast();

    const [waConfig, setWaConfig] = useState({ api_token: '', device_id: '' });
    const [waQr, setWaQr] = useState<string | null>(null);
    const [waStatus, setWaStatus] = useState<any>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);

    // Tracking States
    const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'ai'>('config');
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsTotal, setLogsTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // AI Config States
    const [aiConfig, setAiAiConfig] = useState({
        groq_api_key: '',
        gemini_api_key: ''
    });
    const [aiSaving, setAiSaving] = useState(false);
    const [aiTesting, setAiTesting] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
    const [showAiKeys, setShowAiKeys] = useState<Record<string, boolean>>({});

    const fetchConfig = async () => {
        try {
            // Fetch WA Config
            const { data: waData } = await supabase
                .from('module_settings')
                .select('metadata')
                .eq('module_name', 'messaging-wa')
                .single();
            if (waData?.metadata) {
                setWaConfig(waData.metadata as { api_token: string; device_id: string });
            }

            // Fetch AI Config (system-config)
            const { data: aiData } = await supabase
                .from('module_settings')
                .select('metadata')
                .eq('module_name', 'system-config')
                .single();
            if (aiData?.metadata) {
                const meta = aiData.metadata;
                setAiAiConfig({
                    groq_api_key: meta.groq_api_key || '',
                    gemini_api_key: meta.gemini_api_key || meta.openai_api_key || ''
                });
                setAiTesting({
                    groq: meta.groq_api_key ? 'success' : 'idle',
                    gemini: (meta.gemini_api_key || meta.openai_api_key) ? 'success' : 'idle'
                });
            }

            // Check WA Status Initial
            handleCheckWaStatus(true);
        } catch (err) {
            console.error('Failed to fetch configurations');
        } finally {
            setConfigLoading(false);
        }
    };

    const handleSaveAiConfig = async () => {
        setAiSaving(true);
        try {
            // Get current metadata to preserve branding/other settings
            const { data: existingData } = await supabase
                .from('module_settings')
                .select('metadata')
                .eq('module_name', 'system-config')
                .single();

            const { error } = await supabase
                .from('module_settings')
                .upsert({
                    module_name: 'system-config',
                    is_enabled: true,
                    metadata: {
                        ...(existingData?.metadata || {}),
                        ...aiConfig
                    },
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setAiTesting({
                groq: aiConfig.groq_api_key ? 'success' : 'idle',
                gemini: aiConfig.gemini_api_key ? 'success' : 'idle'
            });
            showToast('AI Config berhasil diperbarui!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Gagal menyimpan AI Config', 'error');
        } finally {
            setAiSaving(false);
        }
    };

    const handleTestAiKey = async (provider: 'gemini' | 'groq') => {
        const key = provider === 'gemini' ? aiConfig.gemini_api_key : aiConfig.groq_api_key;
        console.log(`Testing ${provider} key:`, key ? 'Key exists' : 'Key empty');
        if (!key) {
            showToast(`Masukkan API Key ${provider} dulu, Bos!`, 'warning');
            return;
        }

        setAiTesting(prev => ({ ...prev, [provider]: 'loading' }));
        try {
            const res = await fetch('/api/wa/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, apiKey: key })
            });

            const data = await res.json();
            if (data.success) {
                setAiTesting(prev => ({ ...prev, [provider]: 'success' }));
                showToast(`${provider.toUpperCase()} API Key Valid! ✨`, 'success');
            } else {
                setAiTesting(prev => ({ ...prev, [provider]: 'error' }));
                showToast(data.error || 'API Key nggak valid', 'error');
            }
        } catch (err: any) {
            console.error(`AI Test failed for ${provider}:`, err);
            setAiTesting(prev => ({ ...prev, [provider]: 'error' }));
            showToast(`Error: ${err.message || 'Koneksi gagal'}`, 'error');
        }
    };

    const handleDeleteAiKey = (provider: 'gemini' | 'groq') => {
        confirm({
            title: 'Hapus API Key',
            message: `Hapus API Key ${provider}? Bos nanti harus isi ulang lho.`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            variant: 'destructive',
            onConfirm: () => {
                setAiAiConfig(prev => ({ ...prev, [provider === 'gemini' ? 'gemini_api_key' : 'groq_api_key']: '' }));
                setAiTesting(prev => ({ ...prev, [provider]: 'idle' }));
            }
        });
    };

    const fetchLogs = async (page = 1) => {
        setLogsLoading(true);
        setCurrentPage(page);
        try {
            const offset = (page - 1) * logsPerPage;
            const res = await fetch(`/api/wa/logs?limit=${logsPerPage}&offset=${offset}`);
            const json = await res.json();
            if (json.success) {
                setLogs(json.data);
                setLogsTotal(json.total);
            }
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLogsLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        confirm({
            title: 'Hapus Log Terpilih?',
            message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} riwayat pesan secara permanen?`,
            confirmText: 'Ya, Hapus Semua',
            cancelText: 'Batal',
            variant: 'destructive',
            onConfirm: async () => {
                setBulkDeleting(true);
                try {
                    const res = await fetch('/api/wa/logs/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: selectedIds })
                    });
                    const json = await res.json();
                    if (json.success) {
                        showToast(`${selectedIds.length} log berhasil dihapus`, 'success');
                        setSelectedIds([]);
                        fetchLogs(currentPage);
                    } else {
                        showToast(json.error || 'Gagal menghapus log', 'error');
                    }
                } catch (err) {
                    showToast('Koneksi API Gagal', 'error');
                } finally {
                    setBulkDeleting(false);
                }
            }
        });
    };

    const handleResend = async (log: any) => {
        try {
            showToast('Mengirim ulang pesan...', 'info');
            const res = await fetch('/api/wa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targets: [log.phone_number],
                    message: log.message
                })
            });
            const json = await res.json();
            if (json.success) {
                showToast('Pesan dikirim ulang ke antrean!', 'success');
                fetchLogs(currentPage);
            } else {
                showToast(json.error || 'Gagal kirim ulang', 'error');
            }
        } catch (err) {
            showToast('Koneksi API Gagal', 'error');
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    // Robust status detection
    const getDeviceList = () => {
        if (!waStatus) return [];
        if (Array.isArray(waStatus.data)) return waStatus.data;
        if (waStatus.data?.device) return [waStatus.data];
        if (Array.isArray(waStatus)) return waStatus;
        return [];
    };

    const deviceList = getDeviceList();
    const isConnected = (
        ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(waStatus?.device_status?.toLowerCase()) ||
        deviceList.some((d: any) => {
            const s = typeof d.status === 'string' ? d.status : (typeof d.device_status === 'string' ? d.device_status : '');
            return ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(s.toLowerCase());
        })
    );

    // Polling Otomatis:
    // - Setiap 5 detik kalau ada QR (nunggu scan)
    // - Setiap 15 detik kalau Offline & gak ada QR (cek background recovery)
    useEffect(() => {
        const interval = setInterval(() => {
            if (waQr || !isConnected) {
                handleCheckWaStatus(true); // silent check
            }
        }, waQr ? 5000 : 15000);
        return () => clearInterval(interval);
    }, [waQr, isConnected]);

    const handleCheckWaStatus = async (silent = false) => {
        if (!silent) setStatusLoading(true);
        try {
            const res = await fetch(`/api/wa/status?t=${Date.now()}`);
            let json: any = {};
            try {
                json = await res.json();
            } catch (jsonErr) {
                console.error('API Status returned non-JSON response');
            }

            // Simpan seluruh object response buat diagnosa mateng
            setWaStatus(json);

            if (json.status) {
                if (!silent) showToast('Status WA diperbarui.', 'success');

                // Cari status connect di mana saja
                const currentDeviceList = Array.isArray(json.data) ? json.data : (json.data?.device ? [json.data] : []);
                const connected = (
                    ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(json.device_status?.toLowerCase()) ||
                    currentDeviceList.some((d: any) =>
                        ['connected', 'connect', 'active', 'authenticated', 'ready', 'on'].includes(d.status?.toLowerCase())
                    )
                );

                if (connected) setWaQr(null);
            } else if (!json.status && !silent) {
                showToast(json.detail || json.reason || 'Gagal ambil status', 'error');
            }
        } catch (err) {
            console.error('Failed to check status');
            if (!silent) showToast('Koneksi internet/API bermasalah', 'error');
        } finally {
            if (!silent) setStatusLoading(false);
        }
    };

    const handleFetchQr = async (autoSave = false) => {
        setQrLoading(true);
        setWaQr(null);
        try {
            if (autoSave) {
                if (!waConfig.api_token) {
                    showToast('Harap masukkan API Token terlebih dahulu!', 'error');
                    setQrLoading(false);
                    return;
                }
                const { error } = await supabase
                    .from('module_settings')
                    .upsert({
                        module_name: 'messaging-wa',
                        metadata: waConfig,
                        is_enabled: true
                    }, { onConflict: 'module_name' });

                if (error) {
                    showToast('Gagal simpan config: ' + error.message, 'error');
                    setQrLoading(false);
                    return;
                }
            }

            const res = await fetch('/api/wa/qr');
            let json: any = {};
            try {
                json = await res.json();
            } catch (jsonErr) {
                console.error('API QR returned non-JSON response');
            }

            if (json && json.status) {
                if (json.url === 'ALREADY_CONNECTED') {
                    showToast('Perangkat sudah terhubung, tidak perlu pemindaian ulang.', 'success');
                    handleCheckWaStatus();
                } else if (json.url && json.url !== 'None' && json.url !== 'error') {
                    setWaQr(json.url);
                    showToast('QR Code siap! Silakan dipindai.', 'success');
                } else if (json.message?.toLowerCase().includes('already connected') || json.detail?.toLowerCase().includes('already connected')) {
                    showToast('Perangkat sudah terhubung, tidak perlu pemindaian ulang.', 'success');
                    handleCheckWaStatus();
                } else {
                    showToast('Format QR tidak dikenali. Silakan cek token.', 'error');
                }
            } else {
                showToast(json.detail || 'Gagal generate QR', 'error');
            }
        } catch (err) {
            showToast('Koneksi API Gagal', 'error');
        } finally {
            setQrLoading(false);
        }
    };

    const handleDisconnect = async () => {
        confirm({
            title: 'Konfirmasi Pemutusan',
            message: 'Apakah Anda yakin ingin memutuskan koneksi perangkat ini?',
            confirmText: 'Ya, Putuskan',
            cancelText: 'Batal',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    setQrLoading(true);
                    const res = await fetch('/api/wa/disconnect', { method: 'POST' });
                    const json = await res.json();

                    if (json.status) {
                        showToast('Koneksi perangkat berhasil diputuskan!', 'success');
                        setWaQr(null);
                        setWaStatus(null);
                        handleCheckWaStatus(true);
                    } else {
                        showToast(json.detail || 'Gagal melakukan pemutusan koneksi', 'error');
                    }
                } catch (err) {
                    showToast('Koneksi API Gagal', 'error');
                } finally {
                    setQrLoading(false);
                }
            }
        });
    };

    if (configLoading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 size={32} className="animate-spin text-green-500" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground/80 lowercase italic">WhatsApp <span className="text-green-500">Command Center</span></h2>
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Manage Gateway, Pairing, and Broadcast Systems</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {isConnected ? 'System Online' : 'System Offline'}
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white-border/5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-green-500 text-background shadow-lg shadow-green-500/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                >
                    <div className="flex items-center gap-2">
                        <Shield size={14} /> Gateway Config
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-green-500 text-background shadow-lg shadow-green-500/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                >
                    <div className="flex items-center gap-2">
                        <History size={14} /> Message Logs
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-gold-accent text-background shadow-lg shadow-gold-accent/10' : 'text-foreground/30 hover:text-foreground/60'}`}
                >
                    <div className="flex items-center gap-2">
                        <Brain size={14} /> AI Assistant
                    </div>
                </button>
            </div>

            {activeTab === 'config' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#0F0F11]/30 border border-white-border/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                                        <MessageSquare size={20} className="text-green-500" />
                                    </div>
                                    <h4 className="text-xs font-black text-foreground/80 uppercase italic tracking-widest">Gateway Configuration</h4>
                                </div>
                                <button
                                    onClick={async () => {
                                        const { error } = await supabase
                                            .from('module_settings')
                                            .upsert({
                                                module_name: 'messaging-wa',
                                                metadata: waConfig,
                                                is_enabled: true
                                            }, { onConflict: 'module_name' });

                                        if (error) showToast(error.message, 'error');
                                        else {
                                            showToast('Konfigurasi WA berhasil disimpan!', 'success');
                                            handleCheckWaStatus();
                                        }
                                    }}
                                    className="px-8 py-3 rounded-2xl bg-green-500 text-background font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    Save Configuration
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 ml-1">API Token</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={waConfig.api_token}
                                            onChange={(e) => setWaConfig({ ...waConfig, api_token: e.target.value })}
                                            placeholder="Paste your token..."
                                            className="w-full bg-black/40 border border-white-border/10 rounded-2xl px-5 py-3 text-[11px] font-bold text-green-500 focus:outline-none focus:border-green-500/40 transition-all"
                                        />
                                        <Shield size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/10" />
                                    </div>
                                </div>
                            </div>

                            {/* QR Pairing Section */}
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white-border/5 space-y-6">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="flex-1 space-y-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Pairing Device</h5>
                                        <p className="text-[9px] font-bold text-foreground/20 leading-relaxed uppercase tracking-wider italic">
                                            Pemindaian QR Code hanya diperlukan satu kali untuk menautkan nomor WhatsApp ke IndoAi. Pastikan perangkat Anda tetap terhubung ke internet.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleFetchQr(true)}
                                                disabled={isConnected}
                                                className="px-6 py-3 rounded-xl bg-white/5 border border-white-border/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                {qrLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                                                Get Pairing QR
                                            </button>
                                            {isConnected ? (
                                                <button
                                                    onClick={handleDisconnect}
                                                    className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                                                >
                                                    <Loader2 size={14} className={qrLoading ? "animate-spin" : "hidden"} />
                                                    Disconnect Device
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleCheckWaStatus()}
                                                    disabled={statusLoading}
                                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white-border/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {statusLoading ? <Loader2 size={14} className="animate-spin text-green-500" /> : <Download size={14} />}
                                                    {statusLoading ? 'Checking...' : 'Check Status'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-[320px] h-[320px] rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white-border/10 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                                        {waQr ? (
                                            <div className={`p-6 bg-white rounded-3xl animate-in zoom-in-95 duration-300 ${isConnected ? 'blur-xl grayscale opacity-50' : ''}`}>
                                                <img src={waQr} alt="WA QR" className="w-[240px] h-[240px]" />
                                                {isConnected && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <CheckCircle2 size={80} className="text-green-500 bg-white rounded-full p-4 shadow-2xl translate-y-[-10px]" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center px-8">
                                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white-border/5">
                                                    <MessageSquare size={40} className="text-foreground/10" />
                                                </div>
                                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Siap Generate QR</p>
                                            </div>
                                        )}
                                        {qrLoading && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md">
                                                <div className="text-center space-y-4">
                                                    <Loader2 size={48} className="text-green-500 animate-spin mx-auto" />
                                                    <p className="text-[9px] font-black text-green-500/50 uppercase tracking-widest">Generating...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className={`
                            border rounded-[2.5rem] p-8 space-y-6 transition-all duration-500
                            ${isConnected
                                ? 'bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20'
                                : 'bg-gradient-to-br from-red-500/5 to-transparent border-white-border/5'}
                        `}>
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <CheckCircle2 size={18} className="text-green-500" />
                                ) : (
                                    <AlertCircle size={18} className="text-red-500/50" />
                                )}
                                <h4 className="text-[10px] font-black text-foreground/60 uppercase italic tracking-widest">
                                    {isConnected ? 'Active Status' : 'Inactive Status'}
                                </h4>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white-border/5">
                                    <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mb-1">Device Name</p>
                                    <p className={`text-sm font-black ${isConnected ? 'text-foreground/80' : 'text-foreground/20'}`}>
                                        {isConnected ? (waStatus?.profile?.name || deviceList[0]?.name || 'Connected') : 'No Device Link'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white-border/5">
                                    <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mb-1">Pairing Number</p>
                                    <p className={`text-sm font-black ${isConnected ? 'text-green-500' : 'text-foreground/20'}`}>
                                        {isConnected ? (waStatus?.profile?.device || deviceList[0]?.number || deviceList[0]?.device) : 'Not Paired'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'logs' ? (
                <div className="rounded-[2.5rem] border border-white-border/5 bg-[#0A0A0B]/40 overflow-hidden relative min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 border-b border-white-border/5 bg-white/[0.02] flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-black text-foreground/80 uppercase italic tracking-widest flex items-center gap-3">
                                <History size={18} className="text-green-500" /> WhatsApp Message Tracking
                            </h4>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest mt-1">Real-time History: {logsTotal} Records</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleting}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                    Hapus ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={() => fetchLogs(currentPage)}
                                disabled={logsLoading}
                                className="p-3 rounded-2xl bg-white/5 border border-white-border/5 text-foreground/40 hover:text-green-500 hover:border-green-500/20 transition-all disabled:opacity-30"
                            >
                                <RefreshCw size={16} className={logsLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left border-collapse table-auto">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#0F0F11] border-b border-white-border/5">
                                    <th className="px-8 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={logs.length > 0 && selectedIds.length === logs.length}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(logs.map(l => l.id));
                                                else setSelectedIds([]);
                                            }}
                                            className="w-4 h-4 rounded border-white-border/10 bg-white/5 checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer accent-green-500"
                                        />
                                    </th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-foreground/30">Timestamp</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-foreground/30">Target Number</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-foreground/30">Message Draft</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-foreground/30">Message ID</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-foreground/30">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white-border/5">
                                {logsLoading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <Loader2 size={32} className="text-green-500 animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Synchronizing Logs...</p>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-xs font-bold text-foreground/10 italic">No message logs found yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className={`group hover:bg-white/[0.03] transition-colors ${selectedIds.includes(log.id) ? 'bg-green-500/5' : ''}`}>
                                            <td className="px-8 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(log.id)}
                                                    onChange={() => {
                                                        setSelectedIds(prev =>
                                                            prev.includes(log.id) ? prev.filter(id => id !== log.id) : [...prev, log.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded border-white-border/10 bg-white/5 checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer accent-green-500"
                                                />
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-foreground/20" />
                                                    <span className="text-[10px] font-bold text-foreground/40">
                                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-green-500/5 flex items-center justify-center border border-green-500/10 group-hover:border-green-500/30 transition-all overflow-hidden">
                                                        {log.profile?.avatar_url ? (
                                                            <img src={log.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} className="text-green-500/40" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-foreground/70">{formatPhone(log.phone_number)}</span>
                                                        {log.profile?.full_name && (
                                                            <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{log.profile.full_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[10px] font-bold text-foreground/30 line-clamp-1 max-w-[250px] italic">
                                                    "{log.message}"
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-mono text-foreground/20 uppercase tracking-widest">
                                                    {log.fonnte_id || '---'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {['sent', 'delivered', 'read'].includes(log.status) ? (
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${log.status === 'read' ? 'text-blue-400 bg-blue-400/10' :
                                                        log.status === 'delivered' ? 'text-foreground/60 bg-white/5' :
                                                            'text-green-500 bg-green-500/10'
                                                        }`}>
                                                        {log.status === 'sent' ? (
                                                            <Check size={12} className="stroke-[3]" />
                                                        ) : (
                                                            <CheckCheck size={12} className={log.status === 'read' ? 'text-blue-400' : 'text-foreground/40'} />
                                                        )}
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full w-fit">
                                                                <XCircle size={12} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Failed</span>
                                                            </div>
                                                            {log.error_message && (
                                                                <p className="text-[8px] font-bold text-red-500/40 uppercase pl-1">{log.error_message}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleResend(log)}
                                                            className="p-2 rounded-lg bg-white/5 text-foreground/20 hover:text-green-500 hover:bg-green-500/10 transition-all"
                                                            title="Kirim Ulang"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {logsTotal > logsPerPage && (
                        <div className="p-6 border-t border-white-border/5 bg-white/[0.01] flex items-center justify-between">
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                                Menampilkan <span className="text-foreground/40">{(currentPage - 1) * logsPerPage + 1} - {Math.min(currentPage * logsPerPage, logsTotal)}</span> Dari <span className="text-green-500">{logsTotal}</span> Data
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchLogs(currentPage - 1)}
                                    disabled={currentPage === 1 || logsLoading}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white-border/5 text-foreground/40 hover:bg-white/10 disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.ceil(logsTotal / logsPerPage))].map((_, i) => {
                                        const p = i + 1;
                                        if (p === 1 || p === Math.ceil(logsTotal / logsPerPage) || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => fetchLogs(p)}
                                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === p ? 'bg-green-500 text-background' : 'bg-white/5 text-foreground/30 hover:bg-white/10'}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        }
                                        if (p === currentPage - 2 || p === currentPage + 2) {
                                            return <span key={p} className="px-1 text-foreground/10">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button
                                    onClick={() => fetchLogs(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(logsTotal / logsPerPage) || logsLoading}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white-border/5 text-foreground/40 hover:bg-white/10 disabled:opacity-20 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#0F0F11]/30 border border-white-border/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gold-accent/10 border border-gold-accent/20">
                                    <Cpu size={20} className="text-gold-accent" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-foreground/80 uppercase italic tracking-widest">AI Intelligence Core</h4>
                                    <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">Configure Wulan Assistant Brains</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveAiConfig}
                                disabled={aiSaving}
                                className="px-8 py-3 rounded-2xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gold-accent/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {aiSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {aiSaving ? 'Saving...' : 'Deploy AI Changes'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { id: 'groq', label: 'Groq API Key', value: aiConfig.groq_api_key, provider: 'groq' as const },
                                { id: 'gemini', label: 'Gemini API Key', value: aiConfig.gemini_api_key, provider: 'gemini' as const }
                            ].map((input) => (
                                <div key={input.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white-border/10 space-y-4 group hover:border-gold-accent/20 transition-all relative">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30">{input.label}</label>
                                        {input.value && (
                                            <button
                                                onClick={() => handleDeleteAiKey(input.provider)}
                                                className="p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Hapus Key"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type={showAiKeys[input.id] ? 'text' : 'password'}
                                                value={input.value}
                                                onChange={(e) => {
                                                    setAiAiConfig({ ...aiConfig, [input.id === 'groq' ? 'groq_api_key' : 'gemini_api_key']: e.target.value });
                                                    setAiTesting({ ...aiTesting, [input.provider]: 'idle' });
                                                }}
                                                placeholder="••••••••••••••••"
                                                className="w-full bg-black/40 border border-white-border/5 rounded-xl px-4 py-2.5 text-[11px] font-bold text-gold-accent focus:outline-none focus:border-gold-accent/40 transition-all pr-10"
                                            />
                                            <button
                                                onClick={() => setShowAiKeys(prev => ({ ...prev, [input.id]: !prev[input.id] }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-gold-accent transition-colors"
                                            >
                                                {showAiKeys[input.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleTestAiKey(input.provider)}
                                            disabled={!input.value || aiTesting[input.provider] === 'loading'}
                                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${aiTesting[input.provider] === 'success'
                                                ? 'bg-green-500/20 text-green-500 border border-green-500/20'
                                                : aiTesting[input.provider] === 'error'
                                                    ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                                                    : 'bg-gold-accent text-background border border-gold-accent/50 hover:brightness-110 active:scale-95 shadow-xl shadow-gold-accent/10'
                                                } disabled:opacity-30 disabled:grayscale transition-all duration-300 font-black`}
                                        >
                                            {aiTesting[input.provider] === 'loading' ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : aiTesting[input.provider] === 'success' ? (
                                                <CheckCircle2 size={12} />
                                            ) : (
                                                <Play size={12} />
                                            )}
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {aiTesting[input.provider] === 'success' ? 'Ready' : 'Test'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-3xl bg-gold-accent/10 border border-gold-accent/10 flex items-start gap-4 backdrop-blur-md shadow-inner">
                            <Brain className="text-gold-accent shrink-0" size={24} />
                            <div className="space-y-1">
                                <h5 className="text-[11px] font-black text-gold-accent uppercase tracking-widest">AI Intelligence Note</h5>
                                <p className="text-[9px] font-bold text-gold-accent/40 leading-relaxed uppercase tracking-wider italic">
                                    Pengaturan ini mengontrol "otak" dari asisten WhatsApp Wulan. Gunakan Gemini-1.5-flash untuk kecepatan maksimal atau Groq untuk performa tinggi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
