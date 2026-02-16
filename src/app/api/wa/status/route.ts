import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs'; // Correct library
import { cookies } from 'next/headers';
import { waService } from '@/modules/messaging-wa/waService';

// Force Rebuild Sync Check: 2026-02-16

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
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

        // Multi-level status check
        const devicesResult = await waService.getDevices(config?.api_token);
        const profileResult = await waService.getDeviceProfile(config?.api_token);

        // Success if ANY works (crucial for Device Tokens vs Account Tokens)
        const isOverallSuccess = devicesResult.status || profileResult.status;

        // Combine results for maximum compatibility
        const finalResult = {
            status: isOverallSuccess,
            // ONLY show error if EVERYTHING failed
            detail: isOverallSuccess ? null : (devicesResult.detail || profileResult.detail || devicesResult.reason || profileResult.reason || 'API Fonnte returned failure'),
            reason: isOverallSuccess ? null : (devicesResult.reason || profileResult.reason),
            data: devicesResult.data || (profileResult.status ? [{
                ...profileResult,
                status: profileResult.device_status || 'connect' // Normalize 'status' field for frontend consistency
            }] : []),
            profile: profileResult,
            device_status: profileResult.device_status || (devicesResult.data && devicesResult.data[0]?.status) || (profileResult.status ? 'connect' : null)
        };

        return NextResponse.json(finalResult);

    } catch (error: any) {
        console.error('WA Status API Error:', error);
        return NextResponse.json({ status: false, detail: error.message }, { status: 500 });
    }
}
