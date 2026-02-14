'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { GlassCard } from '@/shared/ui/GlassCard';
import { useToast } from '@/shared/ui/Toast';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

// --- Custom UI Components ---
const CustomDropdown = ({
    options,
    value,
    onChange,
    placeholder,
    className = ""
}: {
    options: { label: string, value: string }[],
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    className?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white-border rounded-lg p-2 text-[9px] font-bold uppercase tracking-widest text-[#2dd4bf] flex justify-between items-center group hover:border-teal-accent/50 transition-all"
            >
                <span className="truncate">{options.find(o => o.value === value)?.label || placeholder}</span>
                <svg
                    className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-[#18181b] border border-white-border rounded-xl shadow-2xl overflow-hidden z-[70] animate-in slide-in-from-bottom-2 duration-200">
                        <div className="max-h-48 overflow-auto custom-scrollbar">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition-all
                                        ${value === opt.value ? 'bg-teal-accent text-background' : 'text-foreground/70 hover:bg-white/5 hover:text-teal-accent'}
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function DashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast, confirm } = useToast();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingVersion, setEditingVersion] = useState('');
    const [tempContent, setTempContent] = useState('');
    const [previewMode, setPreviewMode] = useState<string>('html');
    const [refreshPreview, setRefreshPreview] = useState(0);
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [fileList, setFileList] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [noCodeMode, setNoCodeMode] = useState(false);
    const [selectedVisualElement, setSelectedVisualElement] = useState<any>(null);
    const [visualEditValue, setVisualEditValue] = useState('');
    const [recentColors, setRecentColors] = useState<string[]>(['#2dd4bf', '#eab308', '#ffffff', '#1e293b', '#e11d48']);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [modules, setModules] = useState<any[]>([]);
    const [landingPages, setLandingPages] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLandingPages = async () => {
        const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }); // Oldest first by default

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

    const handleUploadZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/landing-pages/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                if (data.needs_build) {
                    confirm({
                        title: '🔴 TERDETEKSI FILE MENTAH',
                        message: `Sistem mendeteksi bahwa ZIP yang kamu unggah adalah source code mentah (bukan folder dist).\n\n⚠️ PERINGATAN: Build di server memiliki risiko error jika ada dependensi yang tidak kompatibel. Sangat disarankan untuk menjalankan 'npm run build' di komputer lokal dan hanya mengunggah ISI folder 'dist' saja.\n\nApakah tetap ingin mencoba Build otomatis di server?`,
                        confirmText: 'Lanjut Proses',
                        cancelText: 'Batal',
                        variant: 'destructive',
                        onConfirm: () => processBuild(data.temp_zip, data.version)
                    });
                } else {
                    showToast(`Website ${data.version} berhasil diupload!`, 'success');
                    if (data.warning) showToast(data.warning, 'warning');
                    fetchLandingPages();
                }
            } else {
                showToast(data.error || 'Gagal upload file', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat upload', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input via ref
        }
    };

    const processBuild = async (tempZip: string, version: string) => {
        setUploading(true);
        try {
            const res = await fetch('/api/landing-pages/build', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp_zip: tempZip, version: version })
            });
            const data = await res.json();

            if (data.success) {
                showToast(`Build ${version} berhasil! Website siap digunakan.`, 'success');
                fetchLandingPages();
            } else {
                showToast(data.error || 'Build gagal. Silakan build lokal & upload dist saja.', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat proses build', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handlePreUploadCheck = () => {
        confirm({
            title: '⚠️ PERHATIAN SEBELUM UPLOAD',
            message: `1. Wajib Build: Pastikan Kamu sudah menjalankan perintah npm run build di PC lokal agar desain yang tampil adalah versi terbaru.\n\n2. Folder Dist: Sangat disarankan hanya men-zip ISI folder 'dist' saja (bukan folder induknya) agar sistem membacanya sebagai website siap pakai.\n\n3. Database (SQL): Jika Kamu membutuhkan tabel baru di database, buat file bernama schema.sql dan letakkan di folder utama (sejajar index.html) di dalam ZIP. Format file harus berupa perintah SQL murni.`,
            confirmText: 'Ya, Lanjutkan',
            cancelText: 'Batal',
            onConfirm: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.click();
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

    const fetchData = async () => {
        setLoading(true);
        const { data: modData } = await supabase.from('module_settings').select('*');
        await syncVersions(); // Sync before initial load
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        supabase.from('module_settings').select('*').then(({ data }) => {
            if (data) setModules(data);
        });
    }, []);

    const toggleModule = async (name: string, currentStatus: boolean) => {
        await supabase.from('module_settings').update({ is_enabled: !currentStatus }).eq('module_name', name);
        const { data: modData } = await supabase.from('module_settings').select('*');
        if (modData) setModules(modData);
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

    const handleDelete = async (version: string) => {
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

    // --- DRAG & DROP LOGIC ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('dragIndex', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const fetchFiles = async (version: string) => {
        try {
            const res = await fetch(`/api/landing-pages/files?version=${version}`);
            const data = await res.json();
            if (data.success) {
                setFileList(data.files);
                // Default select index.html or page.tsx if available, otherwise first file
                if (data.files.includes('index.html')) setSelectedFile('index.html');
                else if (data.files.includes('page.tsx')) setSelectedFile('page.tsx');
                else if (data.files.length > 0) setSelectedFile(data.files[0]);
            }
        } catch (err) {
            console.error('Failed to fetch files:', err);
        }
    };

    const loadFileContent = async (version: string, file: string) => {
        try {
            const res = await fetch(`/api/landing-pages/edit?version=${version}&file=${file}`);
            const data = await res.json();
            if (data.success) {
                setTempContent(data.content);
                setSelectedFile(file);
                // Update mode based on extension
                const ext = file.split('.').pop()?.toLowerCase() || '';

                // Update preview mode based on file type
                if (ext === 'html') {
                    setPreviewMode('html');
                } else if (['tsx', 'ts', 'jsx', 'js'].includes(ext)) {
                    // Only switch to react if it's a component file (page.tsx or similar)
                    // For now we assume all scripts in these versions are part of the React build
                    setPreviewMode('react');
                }

                // Note: We don't change previewMode for .css, .json, etc. 
                // We keep the last active preview mode.
            } else {
                showToast(data.error || 'Gagal memuat file', 'error');
            }
        } catch (err) {
            showToast('Gagal memuat file', 'error');
        }
    };

    const openEditor = async (version: string) => {
        setEditingVersion(version);
        setLoading(true);

        await fetchFiles(version);

        try {
            const res = await fetch(`/api/landing-pages/edit?version=${version}`);
            const data = await res.json();
            if (data.success) {
                setTempContent(data.content);
                // Preview mode must be either 'react' or 'html' for the iframe src logic
                const detectedMode = data.mode || (data.type === '.tsx' ? 'react' : 'html');
                const finalPreviewMode = (detectedMode === 'typescript' || detectedMode === 'javascript' || detectedMode === 'react') ? 'react' : 'html';

                console.log('Detected Mode:', detectedMode, 'Final Preview Mode:', finalPreviewMode);
                setPreviewMode(finalPreviewMode);
                setIsEditorOpen(true);
                // Set initial selected file
                if (finalPreviewMode === 'react') setSelectedFile('page.tsx');
                else setSelectedFile('index.html');
            } else {
                showToast(data.error || 'Gagal memuat konten', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat mengambil data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFile = async () => {
        const filename = prompt('Masukkan nama file baru (contoh: promo.html atau styles.css):');
        if (!filename) return;

        try {
            const res = await fetch('/api/landing-pages/files/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: editingVersion, filename })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`File ${filename} berhasil dibuat!`, 'success');
                await fetchFiles(editingVersion);
                loadFileContent(editingVersion, filename);
            } else {
                showToast(data.error || 'Gagal membuat file', 'error');
            }
        } catch (err) {
            showToast('Gagal membuat file', 'error');
        }
    };

    const handleSaveContent = async () => {
        if (saving) return; // Prevent double save
        setSaving(true);
        try {
            const res = await fetch('/api/landing-pages/edit', {
                method: 'POST',
                body: JSON.stringify({
                    version: editingVersion,
                    content: tempContent,
                    file: selectedFile
                })
            });
            const data = await res.json();
            if (data.success) {
                setHasUnsavedChanges(false);
                showToast(`File ${selectedFile} disimpan!`, 'success');
                // setIsEditorOpen(false); // Don't close editor on save for better UX
                setRefreshPreview(prev => prev + 1); // Force iframe refresh
            } else {
                showToast(data.error || 'Gagal menyimpan content', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat menyimpan', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleVisualApply = () => {
        if (!selectedVisualElement) return;

        const isImg = selectedVisualElement.tagName === 'IMG';
        const oldVal = selectedVisualElement.originalContent;
        const newVal = visualEditValue;

        if (!oldVal && !isImg) {
            showToast('Elemen kosong tidak bisa diedit secara visual.', 'warning');
            return;
        }

        let newContent = tempContent;
        let success = false;

        // 1. Try Exact Match
        if (tempContent.includes(oldVal)) {
            newContent = tempContent.replace(oldVal, newVal);
            success = true;
        }
        // 2. Try Image Match (Regex)
        else if (isImg) {
            const srcRegexes = [
                new RegExp(`src=["']${oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`),
                new RegExp(`src={["']${oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']}`),
                new RegExp(`src={${oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}}`)
            ];

            for (const regex of srcRegexes) {
                if (regex.test(tempContent)) {
                    newContent = tempContent.replace(regex, `src="${newVal}"`);
                    success = true;
                    break;
                }
            }
        }
        // 3. Try Fuzzy Text Match (Ignore extra whitespace)
        else {
            const fuzzyMatch = (content: string, target: string) => {
                const clean = (s: string) => s.trim().replace(/\s+/g, ' ');
                return clean(content).includes(clean(target));
            };

            if (fuzzyMatch(tempContent, oldVal)) {
                // This is risky for global replace, but we try to find the best block
                const cleanedOld = oldVal.trim().replace(/\s+/g, '\\s+');
                const regex = new RegExp(cleanedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                newContent = tempContent.replace(regex, newVal);
                success = true;
            }
        }

        if (success) {
            setTempContent(newContent);
            setHasUnsavedChanges(true);
            showToast('Perubahan visual diterapkan! Klik "SIMPAN" untuk melihat pratinjau terbaru.', 'success');
            setSelectedVisualElement({
                ...selectedVisualElement,
                originalContent: newVal,
                content: newVal
            });
        } else {
            showToast('Gagal mencocokkan elemen di kode sumber. Coba edit langsung di Kode Mode.', 'error');
        }
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingVersion) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('version', editingVersion);

        try {
            const res = await fetch('/api/landing-pages/upload-asset', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                // Only update visualEditValue if an image or video is currently selected
                // Otherwise, the user might be uploading an asset to use later/insert
                if (['IMG', 'VIDEO'].includes(selectedVisualElement?.tagName)) {
                    setVisualEditValue(data.url);
                } else {
                    // Just show success or maybe a "copy link" popup
                    showToast('Media berhasil diupload! Pilih gambar/video untuk menggantinya.', 'success');
                }
            } else {
                showToast(data.error || 'Gagal upload media', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat upload', 'error');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const updateStyleProperty = (property: string, value: string, quoteValue: boolean = false) => {
        const isTsx = selectedFile?.endsWith('.tsx');
        let current = visualEditValue.trim();

        // Smarter logic: if current already starts and ends with a span, modify its style
        const kebabKey = property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const camelKey = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const key = isTsx ? camelKey : kebabKey;
        const formattedVal = (isTsx && quoteValue) ? `'${value}'` : value;

        // More robust span matcher - look for a span that wraps the whole content
        const spanPrefix = isTsx ? /^<span style={{? ([\s\S]*?) }}?>(.*)<\/span>$/ : /^<span style="([^"]*)">(.*)<\/span>$/;
        const match = current.match(spanPrefix);

        if (match) {
            let stylePart = match[1];
            const innerPart = match[2];
            const separator = isTsx ? ',' : ';';

            // Clean up existing props of the same key
            const props = stylePart.split(separator).map(p => p.trim()).filter(p => p);
            const filteredProps = props.filter(p => {
                const k = p.split(':')[0].trim().toLowerCase();
                return k !== kebabKey && k !== camelKey.toLowerCase();
            });

            filteredProps.push(`${key}: ${formattedVal}`);
            const newStyle = filteredProps.join(isTsx ? ', ' : '; ') + (isTsx ? '' : ';');
            const styleAttr = isTsx ? `{{ ${newStyle} }}` : `"${newStyle}"`;
            setVisualEditValue(`<span style=${styleAttr}>${innerPart}</span>`);
        } else {
            // New wrap
            const styleVal = isTsx ? `{{ ${key}: ${formattedVal} }}` : `"${key}: ${formattedVal};"`;
            setVisualEditValue(`<span style=${styleVal}>${current}</span>`);
        }
    };

    const addColorToRecent = (color: string) => {
        if (!color || color === 'transparent') return;
        setRecentColors(prev => {
            const filtered = prev.filter(c => c !== color);
            return [color, ...filtered].slice(0, 5);
        });
    };

    const handleRename = async (version: string) => {
        if (!tempTitle.trim()) {
            setEditingTitle(null);
            return;
        }

        try {
            const res = await fetch('/api/landing-pages/rename', {
                method: 'POST',
                body: JSON.stringify({ version, name: tempTitle })
            });
            const data = await res.json();

            if (data.success) {
                showToast('Nama edisi berhasil diubah', 'success');
                fetchLandingPages();
            } else {
                showToast(data.error || 'Gagal mengubah nama', 'error');
            }
        } catch (err) {
            showToast('Gagal mengubah nama', 'error');
        } finally {
            setEditingTitle(null);
        }
    };

    // Shortcut Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (isEditorOpen) {
                    handleSaveContent();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditorOpen, editingVersion, tempContent, saving]); // Add dependencies

    // Listen to Iframe Messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'VISUAL_ELEMENT_SELECTED') {
                setSelectedVisualElement(event.data);
                setVisualEditValue(event.data.content);
                // Auto switch to Visual Sidebar if in no-code mode or if sidebar is hidden
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Broadcast Real-Time Updates to Iframe
    useEffect(() => {
        if (!selectedVisualElement) return;

        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'VISUAL_ELEMENT_UPDATE',
                content: visualEditValue,
                tagName: selectedVisualElement.tagName
            }, '*');
        }
    }, [visualEditValue, selectedVisualElement]);

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndexStr = e.dataTransfer.getData('dragIndex');
        if (!dragIndexStr) return;

        const dragIndex = parseInt(dragIndexStr);
        if (dragIndex === dropIndex) return;

        const newItems = [...landingPages];
        const [draggedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(dropIndex, 0, draggedItem);

        // Update UI locally
        setLandingPages(newItems);

        // Sync with DB
        const orders = newItems.map((item, idx) => ({
            version_name: item.version_name,
            sort_order: idx + 1
        }));

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

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-teal-accent gap-4">
            <div className="w-12 h-12 border-4 border-teal-accent/20 border-t-teal-accent rounded-full animate-spin" />
            <span className="font-bold tracking-widest text-xs uppercase">Initializing System</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold-accent/15 rounded-full blur-[120px] animate-aurora pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-yellow-accent/10 rounded-full blur-[120px] animate-aurora pointer-events-none delay-2000" />

            {/* Sidebar-like Navigation Structure */}
            <div className="max-w-[1200px] mx-auto px-6 py-6 relative z-10 flex flex-col gap-8">
                <header className="flex justify-between items-center border-b border-white-border pb-6">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <span className="h-[2px] w-6 bg-gradient-to-r from-gold-accent to-yellow-accent rounded-full" />
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                                Indo Ai <span className="text-foreground/30 font-light">Studio</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30 pl-8">
                            Command Center
                        </p>
                    </div>

                    <button
                        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
                        className="group flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white-border hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                    >
                        <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-red-400">Exit System</span>
                        <div className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
                            <div className="w-2 h-2 border-[1.5px] border-red-400 group-hover:border-red-300 rounded-sm" />
                        </div>
                    </button>
                </header>

                <main className="grid grid-cols-12 gap-8">
                    {/* Module Command Center */}
                    <div className="col-span-12 lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                                <h2 className="text-lg font-black uppercase tracking-tight">Modules</h2>
                                <span className="text-[9px] font-bold text-gold-accent uppercase tracking-widest opacity-50">Active Services</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {modules.map(mod => (
                                <GlassCard key={mod.module_name} shimmer className="!p-4 bg-card/30 rounded-2xl">
                                    <div className="flex items-center justify-between w-full h-full">
                                        <div className="space-y-0 text-left">
                                            <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">Package</span>
                                            <h3 className="font-bold capitalize text-sm tracking-tight">
                                                {mod.module_name.replace('-', ' ')}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => toggleModule(mod.module_name, mod.is_enabled)}
                                            className={`
                                                relative w-10 h-5 rounded-full transition-all duration-500 overflow-hidden
                                                ${mod.is_enabled ? 'bg-gold-accent/20 border-gold-500/30' : 'bg-white/5 border-white-border'}
                                                border-[1px]
                                            `}
                                        >
                                            <div className={`
                                                absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-500
                                                ${mod.is_enabled ? 'left-[calc(100%-0.9rem)] bg-gold-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'left-1 bg-foreground/20'}
                                            `} />
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    {/* Landing Engine */}
                    <div className="col-span-12 lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                                <h2 className="text-lg font-black uppercase tracking-tight">Landing Engine</h2>
                                <span className="text-[9px] font-bold text-yellow-accent uppercase tracking-widest opacity-50">Version Controller</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".zip"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleUploadZip}
                                            disabled={uploading || syncing || creating}
                                        />
                                        <button
                                            onClick={handlePreUploadCheck}
                                            disabled={uploading || syncing || creating}
                                            className={`
                                                group/btn relative px-3 py-1 rounded-md bg-white/5 border border-white-border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2
                                                ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-teal-accent/40 hover:text-teal-accent'}
                                            `}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                            {uploading ? 'Uploading...' : 'Upload ZIP'}

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-[7px] text-foreground/70 normal-case tracking-normal opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all z-50 shadow-2xl backdrop-blur-xl">
                                                <span className="text-teal-accent font-bold uppercase block mb-1">Tips Upload:</span>
                                                Cukup ZIP <span className="text-white font-bold">ISI folder 'dist'</span> saja untuk hasil terbaik. Kamu akan melihat peringatan detail saat mengklik tombol ini.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
                                            </div>
                                        </button>
                                    </div>
                                    <button
                                        onClick={createVersion}
                                        disabled={creating || syncing || uploading}
                                        className="px-3 py-1 rounded-md bg-gold-accent text-background text-[8px] font-black uppercase tracking-widest hover:bg-yellow-accent transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : '+ Create Edition'}
                                    </button>
                                    <button
                                        onClick={syncVersions}
                                        disabled={syncing || creating || uploading}
                                        className={`
                                            px-3 py-1 rounded-md bg-white/5 border border-white-border text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2
                                            ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold-accent/40 hover:text-gold-accent'}
                                        `}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gold-accent ${syncing ? 'animate-ping' : 'animate-pulse'}`} />
                                        {syncing ? 'Syncing...' : 'Sync Folders'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {landingPages.map((lp, index) => (
                                <div
                                    key={lp.id}
                                    draggable
                                    onDragStart={(e: React.DragEvent) => handleDragStart(e, index)}
                                    onDragOver={(e: React.DragEvent) => handleDragOver(e)}
                                    onDrop={(e: React.DragEvent) => handleDrop(e, index)}
                                    className="group"
                                >
                                    <GlassCard
                                        className={`
                                            !p-0 overflow-hidden transition-all duration-700 rounded-2xl cursor-grab active:cursor-grabbing
                                            ${lp.is_active ? 'border-gold-accent/40 bg-gold-accent/5 ring-1 ring-gold-accent/20' : 'opacity-60 hover:opacity-100'}
                                        `}
                                    >
                                        <div className="p-4 flex items-center justify-between bg-gradient-to-br from-white/5 to-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg
                                                    ${lp.is_active ? 'bg-gold-accent text-background border-b-2 border-amber-800 shadow-[0_4px_20px_rgba(245,158,11,0.2)]' : 'bg-foreground/5 text-foreground/20 border border-white-border'}
                                                `}>
                                                    {lp.version_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {editingTitle === lp.version_name ? (
                                                            <input
                                                                type="text"
                                                                value={tempTitle}
                                                                onChange={(e) => setTempTitle(e.target.value)}
                                                                onBlur={() => handleRename(lp.version_name)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleRename(lp.version_name)}
                                                                autoFocus
                                                                className="text-sm font-black uppercase tracking-tight bg-transparent border-b border-teal-accent text-foreground focus:outline-none w-32"
                                                            />
                                                        ) : (
                                                            <span
                                                                className="text-sm font-black uppercase tracking-tight cursor-pointer hover:text-teal-accent transition-colors flex items-center gap-2 group/title"
                                                                onClick={() => { setEditingTitle(lp.version_name); setTempTitle(lp.display_name || `EDITION ${lp.version_name}`); }}
                                                            >
                                                                {lp.display_name || `EDITION ${lp.version_name}`}
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover/title:opacity-100 transition-opacity text-foreground/20"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                            </span>
                                                        )}

                                                        {!lp.is_active && lp.version_name !== 'v1' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(lp.version_name); }}
                                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">
                                                            {lp.is_active ? 'LIVE SYSTEM' : 'STABLE VERSION'}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 pl-3 border-l border-white-border/10">
                                                            <div className="w-1 h-1 rounded-full bg-teal-accent/50" />
                                                            <span className="text-[8px] font-black text-teal-accent/60 uppercase tracking-tighter">
                                                                {lp.visitor_count || 0} Visitors
                                                            </span>
                                                        </div>
                                                        {lp.last_visit && (
                                                            <span className="text-[7px] font-bold text-foreground/20 uppercase tracking-tighter italic">
                                                                Last: {new Date(lp.last_visit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditor(lp.version_name)}
                                                    className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white-border text-foreground/40 hover:border-teal-accent hover:text-teal-accent hover:bg-teal-accent/10 hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all active:scale-95"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => activateLandingPage(lp.version_name)}
                                                    disabled={lp.is_active}
                                                    className={`
                                                        px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                                        ${lp.is_active
                                                            ? 'bg-gold-accent/20 text-gold-accent border border-gold-500/30'
                                                            : 'border border-white-border text-foreground/40 hover:border-gold-accent/30 hover:text-gold-accent'
                                                        }
                                                    `}
                                                >
                                                    {lp.is_active ? 'Live' : 'Deploy'}
                                                </button>
                                            </div>
                                        </div>
                                        {lp.is_active && (
                                            <div className="h-[2px] w-full bg-gradient-to-r from-gold-accent via-yellow-accent to-gold-accent animate-shimmer" />
                                        )}
                                    </GlassCard>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="mt-10 pt-8 border-t border-white-border flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
                    <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.5em]">
                        IndoAi Production System v1.4.2
                    </p>
                    <div className="flex gap-6">
                        {['Security', 'Network', 'API'].map(item => (
                            <div key={item} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-teal-accent" />
                                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{item} Stable</span>
                            </div>
                        ))}
                    </div>
                </footer>
            </div>
            {isEditorOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-card/40 border border-white-border rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(45,212,191,0.1)] animate-in zoom-in-95 duration-500">
                        <div className="p-6 border-b border-white-border flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-accent/10 border border-teal-accent/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-accent"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Content Editor</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-bold text-teal-accent uppercase tracking-[0.2em]">Editing Edition {editingVersion}</p>
                                        <span className="text-foreground/10 px-2">|</span>
                                        <button
                                            onClick={() => setNoCodeMode(!noCodeMode)}
                                            className={`
                                                px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2
                                                ${noCodeMode
                                                    ? 'bg-[#2dd4bf] text-[#000000] shadow-[0_0_30px_rgba(45,212,191,0.6)]'
                                                    : 'bg-[#18181b] border-2 border-white/20 text-[#2dd4bf] hover:bg-white/5'
                                                }
                                                active:scale-95
                                            `}
                                        >
                                            {noCodeMode && <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
                                            {noCodeMode ? 'Visual Edit: Active' : 'Visual Edit: Inactive'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditorOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-white-border text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveContent}
                                    disabled={saving}
                                    className={`
                                        relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_20px_rgba(250,204,21,0.3)]
                                        ${hasUnsavedChanges ? 'shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-pulse border-2 border-white/50' : ''}
                                    `}
                                >
                                    {saving ? 'Menyimpan...' : 'SIMPAN'}
                                    {hasUnsavedChanges && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* File Explorer Sidebar */}
                            <div className="w-48 bg-[#18181b] border-r border-white-border flex flex-col">
                                <div className="p-3 border-b border-white-border/50 flex justify-between items-center">
                                    <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Files</h4>
                                    <button
                                        onClick={handleCreateFile}
                                        className="text-teal-accent hover:rotate-90 transition-transform p-1"
                                        title="Tambah File Baru"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto custom-scrollbar p-2 space-y-1">
                                    {fileList.map((file) => (
                                        <button
                                            key={file}
                                            onClick={() => loadFileContent(editingVersion!, file)}
                                            className={`
                                                w-full text-left px-3 py-2 rounded-lg text-[10px] font-medium transition-all truncate
                                                ${selectedFile === file
                                                    ? 'bg-teal-accent/10 text-teal-accent'
                                                    : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                                                }
                                            `}
                                        >
                                            {file}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Code Editor (Left) */}
                            <div className={`
                                ${noCodeMode ? 'w-0 opacity-0 pointer-events-none' : 'flex-1'} 
                                bg-[#1e1e1e] overflow-auto custom-scrollbar border-r border-white-border relative group transition-all duration-500
                            `}>
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="px-2 py-1 rounded bg-white/10 text-[9px] font-bold text-white/50 uppercase tracking-widest">
                                        {selectedFile}
                                    </span>
                                </div>
                                <Editor
                                    value={tempContent}
                                    onValueChange={code => setTempContent(code)}
                                    highlight={code => {
                                        const ext = selectedFile.split('.').pop()?.toLowerCase();
                                        if (ext === 'tsx' || ext === 'ts' || ext === 'js' || ext === 'jsx') {
                                            return highlight(code, languages.javascript, 'javascript');
                                        } else if (ext === 'css') {
                                            return highlight(code, languages.css, 'css');
                                        } else if (ext === 'html') {
                                            return highlight(code, languages.markup, 'markup');
                                        }
                                        return highlight(code, languages.clike, 'clike');
                                    }}
                                    padding={24}
                                    style={{
                                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        backgroundColor: 'transparent',
                                        minHeight: '100%',
                                    }}
                                    textareaClassName="focus:outline-none"
                                />
                            </div>

                            {/* Smart Visual Sidebar */}
                            <div className={`
                                ${noCodeMode || selectedVisualElement ? 'w-80 border-r' : 'w-0'} 
                                bg-[#18181b] flex flex-col transition-all duration-500 overflow-hidden border-white-border shrink-0
                            `}>
                                <div className="p-4 border-b border-white-border flex justify-between items-center">
                                    <h4 className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Visual Edit</h4>
                                    {selectedVisualElement && (
                                        <button onClick={() => setSelectedVisualElement(null)} className="text-[10px] font-bold text-teal-accent hover:underline">Clear</button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                    <div className="p-4 space-y-6 flex-1">
                                        {/* Media Manager Section - Persistent */}
                                        <div className="space-y-3 bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[8px] font-black text-teal-accent/50 uppercase tracking-widest">Asset Manager</span>
                                                {selectedVisualElement && ['IMG', 'VIDEO'].includes(selectedVisualElement.tagName) && (
                                                    <span className="text-[7px] bg-teal-accent/10 px-1.5 py-0.5 rounded text-teal-accent border border-teal-accent/20">Targeting {selectedVisualElement.tagName}</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={(selectedVisualElement && ['IMG', 'VIDEO'].includes(selectedVisualElement.tagName)) ? visualEditValue : ''}
                                                    onChange={(e) => {
                                                        if (selectedVisualElement && ['IMG', 'VIDEO'].includes(selectedVisualElement.tagName)) {
                                                            setVisualEditValue(e.target.value);
                                                        }
                                                    }}
                                                    className="flex-1 bg-black/20 border border-white-border rounded-lg p-2 text-[10px] focus:outline-none focus:border-teal-accent/50 font-mono"
                                                    placeholder={selectedVisualElement && ['IMG', 'VIDEO'].includes(selectedVisualElement.tagName) ? "https://..." : "Upload image/video here..."}
                                                    readOnly={!selectedVisualElement || !['IMG', 'VIDEO'].includes(selectedVisualElement.tagName)}
                                                />
                                                <label className="bg-white/10 p-2.5 rounded-lg hover:bg-teal-accent hover:text-background transition-all border border-white-border cursor-pointer flex items-center justify-center shadow-lg group" title="Upload Media">
                                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleAssetUpload} />
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                </label>
                                            </div>

                                            {((selectedVisualElement && ['IMG', 'VIDEO'].includes(selectedVisualElement.tagName)) || (visualEditValue && (visualEditValue.includes('.jpg') || visualEditValue.includes('.png') || visualEditValue.includes('.mp4')))) && (
                                                <div className="w-full aspect-video rounded-lg overflow-hidden border border-white-border bg-black/50 relative shadow-2xl">
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-accent"></div>
                                                        </div>
                                                    )}
                                                    {(selectedVisualElement?.tagName === 'VIDEO' || visualEditValue.includes('.mp4')) ? (
                                                        <video
                                                            src={visualEditValue.startsWith('assets/') ? `/api/landing-pages/view/${editingVersion}/${visualEditValue}` : visualEditValue}
                                                            className="w-full h-full object-contain"
                                                            controls
                                                        />
                                                    ) : (
                                                        <img
                                                            src={visualEditValue.startsWith('assets/') ? `/api/landing-pages/view/${editingVersion}/${visualEditValue}` : visualEditValue}
                                                            alt="Preview"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {selectedVisualElement ? (
                                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                                {/* Text Content Section */}
                                                {!['IMG', 'VIDEO'].includes(selectedVisualElement.tagName) && (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[8px] font-black text-teal-accent/50 uppercase tracking-widest">Document Editor</span>
                                                                <div className="flex gap-1 bg-white/5 p-1 rounded-md border border-white/10 shadow-sm">
                                                                    {[
                                                                        { label: 'B', tag: 'b', title: 'Bold' },
                                                                        { label: 'I', tag: 'i', title: 'Italic' },
                                                                        { label: 'U', tag: 'u', title: 'Underline' },
                                                                    ].map(btn => (
                                                                        <button
                                                                            key={btn.tag}
                                                                            onClick={() => {
                                                                                const tag = btn.tag;
                                                                                setVisualEditValue(`<${tag}>${visualEditValue}</${tag}>`);
                                                                            }}
                                                                            className="w-7 h-7 flex items-center justify-center text-[10px] font-black hover:bg-teal-accent hover:text-background rounded transition-all active:scale-90"
                                                                            title={btn.title}
                                                                        >
                                                                            {btn.label}
                                                                        </button>
                                                                    ))}
                                                                    <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
                                                                    <button
                                                                        onClick={() => setVisualEditValue(visualEditValue + '<br/>')}
                                                                        className="px-2 h-7 flex items-center justify-center text-[8px] font-black hover:bg-teal-accent hover:text-background rounded transition-all active:scale-90 uppercase tracking-tighter"
                                                                        title="Insert Line Break (Enter)"
                                                                    >
                                                                        Enter ↵
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={visualEditValue}
                                                                onChange={(e) => setVisualEditValue(e.target.value)}
                                                                rows={5}
                                                                className="w-full bg-black/20 border border-white-border rounded-lg p-3 text-[11px] focus:outline-none focus:border-teal-accent/50 leading-relaxed font-medium transition-all"
                                                                placeholder="Type your content here..."
                                                            />

                                                            {/* Typography Toolbar */}
                                                            <div className="flex gap-2">
                                                                <CustomDropdown
                                                                    className="flex-1"
                                                                    placeholder="Font Size"
                                                                    value=""
                                                                    options={[
                                                                        { label: '12px', value: '12px' },
                                                                        { label: '14px', value: '14px' },
                                                                        { label: '16px', value: '16px' },
                                                                        { label: '20px', value: '20px' },
                                                                        { label: '24px', value: '24px' },
                                                                        { label: '32px', value: '32px' },
                                                                        { label: '48px', value: '48px' },
                                                                        { label: '64px', value: '64px' },
                                                                    ]}
                                                                    onChange={(val) => updateStyleProperty('fontSize', val, true)}
                                                                />
                                                                <CustomDropdown
                                                                    className="flex-1"
                                                                    placeholder="Font Family"
                                                                    value=""
                                                                    options={[
                                                                        { label: 'Sans', value: 'sans-serif' },
                                                                        { label: 'Serif', value: 'serif' },
                                                                        { label: 'Mono', value: 'monospace' },
                                                                        { label: 'Poppins', value: "'Poppins', sans-serif" },
                                                                        { label: 'Inter', value: "'Inter', sans-serif" },
                                                                        { label: 'Outfit', value: "'Outfit', sans-serif" },
                                                                    ]}
                                                                    onChange={(val) => updateStyleProperty('fontFamily', val, true)}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Color & Spacing - Unlimited Style */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[7px] font-black text-teal-accent/40 uppercase tracking-[0.2em]">Text Color</span>
                                                                    <input
                                                                        type="color"
                                                                        className="w-4 h-4 rounded-full border-none cursor-pointer bg-transparent"
                                                                        onChange={(e) => {
                                                                            const c = e.target.value;
                                                                            updateStyleProperty('color', c, true);
                                                                            addColorToRecent(c);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 rounded-lg border border-white-border/10">
                                                                    {recentColors.map(color => (
                                                                        <button
                                                                            key={`text-${color}`}
                                                                            onClick={() => updateStyleProperty('color', color, true)}
                                                                            className="w-4 h-4 rounded-full border border-white/10 hover:scale-125 transition-all"
                                                                            style={{ backgroundColor: color }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[7px] font-black text-teal-accent/40 uppercase tracking-[0.2em]">BG Block</span>
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => updateStyleProperty('backgroundColor', 'transparent', true)}
                                                                            className="w-4 h-4 flex items-center justify-center border border-white/20 rounded-full hover:bg-white/10"
                                                                            title="Clear Background"
                                                                        >
                                                                            <div className="w-full h-[1px] bg-red-500 rotate-45" />
                                                                        </button>
                                                                        <input
                                                                            type="color"
                                                                            className="w-4 h-4 rounded-full border-none cursor-pointer bg-transparent"
                                                                            onChange={(e) => {
                                                                                const c = e.target.value;
                                                                                updateStyleProperty('backgroundColor', c, true);
                                                                                addColorToRecent(c);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 rounded-lg border border-white-border/10">
                                                                    {recentColors.map(color => (
                                                                        <button
                                                                            key={`bg-${color}`}
                                                                            onClick={() => updateStyleProperty('backgroundColor', color, true)}
                                                                            className="w-4 h-4 rounded-full border border-white/10 hover:scale-125 transition-all"
                                                                            style={{ backgroundColor: color }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <span className="text-[7px] font-black text-teal-accent/40 uppercase tracking-[0.2em]">Vertical Spacing</span>
                                                            <CustomDropdown
                                                                className="w-full"
                                                                placeholder="Select Vertical Spanning"
                                                                value=""
                                                                options={[
                                                                    { label: 'None', value: '0px' },
                                                                    { label: 'Small (8px)', value: '8px' },
                                                                    { label: 'Medium (16px)', value: '16px' },
                                                                    { label: 'Large (32px)', value: '32px' },
                                                                    { label: 'Extra Large (64px)', value: '64px' },
                                                                ]}
                                                                onChange={(val) => updateStyleProperty('paddingBottom', val, true)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-white-border/50">
                                                    <button
                                                        onClick={handleVisualApply}
                                                        className="w-full bg-teal-accent text-background py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-teal-accent/20"
                                                    >
                                                        Terapkan Perubahan
                                                    </button>

                                                    <p className="mt-3 text-[8px] text-foreground/30 text-center font-medium">
                                                        Tip: Click <span className="text-teal-accent">SIMPAN</span> at the top right to save all work.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center space-y-3 opacity-40">
                                                <div className="w-12 h-12 rounded-full border border-white-border flex items-center justify-center mx-auto">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                                </div>
                                                <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Click anything in the preview to edit text/style</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview (Right) */}
                            <div className="w-1/2 bg-white relative">
                                <div className="w-full h-full relative">
                                    <iframe
                                        src={`${previewMode === 'react'
                                            ? `/preview?version=${editingVersion}`
                                            : `/api/landing-pages/view/${editingVersion}/${selectedFile.endsWith('.html') ? selectedFile : 'index.html'}`
                                            }&t=${refreshPreview}`}
                                        className="w-full h-full border-none bg-white"
                                        title="Live Preview"
                                        key={refreshPreview}
                                    />
                                    {saving && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <button
                                        onClick={() => setRefreshPreview(prev => prev + 1)}
                                        className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest hover:bg-teal-accent hover:text-background hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all border border-white/10"
                                    >
                                        Refresh ⟳
                                    </button>
                                    <button
                                        onClick={() => window.open(
                                            previewMode === 'react'
                                                ? `/preview?version=${editingVersion}`
                                                : `/api/landing-pages/view/${editingVersion}/${selectedFile.endsWith('.html') ? selectedFile : 'index.html'}`,
                                            '_blank'
                                        )}
                                        className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest hover:bg-teal-accent hover:text-background hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all border border-white/10"
                                    >
                                        Open New Tab ↗
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 px-6 bg-white/5 border-t border-white-border flex justify-between items-center">
                            <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                                Tip: Use Ctrl+F to find specific words or images to replace.
                            </span>
                            <div className="flex gap-4">
                                <span className="text-[9px] font-black text-teal-accent/40 uppercase tracking-widest italic">
                                    Preview Sync: On Save
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
