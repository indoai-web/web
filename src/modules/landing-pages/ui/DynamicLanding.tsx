import React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/shared/lib/supabase-client';

// Map all available versions here. 
// This is safe because Next.js will code-split them.
const versions = {
    v1: dynamic(() => import('../versions/v1/page')),
    // v2: dynamic(() => import('../versions/v2/page')),
};

export default async function DynamicLanding() {
    // Fetch the active version from Supabase
    const { data, error } = await supabase
        .from('landing_pages')
        .select('version_name')
        .eq('is_active', true)
        .single();

    if (error || !data) {
        // Default to v1 if error or not found
        return <versions.v1 />;
    }

    const ActiveVersion = versions[data.version_name as keyof typeof versions] || versions.v1;

    return <ActiveVersion />;
}
