import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { version } = await req.json();

        if (!version || version === 'v1') {
            return NextResponse.json({ success: false, error: 'Versi tidak valid atau v1 tidak boleh dihapus' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // 1. Delete from DB
        const { error: dbError } = await supabase
            .from('landing_pages')
            .delete()
            .eq('version_name', version);

        if (dbError) throw dbError;

        // 2. Delete physical folder
        const versionsDir = path.join(process.cwd(), 'src/modules/landing-pages/versions');
        const targetDir = path.join(versionsDir, version);

        if (fs.existsSync(targetDir)) {
            // Using rmSync for recursive deletion
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        return NextResponse.json({ success: true, version });

    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
