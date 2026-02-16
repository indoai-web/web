import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) { return cookieStore.get(name)?.value; },
                },
            }
        );

        // 1. Get tags from resources (allowed_tiers is an array)
        const { data: resourcesData } = await supabase
            .from('resources')
            .select('allowed_tiers');

        // 2. Get tags from invitations (membership_tier)
        const { data: invitationsData } = await supabase
            .from('invitations')
            .select('membership_tier');

        // 3. Get tags from profiles (source_event / membership_tier)
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('source_event, membership_tier');

        // 4. Get tags from centralized Membership Tiers (SOURCE OF TRUTH)
        const { data: tiersData } = await supabase
            .from('membership_tiers')
            .select('value');

        const tagSet = new Set<string>();
        const standardTags = ['free', 'premium', 'pro', 'elite', 'sultan'];

        const processRawTag = (raw: any) => {
            if (!raw) return;

            // Handle array directly
            if (Array.isArray(raw)) {
                raw.forEach(t => processRawTag(t));
                return;
            }

            // Handle string that might be a JSON array string "[...]"
            if (typeof raw === 'string') {
                const trimmed = raw.trim();
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) {
                            parsed.forEach(t => processRawTag(t));
                            return;
                        }
                    } catch (e) {
                        // Fallback: manual cleaning if JSON parse fails
                        const clean = trimmed.replace(/[\[\]"]/g, '');
                        clean.split(',').forEach(s => processRawTag(s));
                        return;
                    }
                }

                // Final clean for individual tag
                const finalTag = trimmed.replace(/"/g, '').toLowerCase();
                if (finalTag && !standardTags.includes(finalTag)) {
                    tagSet.add(finalTag);
                }
            }
        };

        // Process data from all sources
        resourcesData?.forEach(r => processRawTag(r.allowed_tiers));
        invitationsData?.forEach(i => processRawTag(i.membership_tier));
        profilesData?.forEach(p => {
            processRawTag(p.source_event);
            processRawTag(p.membership_tier);
        });

        // Add centrally managed tags
        tiersData?.forEach(t => processRawTag(t.value));

        const tags = Array.from(tagSet).sort();
        return NextResponse.json({ success: true, tags });

    } catch (error: any) {
        console.error('Available Tags GET Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
