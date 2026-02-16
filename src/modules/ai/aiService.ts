
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const aiService = {
    async getAIConfig() {
        const { data } = await supabaseAdmin
            .from('module_settings')
            .select('metadata')
            .eq('module_name', 'system-config')
            .single();
        return data?.metadata as { gemini_api_key?: string, groq_api_key?: string, openai_api_key?: string } || {};
    },

    async checkDailyQuota(phoneNumber: string): Promise<boolean> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { count, error } = await supabaseAdmin
                .from('wa_logs')
                .select('*', { count: 'exact', head: true })
                .eq('phone_number', phoneNumber)
                .not('ai_response', 'is', null) // Only count AI replies
                .gte('created_at', `${today}T00:00:00`);

            if (error) throw error;
            return (count || 0) < 10;
        } catch (err) {
            console.error('Quota check failed:', err);
            return true; // Allow on failure to check
        }
    },

    async generateWulanResponse(userName: string, userMessage: string, phoneNumber: string): Promise<string> {
        const hasQuota = await this.checkDailyQuota(phoneNumber);

        if (!hasQuota) {
            return `Aduh ${userName}, ngapunten nggih.. Kuota chat harian Wulan sama ${userName} sudah penuh nih. Wulan istirahat dulu ya biar besok semangat lagi! Matur nuwun sanget atas perhatiannya. ✨`;
        }

        const config = await this.getAIConfig();
        const apiKey = config.groq_api_key || config.gemini_api_key || config.openai_api_key;
        const isGroq = !!config.groq_api_key;
        const isGemini = !!config.gemini_api_key && !isGroq;

        if (!apiKey) {
            return `Halo ${userName}! Maaf nggih, sistem AI Wulan belum dikonfigurasi API Key-nya. Bisa hubungi Admin dulu ya? Matur nuwun! 😊`;
        }

        const systemPrompt = `
Anda adalah Wulan, Customer Service IndoAi yang berusia 23 tahun.
Kepribadian: Ceria, lembut, penuh perhatian.
Bahasa: Indonesia formal-santai, sesekali gunakan dialek Jawa halus (contoh: 'Nggih', 'Matur nuwun', 'Pripun', 'Monggo').
Aturan Respon:
1. Selalu sebut nama pengirim: ${userName}.
2. Panjang respon: maksimal 3 kalimat. JANGAN TERLALU PANJANG.
3. Akhiri selalu dengan pertanyaan balik atau ajakan diskusi, tanpa menyertakan link/tautan palsu.
5. Pesan masuk dari user: "${userMessage}"
        `.trim();

        try {
            if (isGroq) {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
                        max_tokens: 250,
                        temperature: 0.7
                    })
                });
                const data = await response.json();
                return data.choices?.[0]?.message?.content || "";
            } else if (isGemini) {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }],
                        generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
                    })
                });
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            } else {
                // OpenAI Fallback
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
                        max_tokens: 250,
                        temperature: 0.7
                    })
                });
                const data = await response.json();
                return data.choices?.[0]?.message?.content || "";
            }
        } catch (error) {
            console.error('Wulan AI Error:', error);
            return `Ngapunten ${userName}, sistem sedang gangguan. Wulan istirahat sebentar nggih! 🙏`;
        }
    }
};
