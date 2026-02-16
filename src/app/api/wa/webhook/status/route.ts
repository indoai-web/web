import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * WhatsApp Status Webhook (Fonnte)
 * Handles Message Delivery Status (Sent, Delivered, Read) 
 * and Device Connection Status (Connected, Disconnected)
 */
export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let payload: any = {};

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
        }

        // 1. Handle Message Status (Sent, Delivered, Read)
        // Fields usually: id (fonnte_id), status, state, device
        if (payload.id && (payload.status || payload.state)) {
            const fonnteId = payload.id;
            const status = payload.status?.toLowerCase() || payload.state?.toLowerCase();

            console.log(`[WA Status Webhook] Message ${fonnteId} updated to: ${status}`);

            // Update log in database
            const { error } = await supabaseAdmin
                .from('wa_logs')
                .update({
                    status: status === 'read' ? 'read' : (status === 'delivered' ? 'delivered' : 'sent'),
                    error_message: `Updated via webhook: ${status}`
                })
                .eq('fonnte_id', fonnteId);

            if (error) {
                console.error(`Failed to update status for ${fonnteId}:`, error);
            }
        }

        // 2. Handle Connection Status (Connect/Disconnect)
        // Fields usually: device, status (connected, disconnected)
        if (payload.device && payload.status && !payload.id) {
            console.log(`[WA Status Webhook] Device ${payload.device} connection status: ${payload.status}`);

            // We could store this in a 'device_status' table or cache
            // For now, it's enough to log it. The UI polls /api/wa/status too.
        }

        return NextResponse.json({ status: true, message: 'Status received' });

    } catch (error: any) {
        console.error('WA Status Webhook Error:', error);
        return NextResponse.json({ status: false, error: error.message }, { status: 500 });
    }
}
