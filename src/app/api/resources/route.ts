import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const isSpecial = searchParams.get('special') === 'true';

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

        let query = supabase.from('resources').select('*');

        if (isSpecial) {
            query = query.eq('is_special_offer', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Resources GET Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

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

        // Check if Admin (Email based check)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'admin@indoai.web.id') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const {
            items, deletedIds, title, description, type, category, content_url, allowed_tiers, group_name,
            is_special_offer, price, member_discount, commission_per_sale, sale_description, direct_checkout_url
        } = body;

        // Sync (Bulk Upsert & Delete) Support
        if ((items && Array.isArray(items)) || (deletedIds && Array.isArray(deletedIds))) {
            let resultData = [];

            // 1. Handle Deletions
            if (deletedIds && deletedIds.length > 0) {
                const { error: delError } = await supabase
                    .from('resources')
                    .delete()
                    .in('id', deletedIds);
                if (delError) throw delError;
            }

            // 2. Handle Upserts (Add/Update)
            if (items && items.length > 0) {
                const itemsToUpsert = items.map((item: any) => ({
                    ...item,
                    created_by: user.id
                }));

                const { data: upsertData, error: upsertError } = await supabase
                    .from('resources')
                    .upsert(itemsToUpsert)
                    .select();

                if (upsertError) throw upsertError;
                resultData = upsertData;
            }

            return NextResponse.json({ success: true, data: resultData });
        }

        // Standard Single Insert (Legacy support)
        const { data, error } = await supabase
            .from('resources')
            .insert([{
                title,
                description,
                type,
                category,
                content_url,
                allowed_tiers,
                group_name,
                is_special_offer,
                price,
                member_discount,
                commission_per_sale,
                sale_description,
                direct_checkout_url,
                created_by: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Resources POST Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
