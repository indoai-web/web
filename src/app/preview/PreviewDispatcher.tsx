'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { LANDING_VERSIONS } from '@/modules/landing-pages';

export default function PreviewDispatcher({ version }: { version: string }) {
    const Component = LANDING_VERSIONS[version] || null;
    const [error, setError] = useState<string | null>(null);

    if (!Component && version) {
        // This might happen if new version is synced but not yet in our static mapping
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white gap-4 p-8 text-center">
                <h1 className="text-xl font-bold text-yellow-500">Version Not Registered</h1>
                <p>The version <span className="font-mono text-teal-accent">{version}</span> exists on disk but is not registered in <code className="text-xs bg-black/50 p-1">landing-pages/index.ts</code>.</p>
                <p className="text-xs text-foreground/50">Please add it manually to enable native rendering.</p>
            </div>
        );
    }

    // Real-Time Sync Hook (Must be at top level)
    useEffect(() => {
        const handleUpdate = (event: MessageEvent) => {
            if (event.data?.type === 'VISUAL_ELEMENT_UPDATE') {
                const { content, tagName } = event.data;
                const wrapper = document.getElementById('visual-edit-wrapper');
                if (!wrapper) return;

                // Find elements that match the currently "active" state in parent
                const activeEl = Array.from(wrapper.querySelectorAll('*')).find(el => (el as HTMLElement).style.outline.includes('dashed')) as HTMLElement;

                if (activeEl) {
                    if (tagName === 'IMG') {
                        activeEl.setAttribute('src', content);
                    } else {
                        activeEl.innerHTML = content;
                    }
                }
            }
        };
        window.addEventListener('message', handleUpdate);
        return () => window.removeEventListener('message', handleUpdate);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white gap-4 p-8 text-center">
                <h1 className="text-xl font-bold text-red-500">Preview Error</h1>
                <p>Could not load version: <span className="font-mono text-yellow-500">{version}</span></p>
                <div className="bg-black/50 p-4 rounded-lg text-left w-full max-w-2xl overflow-auto">
                    <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{error}</pre>
                </div>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div
            id="visual-edit-wrapper"
            onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'IMG', 'A', 'BUTTON', 'LI'].includes(target.tagName)) {
                    target.style.outline = '2px dashed #2dd4bf';
                    target.style.cursor = 'pointer';
                }
            }}
            onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.outline = '';
            }}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                // Find nearest editable tag if clicked on nested element
                const editable = target.closest('h1, h2, h3, h4, h5, h6, p, span, img, a, button');
                if (editable) {
                    e.preventDefault();
                    e.stopPropagation();
                    const el = editable as HTMLElement;
                    window.parent.postMessage({
                        type: 'VISUAL_ELEMENT_SELECTED',
                        tagName: el.tagName,
                        content: el.tagName === 'IMG' ? (el.getAttribute('src') || '') : el.innerHTML,
                        originalContent: el.tagName === 'IMG' ? (el.getAttribute('src') || '') : el.innerHTML,
                        id: el.id,
                        className: el.className
                    }, '*');
                }
            }}
        >
            <Component />
        </div>
    );
}
