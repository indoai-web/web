import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { version, name } = await req.json();

        if (!version || !name) {
            return NextResponse.json({ success: false, error: 'Version and Name required' }, { status: 400 });
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

        const { error } = await supabase
            .from('landing_pages')
            .update({ display_name: name })
            .eq('version_name', version);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Nama berhasil diubah' });

    } catch (error: any) {
        console.error('Rename Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
