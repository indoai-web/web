import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { version } = await req.json();

        if (!version) {
            return NextResponse.json({ success: false, error: 'Version missing' }, { status: 400 });
        }

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

        // Increment visitor_count using rpc or direct update
        // We use a direct update for simplicity, ideally use increment in SQL
        const { data: current } = await supabase
            .from('landing_pages')
            .select('visitor_count')
            .eq('version_name', version)
            .single();

        const { error } = await supabase
            .from('landing_pages')
            .update({
                visitor_count: (current?.visitor_count || 0) + 1,
                last_visit: new Date().toISOString()
            })
            .eq('version_name', version);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Stats Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
