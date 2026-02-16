import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { waService } from '@/modules/messaging-wa/waService';

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

        // Check Admin Role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ status: false, detail: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = user.email === 'admin@indoai.web.id' || profile?.role === 'admin';

        if (!isAdmin) {
            return NextResponse.json({ status: false, detail: 'Forbidden: Admin access only' }, { status: 403 });
        }

        // Fetch config with session-aware supabase
        const { data: waData } = await supabase
            .from('module_settings')
            .select('metadata')
            .eq('module_name', 'messaging-wa')
            .single();

        const config = waData?.metadata as any;
        const result = await waService.disconnect(config?.api_token);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('WA Disconnect API Error:', error);
        return NextResponse.json({ status: false, detail: error.message }, { status: 500 });
    }
}
