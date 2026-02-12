// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
    try {
        // 1. Fetch pending logs
        const { data: logs, error: fetchError } = await supabase
            .from("wa_logs")
            .select("*")
            .eq("status", "pending")
            .limit(10);

        if (fetchError) throw fetchError;

        for (const log of logs || []) {
            try {
                // 2. Simulate sending WA message (Replace with real API call)
                console.log(`Sending message to ${log.phone_number}: ${log.message}`);

                // 3. Update status to 'sent'
                await supabase
                    .from("wa_logs")
                    .update({ status: "sent", processed_at: new Date().toISOString() })
                    .eq("id", log.id);

            } catch (err: any) {
                // 4. Update status to 'failed'
                await supabase
                    .from("wa_logs")
                    .update({
                        status: "failed",
                        error_message: err.message || String(err),
                        retry_count: (log.retry_count || 0) + 1
                    })
                    .eq("id", log.id);
            }
        }

        return new Response(JSON.stringify({ success: true, processed: logs?.length || 0 }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
