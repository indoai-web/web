'use client';

import React from 'react';
import { CustomDropdown } from '../Shared/CustomDropdown';

interface VisualSidebarProps {
    visible: boolean;
    selectedElement: any;
    onClearSelection: () => void;
    editValue: string;
    setEditValue: (val: string) => void;
    onApply: () => void;
    onUploadAsset: (file: File) => void;
    uploading: boolean;
    version: string;
    recentColors: string[];
    onUpdateStyle: (prop: string, val: string, quote: boolean) => void;
    onAddRecentColor: (color: string) => void;
}

export const VisualSidebar: React.FC<VisualSidebarProps> = ({
    visible,
    selectedElement,
    onClearSelection,
    editValue,
    setEditValue,
    onApply,
    onUploadAsset,
    uploading,
    version,
    recentColors,
    onUpdateStyle,
    onAddRecentColor
}) => {
    return (
        <div className={`
            ${visible || selectedElement ? 'w-80 border-r' : 'w-0'} 
            bg-[#18181b] flex flex-col transition-all duration-500 overflow-hidden border-white-border shrink-0
        `}>
            <div className="p-4 border-b border-white-border flex justify-between items-center">
                <h4 className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em]">Visual Edit</h4>
                {selectedElement && (
                    <button onClick={onClearSelection} className="text-[10px] font-bold text-teal-accent hover:underline">Clear</button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="p-4 space-y-6 flex-1">
                    {/* Media Manager Section */}
                    <div className="space-y-3 bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-black text-teal-accent/50 uppercase tracking-widest">Asset Manager</span>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={(selectedElement && ['IMG', 'VIDEO'].includes(selectedElement.tagName)) ? editValue : ''}
                                onChange={(e) => {
                                    if (selectedElement && ['IMG', 'VIDEO'].includes(selectedElement.tagName)) {
                                        setEditValue(e.target.value);
                                    }
                                }}
                                className="flex-1 bg-black/20 border border-white-border rounded-lg p-2 text-[10px] focus:outline-none focus:border-teal-accent/50 font-mono"
                                placeholder={(selectedElement && ['IMG', 'VIDEO'].includes(selectedElement.tagName)) ? "https://..." : "Upload image/video..."}
                                readOnly={!selectedElement || !['IMG', 'VIDEO'].includes(selectedElement.tagName)}
                            />
                            <label className="bg-white/10 p-2.5 rounded-lg hover:bg-teal-accent hover:text-background transition-all border border-white-border cursor-pointer flex items-center justify-center shadow-lg group">
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && onUploadAsset(e.target.files[0])} />
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            </label>
                        </div>

                        {((selectedElement && ['IMG', 'VIDEO'].includes(selectedElement.tagName)) || (editValue && (editValue.includes('.jpg') || editValue.includes('.png') || editValue.includes('.mp4')))) && (
                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-white-border bg-black/50 relative shadow-2xl">
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-accent"></div>
                                    </div>
                                )}
                                {(selectedElement?.tagName === 'VIDEO' || editValue.includes('.mp4')) ? (
                                    <video
                                        src={editValue.startsWith('assets/') ? `/api/landing-pages/view/${version}/${editValue}` : editValue}
                                        className="w-full h-full object-contain"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={editValue.startsWith('assets/') ? `/api/landing-pages/view/${version}/${editValue}` : editValue}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {selectedElement ? (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            {/* Text Content Section */}
                            {!['IMG', 'VIDEO'].includes(selectedElement.tagName) && (
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
                                                        onClick={() => setEditValue(`<${btn.tag}>${editValue}</${btn.tag}>`)}
                                                        className="w-7 h-7 flex items-center justify-center text-[10px] font-black hover:bg-teal-accent hover:text-background rounded transition-all active:scale-90"
                                                        title={btn.title}
                                                    >
                                                        {btn.label}
                                                    </button>
                                                ))}
                                                <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
                                                <button
                                                    onClick={() => setEditValue(editValue + '<br/>')}
                                                    className="px-2 h-7 flex items-center justify-center text-[8px] font-black hover:bg-teal-accent hover:text-background rounded transition-all active:scale-90 uppercase tracking-tighter"
                                                    title="Insert Line Break (Enter)"
                                                >
                                                    Enter ↵
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            rows={5}
                                            className="w-full bg-black/20 border border-white-border rounded-lg p-3 text-[11px] focus:outline-none focus:border-teal-accent/50 leading-relaxed font-medium transition-all"
                                            placeholder="Type your content here..."
                                        />

                                        {/* Typography Toolbar */}
                                        <div className="flex gap-2">
                                            <CustomDropdown
                                                className="flex-1"
                                                placeholder="Size"
                                                value=""
                                                options={[
                                                    { label: '12px', value: '12px' },
                                                    { label: '14px', value: '14px' },
                                                    { label: '16px', value: '16px' },
                                                    { label: '20px', value: '20px' },
                                                    { label: '32px', value: '32px' },
                                                    { label: '64px', value: '64px' },
                                                ]}
                                                onChange={(val) => onUpdateStyle('fontSize', val, true)}
                                            />
                                            <CustomDropdown
                                                className="flex-1"
                                                placeholder="Font"
                                                value=""
                                                options={[
                                                    { label: 'Sans', value: 'sans-serif' },
                                                    { label: 'Serif', value: 'serif' },
                                                    { label: 'Inter', value: "'Inter', sans-serif" },
                                                    { label: 'Outfit', value: "'Outfit', sans-serif" },
                                                ]}
                                                onChange={(val) => onUpdateStyle('fontFamily', val, true)}
                                            />
                                        </div>
                                    </div>

                                    {/* Color & Spacing */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[7px] font-black text-teal-accent/40 uppercase tracking-[0.2em]">Text Color</span>
                                                <input
                                                    type="color"
                                                    className="w-4 h-4 rounded-full border-none cursor-pointer bg-transparent"
                                                    onChange={(e) => {
                                                        const c = e.target.value;
                                                        onUpdateStyle('color', c, true);
                                                        onAddRecentColor(c);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 rounded-lg border border-white-border/10">
                                                {recentColors.map(color => (
                                                    <button
                                                        key={`text-${color}`}
                                                        onClick={() => onUpdateStyle('color', color, true)}
                                                        className="w-4 h-4 rounded-full border border-white/10 hover:scale-125 transition-all"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[7px] font-black text-teal-accent/40 uppercase tracking-[0.2em]">BG Block</span>
                                                <input
                                                    type="color"
                                                    className="w-4 h-4 rounded-full border-none cursor-pointer bg-transparent"
                                                    onChange={(e) => {
                                                        const c = e.target.value;
                                                        onUpdateStyle('backgroundColor', c, true);
                                                        onAddRecentColor(c);
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 rounded-lg border border-white-border/10">
                                                {recentColors.map(color => (
                                                    <button
                                                        key={`bg-${color}`}
                                                        onClick={() => onUpdateStyle('backgroundColor', color, true)}
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
                                            placeholder="Padding Bottom"
                                            value=""
                                            options={[
                                                { label: 'None', value: '0px' },
                                                { label: 'Small', value: '8px' },
                                                { label: 'Medium', value: '16px' },
                                                { label: 'Large', value: '32px' },
                                            ]}
                                            onChange={(val) => onUpdateStyle('paddingBottom', val, true)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white-border/50">
                                <button
                                    onClick={onApply}
                                    className="w-full bg-teal-accent text-background py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-teal-accent/20"
                                >
                                    Terapkan Perubahan
                                </button>
                                <p className="mt-3 text-[8px] text-foreground/30 text-center font-medium">
                                    Tip: Klik <span className="text-teal-accent font-bold">SIMPAN</span> di pojok kanan atas untuk menyimpan permanen.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-3 opacity-40">
                            <div className="w-12 h-12 rounded-full border border-white-border flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            </div>
                            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest leading-relaxed">Klik elemen apapun di preview untuk mengedit teks atau gaya desainnya</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
