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

        // Check Admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== 'admin@indoai.web.id') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { targets, message, type, file, url } = body;

        if (!targets || !Array.isArray(targets) || targets.length === 0) {
            return NextResponse.json({ success: false, error: 'Targets are required and must be an array' }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        // Fetch names for personalization
        const { data: profiles } = await supabase
            .from('profiles')
            .select('phone_number, full_name')
            .in('phone_number', targets);

        const profileMap = new Map(profiles?.map(p => [p.phone_number, p.full_name]) || []);

        // Prepare targets with names (phone|name format for Fonnte)
        const personalizedTargets = targets.map(t => {
            const name = profileMap.get(t) || '';
            return name ? `${t}|${name}` : t;
        });

        // Replace [NAMA] with Fonnte variable {name}
        const finalMessage = message.replace(/\[NAMA\]/g, '{name}');

        // Bulk Send to Fonnte
        const result = await waService.sendMessage({
            to: personalizedTargets,
            message: finalMessage,
            type,
            file,
            url,
            delay: '2-5'
        });

        // Map results for response
        const results = targets.map(target => ({
            target,
            success: result.status,
            detail: result.status ? 'Batched for delivery' : (result.detail || result.message)
        }));

        return NextResponse.json({
            success: result.status,
            results,
            info: result.status ? 'Messages are being sent with 2-5s delay and personalization' : undefined
        });

    } catch (error: any) {
        console.error('WA Send API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
