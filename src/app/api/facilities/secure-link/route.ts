import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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
                    } catch { }
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { materialId, bucketName, filePath } = await req.json();

    // 1. Fetch material to check min_badge
    const { data: material } = await supabase
        .from('materials')
        .select('min_badge')
        .eq('id', materialId)
        .single();

    if (!material) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // 2. Check user profile for badge_level, batches, and strict_protection toggle
    const { data: profile } = await supabase
        .from('profiles')
        .select('badge_level, batches, strict_protection')
        .eq('id', session.user.id)
        .single();

    // WHITESPLIST LOGIC: If protection is NOT strict, bypass all checks
    if (profile?.strict_protection === false) {
        console.log(`[WHITELIST] Bypassing security for user ${session.user.id}`);
    } else {
        // Fetch material details including allowed_batches
        const { data: matDetails } = await supabase
            .from('materials')
            .select('min_badge, allowed_batches')
            .eq('id', materialId)
            .single();

        const badgeHierarchy = { 'Member': 1, 'VIP': 2, 'Sultan': 3 };
        const userLevel = badgeHierarchy[profile?.badge_level as keyof typeof badgeHierarchy] || 0;
        const requiredLevel = badgeHierarchy[matDetails?.min_badge as keyof typeof badgeHierarchy] || 1;

        // Check Batch-based access: If user is in one of the allowed batches, allow access
        const isBatchAllowed = matDetails?.allowed_batches?.some((b: string) => profile?.batches?.includes(b));

        if (userLevel < requiredLevel && !isBatchAllowed) {
            return NextResponse.json({ error: 'Akses ditolak. Badge atau Batch tidak sesuai.' }, { status: 403 });
        }
    }

    // 3. Generate a very short-lived Signed URL (30 seconds)
    const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 30); // Valid for only 30 seconds

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
}
