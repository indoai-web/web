import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const id = params.id;
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

        // Check if Admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'admin@indoai.web.id') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Resources DELETE Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
