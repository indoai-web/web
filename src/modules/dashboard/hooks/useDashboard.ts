'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

export const useDashboard = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast, confirm } = useToast();

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [modules, setModules] = useState<any[]>([]);
    const [landingPages, setLandingPages] = useState<any[]>([]);

    const fetchLandingPages = async () => {
        const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (!error && data) setLandingPages(data);
    };

    const syncVersions = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/landing-pages/sync', { method: 'POST' });
            const data = await res.json();
            if (!data.success) {
                showToast(data.error || 'Gagal sinkronisasi folder', 'error');
            } else {
                fetchLandingPages();
                if (data.added > 0) {
                    showToast(`${data.added} Edisi baru ditemukan!`, 'success');
                }
            }
        } catch (err) {
            console.error('Failed to sync versions:', err);
            showToast('Koneksi terputus saat sinkronisasi', 'error');
        } finally {
            setSyncing(false);
        }
    };

    const fetchModules = async () => {
        const { data } = await supabase.from('module_settings').select('*');
        if (data) setModules(data);
    };

    const toggleModule = async (name: string, currentStatus: boolean) => {
        await supabase.from('module_settings').update({ is_enabled: !currentStatus }).eq('module_name', name);
        fetchModules();
    };

    const activateLandingPage = async (version: string) => {
        try {
            await supabase.from('landing_pages').update({ is_active: false }).neq('version_name', 'none');
            await supabase.from('landing_pages').update({ is_active: true, activated_at: new Date().toISOString() }).eq('version_name', version);
            fetchLandingPages();
            showToast(`Edisi ${version} sekarang LIVE!`, 'success');
        } catch (err) {
            showToast('Gagal mengaktifkan edisi', 'error');
        }
    };

    const deleteVersion = async (version: string) => {
        if (version === 'v1') {
            showToast('Versi V1 adalah sistem inti dan tidak boleh dihapus.', 'error');
            return;
        }

        confirm({
            title: 'Hapus Edisi',
            message: `Bapak yakin ingin menghapus Edisi ${version}? Folder dan data di database akan dihapus permanen.`,
            confirmText: 'Ya, Hapus',
            onConfirm: async () => {
                try {
                    const res = await fetch('/api/landing-pages/delete', {
                        method: 'POST',
                        body: JSON.stringify({ version })
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(`Edisi ${version} berhasil dihapus.`, 'success');
                        fetchLandingPages();
                    } else {
                        showToast(data.error || 'Gagal menghapus folder', 'error');
                    }
                } catch (err) {
                    showToast('Gagal menghapus folder', 'error');
                }
            }
        });
    };

    const createVersion = async () => {
        confirm({
            title: 'Buat Edisi Baru',
            message: 'Bapak yakin ingin membuat folder Edisi baru secara otomatis?',
            onConfirm: async () => {
                setCreating(true);
                try {
                    const res = await fetch('/api/landing-pages/create', { method: 'POST' });
                    const data = await res.json();

                    if (!data.success) {
                        showToast(data.error || 'Gagal membuat edisi baru', 'error');
                    } else {
                        showToast(`Edisi ${data.version} berhasil dibuat!`, 'success');
                        if (data.warning) showToast(data.warning, 'warning');
                        fetchLandingPages();
                    }
                } catch (err) {
                    console.error('Failed to create version:', err);
                    showToast('Koneksi terputus saat membuat edisi', 'error');
                } finally {
                    setCreating(false);
                }
            }
        });
    };

    const handleReorder = async (orders: { version_name: string, sort_order: number }[]) => {
        try {
            const res = await fetch('/api/landing-pages/reorder', {
                method: 'POST',
                body: JSON.stringify({ orders })
            });
            const data = await res.json();
            if (!data.success) showToast('Gagal menyimpan urutan', 'error');
        } catch (err) {
            showToast('Gagal menyimpan urutan', 'error');
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchModules();
            await syncVersions();
            setLoading(false);
        };
        init();
    }, []);

    return {
        supabase,
        loading,
        syncing,
        creating,
        uploading,
        setUploading,
        modules,
        landingPages,
        setLandingPages,
        fetchLandingPages,
        syncVersions,
        toggleModule,
        activateLandingPage,
        deleteVersion,
        createVersion,
        handleReorder
    };
};
