import React from 'react';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { supabase as publicSupabase } from '@/shared/lib/supabase-client';

import { LANDING_VERSIONS } from '../index';
import TrackedLanding from './TrackedLanding';

export default async function DynamicLanding() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: any) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }: any) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
    const { data: { session } } = await supabase.auth.getSession();

    let activeVersionName = 'v1';

    if (session) {
        // If user is logged in, check their assigned page
        const { data: profile } = await supabase
            .from('profiles')
            .select('assigned_landing_page')
            .eq('id', session.user.id)
            .single();

        if (profile?.assigned_landing_page) {
            activeVersionName = profile.assigned_landing_page;
        } else {
            // Fallback to global active version if no assigned page
            const { data } = await publicSupabase
                .from('landing_pages')
                .select('version_name')
                .eq('is_active', true)
                .single();
            if (data) activeVersionName = data.version_name;
        }
    } else {
        // Public/Guest: fetch the global active version
        const { data } = await publicSupabase
            .from('landing_pages')
            .select('version_name')
            .eq('is_active', true)
            .single();
        if (data) activeVersionName = data.version_name;
    }

    // Use the static mapping for stability (better for Turbopack)
    const ActiveVersion = LANDING_VERSIONS[activeVersionName] || LANDING_VERSIONS.v1;

    return (
        <TrackedLanding version={activeVersionName}>
            <ActiveVersion />
        </TrackedLanding>
    );
}
