import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
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

        // Check Admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'admin@indoai.web.id') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const { data: rawLogs, count, error } = await supabase
            .from('wa_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Fetch profiles for these logs
        const phoneNumbers = Array.from(new Set(rawLogs.map(l => l.phone_number)));
        const { data: profiles } = await supabase
            .from('profiles')
            .select('phone_number, full_name, avatar_url')
            .in('phone_number', phoneNumbers);

        const profileMap = new Map(profiles?.map(p => [p.phone_number, p]) || []);

        const enrichedLogs = rawLogs.map(log => ({
            ...log,
            profile: profileMap.get(log.phone_number) || null
        }));

        return NextResponse.json({
            success: true,
            data: enrichedLogs,
            total: count
        });

    } catch (error: any) {
        console.error('WA Logs API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
