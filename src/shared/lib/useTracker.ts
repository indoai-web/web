'use client';

import { useEffect, useRef } from 'react';

export function useTracker(version: string) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!version || hasTracked.current) return;

        const trackVisit = async () => {
            try {
                await fetch('/api/landing-pages/stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ version })
                });
                hasTracked.current = true;
            } catch (err) {
                console.error('Failed to track visit:', err);
            }
        };

        // Track after a short delay to ensure page is loaded
        const timer = setTimeout(trackVisit, 2000);
        return () => clearTimeout(timer);
    }, [version]);
}
