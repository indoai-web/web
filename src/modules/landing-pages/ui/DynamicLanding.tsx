import React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/shared/lib/supabase-client';

import { LANDING_VERSIONS } from '../index';
import TrackedLanding from './TrackedLanding';

export default async function DynamicLanding() {
    // Fetch the active version from Supabase
    const { data, error } = await supabase
        .from('landing_pages')
        .select('version_name')
        .eq('is_active', true)
        .single();

    const activeVersionName = (!error && data) ? data.version_name : 'v1';

    // Use the static mapping for stability (better for Turbopack)
    const ActiveVersion = LANDING_VERSIONS[activeVersionName] || LANDING_VERSIONS.v1;

    return (
        <TrackedLanding version={activeVersionName}>
            <ActiveVersion />
        </TrackedLanding>
    );
}
