import dynamic from 'next/dynamic';

export * from './domain/index';

// Central Registration of Landing Page Versions
// This helps Turbopack and Next.js resolve imports more reliably
export const LANDING_VERSIONS: Record<string, any> = {
    v1: dynamic(() => import('./versions/v1/page')),
    v2: dynamic(() => import('./versions/v2/page')),
    v3: dynamic(() => import('./versions/v3/page')),
    v4: dynamic(() => import('./versions/v4/page')),
};
