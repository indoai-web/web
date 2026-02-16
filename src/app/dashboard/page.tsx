'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard';
import { useEditor } from '@/modules/dashboard/hooks/useEditor';
import { DashboardHeader } from '@/modules/dashboard/ui/components/DashboardHeader';
import { ModuleCenter } from '@/modules/dashboard/ui/components/ModuleCenter';
import { LandingEngine } from '@/modules/dashboard/ui/components/LandingEngine/LandingEngine';
import { EditorDialog } from '@/modules/dashboard/ui/components/Editor/EditorDialog';
import { EditorHeader } from '@/modules/dashboard/ui/components/Editor/EditorHeader';
import { FileExplorer } from '@/modules/dashboard/ui/components/Editor/FileExplorer';
import { CodeEditorArea } from '@/modules/dashboard/ui/components/Editor/CodeEditorArea';
import { VisualSidebar } from '@/modules/dashboard/ui/components/Editor/VisualSidebar';
import { PreviewArea } from '@/modules/dashboard/ui/components/Editor/PreviewArea';
import { ModuleGuard } from '@/modules/dashboard/ui/components/ModuleGuard';

import { Layers, Settings } from 'lucide-react';
import { DashboardSidebar, DashboardView } from '@/modules/dashboard/ui/components/DashboardSidebar';
import { SystemConfig } from '@/modules/dashboard/ui/components/SystemConfig';
import { MemberCenter } from '@/modules/dashboard/ui/components/MemberCenter';
import { FacilityCenter } from '@/modules/dashboard/ui/components/FacilityCenter';
import { AffiliateCenter } from '@/modules/dashboard/ui/components/AffiliateCenter';
import { WhatsAppCenter } from '@/modules/dashboard/ui/components/WhatsAppCenter';
import { PremiumToolCenter } from '@/modules/dashboard/ui/components/PremiumToolCenter';

export default function DashboardPage() {
    const {
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
        toggleModule,
        activateLandingPage,
        deleteVersion,
        createVersion,
        handleReorder,
        syncVersions
    } = useDashboard();

    const [currentView, setCurrentView] = useState<DashboardView>('overview');
    const [editingVersion, setEditingVersion] = useState('');
    const [refreshPreview, setRefreshPreview] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getModuleStatus = (name: string) => {
        return modules.find(m => m.module_name === name)?.is_enabled ?? true;
    };

    const editor = useEditor(editingVersion, () => setRefreshPreview(prev => prev + 1));

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'ELEMENT_CLICKED' && editor.noCodeMode) {
                editor.setSelectedVisualElement(event.data.element);
                editor.setVisualEditValue(event.data.element.content || '');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [editor.noCodeMode, editor]);

    const handleOpenEditor = async (version: string) => {
        setEditingVersion(version);
        await editor.fetchFiles(version);
        // editor.loadFileContent sekarang akan dipanggil otomatis oleh useEffect atau kita panggil di sini 
        // dengan file yang sudah dideteksi oleh fetchFiles
        editor.setIsEditorOpen(true);
    };

    const handleUploadZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        // ... (Upload logic handled via API in hook usually)
        setUploading(false);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-gold-accent gap-4">
            <div className="w-12 h-12 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
            <span className="font-bold tracking-widest text-xs uppercase">Initializing System</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* CMS Sidebar */}
            <DashboardSidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                onSignOut={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 p-8 relative min-h-screen">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-accent/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-aurora" />

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight uppercase italic underline decoration-gold-accent/30 decoration-4 underline-offset-8">
                            {currentView === 'overview' && 'System Overview'}
                            {currentView === 'versions' && 'Landing Engine'}
                            {currentView === 'modules' && 'Module Manager'}
                            {currentView === 'settings' && 'System Config'}
                            {currentView === 'premium_tools' && 'Premium Module'}
                        </h2>
                        <p className="text-xs font-bold text-foreground/30 uppercase tracking-[0.3em] mt-3">
                            IndoAi Production / {currentView}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold-accent">Service Online</span>
                            <span className="text-[9px] font-bold text-foreground/20">v2.0.0-PRO</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-gold-accent animate-pulse" />
                    </div>
                </header>

                <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {currentView === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ModuleCenter modules={modules.slice(0, 4)} onToggle={toggleModule} compact />
                            <div className="p-8 rounded-3xl bg-card border border-white-border flex flex-col items-center justify-center text-center space-y-4 shadow-xl shadow-gold-accent/5">
                                <div className="w-16 h-16 rounded-2xl bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                                    <Layers size={32} />
                                </div>
                                <h3 className="text-xl font-bold">Quick Launch</h3>
                                <p className="text-sm text-foreground/40 max-w-xs">Manage your landing pages and active marketing versions instantly from the engine.</p>
                                <button
                                    onClick={() => setCurrentView('versions')}
                                    className="px-6 py-2 rounded-xl bg-gold-accent text-background font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-gold-accent/20"
                                >
                                    Open Engine
                                </button>
                            </div>
                        </div>
                    )}

                    {currentView === 'versions' && (
                        <ModuleGuard moduleName="landing-pages" isEnabled={getModuleStatus('landing-pages')}>
                            <LandingEngine
                                landingPages={landingPages}
                                syncing={syncing}
                                creating={creating}
                                uploading={uploading}
                                onSync={syncVersions}
                                onCreate={createVersion}
                                onUploadClick={() => fileInputRef.current?.click()}
                                onActivate={activateLandingPage}
                                onDelete={deleteVersion}
                                onEdit={handleOpenEditor}
                                onRename={(v, name) => { }}
                                onReorder={(drag, drop) => { }}
                                fileInputRef={fileInputRef}
                            />
                        </ModuleGuard>
                    )}

                    {currentView === 'modules' && (
                        <div className="max-w-4xl">
                            <ModuleCenter modules={modules} onToggle={toggleModule} />
                        </div>
                    )}

                    {currentView === 'settings' && (
                        <ModuleGuard moduleName="system-config" isEnabled={getModuleStatus('system-config')}>
                            <div className="max-w-4xl">
                                <SystemConfig />
                            </div>
                        </ModuleGuard>
                    )}

                    {currentView === 'members' && (
                        <ModuleGuard moduleName="profiles" isEnabled={getModuleStatus('profiles')}>
                            <div className="max-w-6xl">
                                <MemberCenter />
                            </div>
                        </ModuleGuard>
                    )}

                    {currentView === 'facilities' && (
                        <ModuleGuard moduleName="downloads" isEnabled={getModuleStatus('downloads')}>
                            <div className="max-w-6xl">
                                <FacilityCenter />
                            </div>
                        </ModuleGuard>
                    )}

                    {currentView === 'affiliate' && (
                        <ModuleGuard moduleName="events" isEnabled={getModuleStatus('events')}>
                            <div className="max-w-6xl">
                                <AffiliateCenter />
                            </div>
                        </ModuleGuard>
                    )}

                    {currentView === 'messaging' && (
                        <ModuleGuard moduleName="messaging-wa" isEnabled={getModuleStatus('messaging-wa')}>
                            <div className="max-w-6xl">
                                <WhatsAppCenter />
                            </div>
                        </ModuleGuard>
                    )}

                    {currentView === 'premium_tools' && (
                        <ModuleGuard moduleName="premium-tools" isEnabled={getModuleStatus('premium-tools')}>
                            <div className="max-w-6xl">
                                <PremiumToolCenter />
                            </div>
                        </ModuleGuard>
                    )}
                </main>

                <footer className="mt-20 pt-8 border-t border-white-border flex justify-between items-center text-[10px] font-bold text-foreground/10 uppercase tracking-[0.5em]">
                    IndoAi Production System v2.0.0 (CMS Edition)
                </footer>
            </div>

            <EditorDialog
                isOpen={editor.isEditorOpen}
                onClose={() => editor.setIsEditorOpen(false)}
                header={
                    <EditorHeader
                        version={editingVersion}
                        noCodeMode={editor.noCodeMode}
                        onToggleNoCode={() => editor.setNoCodeMode(!editor.noCodeMode)}
                        onSave={editor.handleSaveContent}
                        onCancel={() => editor.setIsEditorOpen(false)}
                        saving={editor.saving}
                        hasUnsavedChanges={editor.hasUnsavedChanges}
                    />
                }
            >
                <FileExplorer
                    files={editor.fileList}
                    selectedFile={editor.selectedFile}
                    onSelectFile={(f) => editor.loadFileContent(editingVersion, f)}
                    onCreateFile={editor.handleCreateFile}
                />

                <CodeEditorArea
                    content={editor.tempContent}
                    onChange={editor.setTempContent}
                    filename={editor.selectedFile}
                    visible={!editor.noCodeMode}
                />

                <VisualSidebar
                    visible={editor.noCodeMode}
                    selectedElement={editor.selectedVisualElement}
                    onClearSelection={() => editor.setSelectedVisualElement(null)}
                    editValue={editor.visualEditValue}
                    setEditValue={editor.setVisualEditValue}
                    onApply={() => { }}
                    onUploadAsset={editor.handleAssetUpload}
                    uploading={editor.uploading}
                    version={editingVersion}
                    recentColors={['#2dd4bf', '#eab308', '#ffffff']}
                    onUpdateStyle={() => { }}
                    onAddRecentColor={() => { }}
                />

                <PreviewArea
                    previewMode={editor.previewMode}
                    version={editingVersion}
                    selectedFile={editor.selectedFile}
                    refreshCounter={refreshPreview}
                    onRefresh={() => setRefreshPreview(prev => prev + 1)}
                    onOpenNewTab={() => window.open(`/preview?version=${editingVersion}`, '_blank')}
                    saving={editor.saving}
                />
            </EditorDialog>

            <input
                type="file"
                accept=".zip"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadZip}
            />
        </div>
    );
}
