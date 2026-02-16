import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
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

        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid IDs' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('wa_logs')
            .delete()
            .in('id', ids);

        if (error) throw error;

        return NextResponse.json({ success: true, message: `${ids.length} logs deleted` });

    } catch (error: any) {
        console.error('WA Delete Logs Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
