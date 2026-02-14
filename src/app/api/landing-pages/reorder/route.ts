import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { orders } = await req.json(); // Array of { version_name: string, sort_order: number }

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ success: false, error: 'Data urutan tidak valid' }, { status: 400 });
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

        // Batch update sort_order
        // Using Promise.all for simplicity in this case
        const updates = orders.map(item =>
            supabase
                .from('landing_pages')
                .update({ sort_order: item.sort_order })
                .eq('version_name', item.version_name)
        );

        const results = await Promise.all(updates);
        const firstError = results.find(r => r.error);

        if (firstError) throw firstError.error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Reorder error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
