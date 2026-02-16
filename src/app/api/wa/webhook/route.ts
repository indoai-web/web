
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { waService } from '@/modules/messaging-wa/waService';
import { aiService } from '@/modules/ai/aiService';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * WhatsApp Webhook Handler (Fonnte) - Character: WULAN
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

        const { sender, message, name: fonnteName, status, fromMe, device } = payload;

        // CRITICAL: Prevent Infinite Loop & Self-Chat
        // 1. Ignore status updates (e.g., sent, delivered, read)
        // 2. Ignore messages where fromMe is true (or "true" string)
        // 3. Ignore messages where sender is the same as the connected device (Self-Chat)
        if (
            status ||
            fromMe === true ||
            fromMe === 'true' ||
            (device && sender === device)
        ) {
            console.log(`[WA Webhook] Ignored. Status: ${status}, FromMe: ${fromMe}, Sender: ${sender}, Device: ${device}`);
            return NextResponse.json({ status: true, message: 'Ignored status/self-message' });
        }

        if (!sender || !message) {
            return NextResponse.json({ status: false, message: 'Invalid payload' }, { status: 400 });
        }

        console.log(`[WA Webhook] Incoming message from ${sender}: ${message}`);

        // 1. Resolve Member Name from Database
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('phone_number', sender)
            .single();

        const resolvedName = profile?.full_name || fonnteName || 'Bapak/Ibu';

        // 2. Generate AI Response (Wulan)
        const aiReply = await aiService.generateWulanResponse(resolvedName, message, sender);

        // 3. Send Response via WhatsApp
        const result = await waService.sendMessage({
            to: sender,
            message: aiReply
        });

        // 4. Log AI Interaction (Optional enrichment of logs)
        await supabaseAdmin.from('wa_logs').insert({
            phone_number: sender,
            message: message,
            ai_response: aiReply,
            status: result.status ? 'sent' : 'failed',
            fonnte_id: result.id,
            error_message: result.reason || 'Auto-replied by Wulan'
        });

        return NextResponse.json({ status: true, message: 'Wulan has replied' });

    } catch (error: any) {
        console.error('WA Webhook Wulan Error:', error);
        return NextResponse.json({ status: false, error: error.message }, { status: 500 });
    }
}
