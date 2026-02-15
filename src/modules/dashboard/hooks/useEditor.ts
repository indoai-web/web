'use client';

import { useState } from 'react';
import { useToast } from '@/shared/ui/Toast';

export const useEditor = (editingVersion: string, refreshPreview: () => void) => {
    const { showToast } = useToast();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [tempContent, setTempContent] = useState('');
    const [previewMode, setPreviewMode] = useState<string>('html');
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileList, setFileList] = useState<string[]>([]);
    const [noCodeMode, setNoCodeMode] = useState(false);
    const [selectedVisualElement, setSelectedVisualElement] = useState<any>(null);
    const [visualEditValue, setVisualEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = async (version: string) => {
        try {
            const res = await fetch(`/api/landing-pages/files?version=${version}`);
            const data = await res.json();
            if (data.success) {
                setFileList(data.files);
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
                const ext = file.split('.').pop()?.toLowerCase() || '';
                if (ext === 'html') setPreviewMode('html');
                else if (['tsx', 'ts', 'jsx', 'js'].includes(ext)) setPreviewMode('react');
            } else {
                showToast(data.error || 'Gagal memuat file', 'error');
            }
        } catch (err) {
            showToast('Gagal memuat file', 'error');
        }
    };

    const handleSaveContent = async () => {
        if (saving) return;
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
                refreshPreview();
            } else {
                showToast(data.error || 'Gagal menyimpan content', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat menyimpan', 'error');
        } finally {
            setSaving(false);
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

        if (tempContent.includes(oldVal)) {
            newContent = tempContent.replace(oldVal, newVal);
            success = true;
        }
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
        else {
            const fuzzyMatch = (content: string, target: string) => {
                const clean = (s: string) => s.trim().replace(/\s+/g, ' ');
                return clean(content).includes(clean(target));
            };

            if (fuzzyMatch(tempContent, oldVal)) {
                const cleanedOld = oldVal.trim().replace(/\s+/g, '\\s+');
                const regex = new RegExp(cleanedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                newContent = tempContent.replace(regex, newVal);
                success = true;
            }
        }

        if (success) {
            setTempContent(newContent);
            setHasUnsavedChanges(true);
            showToast('Perubahan visual diterapkan! Klik "SIMPAN" untuk permanen.', 'success');
            setSelectedVisualElement({
                ...selectedVisualElement,
                originalContent: newVal,
                content: newVal
            });
        } else {
            showToast('Gagal mencocokkan elemen di kode sumber. Coba edit langsung di Kode Mode.', 'error');
        }
    };

    const updateStyleProperty = (property: string, value: string, quoteValue: boolean = false) => {
        const isTsx = selectedFile?.endsWith('.tsx');
        let current = visualEditValue.trim();

        const kebabKey = property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const camelKey = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const key = isTsx ? camelKey : kebabKey;
        const formattedVal = (isTsx && quoteValue) ? `'${value}'` : value;

        const spanPrefix = isTsx ? /^<span style={{? ([\s\S]*?) }}?>(.*)<\/span>$/ : /^<span style="([^"]*)">(.*)<\/span>$/;
        const match = current.match(spanPrefix);

        if (match) {
            let stylePart = match[1];
            const innerPart = match[2];
            const separator = isTsx ? ',' : ';';
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
            const styleVal = isTsx ? `{{ ${key}: ${formattedVal} }}` : `"${key}: ${formattedVal};"`;
            setVisualEditValue(`<span style=${styleVal}>${current}</span>`);
        }
    };

    const handleAssetUpload = async (file: File) => {
        if (!editingVersion) return;
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
                if (['IMG', 'VIDEO'].includes(selectedVisualElement?.tagName)) {
                    setVisualEditValue(data.url);
                } else {
                    showToast('Media berhasil diupload!', 'success');
                }
                return data.url;
            } else {
                showToast(data.error || 'Gagal upload media', 'error');
            }
        } catch (err) {
            showToast('Koneksi terputus saat upload', 'error');
        } finally {
            setUploading(false);
        }
    };

    return {
        isEditorOpen,
        setIsEditorOpen,
        tempContent,
        setTempContent,
        previewMode,
        setPreviewMode,
        selectedFile,
        setSelectedFile,
        fileList,
        setFileList,
        noCodeMode,
        setNoCodeMode,
        selectedVisualElement,
        setSelectedVisualElement,
        visualEditValue,
        setVisualEditValue,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        saving,
        uploading,
        fetchFiles,
        loadFileContent,
        handleSaveContent,
        handleCreateFile,
        handleAssetUpload
    };
};
