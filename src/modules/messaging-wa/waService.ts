import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS for logs
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface FonnteResponse {
    status: boolean;
    id?: string;
    data?: any;
    detail?: string;
    message?: string;
    url?: string;
    device_status?: string;
    reason?: string;
}

export const waService = {
    /**
     * Get Fonnte API Configuration from Database
     */
    async getConfig() {
        const { data, error } = await supabaseAdmin
            .from('module_settings')
            .select('metadata')
            .eq('module_name', 'messaging-wa')
            .single();

        if (error || !data) return { api_token: '', device_id: '' };
        return data.metadata as { api_token: string; device_id: string };
    },

    /**
     * Send Message via Fonnte
     */
    async sendMessage(params: {
        to: string | string[];
        message: string;
        file?: string;
        url?: string;
        delay?: string;
        type?: 'text' | 'image' | 'file' | 'video';
    }): Promise<FonnteResponse> {
        const config = await this.getConfig();
        if (!config.api_token) {
            return { status: false, detail: 'API Token not configured' };
        }

        try {
            const formData = new FormData();
            const targetStr = Array.isArray(params.to) ? params.to.join(',') : params.to;

            formData.append('target', targetStr);
            formData.append('message', params.message);
            if (params.file) formData.append('file', params.file);
            if (params.url) formData.append('url', params.url);
            if (params.delay) formData.append('delay', params.delay);
            if (config.device_id) formData.append('device', config.device_id);

            const response = await fetch('https://api.fonnte.com/send', {
                method: 'POST',
                headers: {
                    'Authorization': config.api_token
                },
                body: formData
            });

            const result = await response.json();

            // Log to wa_logs
            const targets = Array.isArray(params.to) ? params.to : [params.to];
            const logEntries = targets.map(t => {
                // Extract phone even if it's in format phone|name
                const phoneNumber = t.includes('|') ? t.split('|')[0] : t;
                return {
                    phone_number: phoneNumber,
                    message: params.message,
                    status: result.status ? 'sent' : 'failed',
                    fonnte_id: result.id || (result.data && result.data[0]?.id) || null,
                    error_message: result.detail || result.message || null
                };
            });

            const { error: logError } = await supabaseAdmin.from('wa_logs').insert(logEntries);
            if (logError) {
                console.error('Failed to save wa_logs:', logError);
            }

            return result;
        } catch (error: any) {
            console.error('Fonnte Send Error:', error);
            return { status: false, detail: error.message };
        }
    },

    /**
     * Validate WhatsApp Number
     */
    async validateNumber(target: string): Promise<FonnteResponse> {
        const config = await this.getConfig();
        try {
            const formData = new FormData();
            formData.append('target', target);

            const response = await fetch('https://api.fonnte.com/validate', {
                method: 'POST',
                headers: { 'Authorization': config.api_token },
                body: formData
            });

            return await response.json();
        } catch (error: any) {
            return { status: false, detail: error.message };
        }
    },

    /**
     * Get Group List
     */
    async getGroups(): Promise<FonnteResponse> {
        const config = await this.getConfig();
        try {
            const response = await fetch('https://api.fonnte.com/get-groups', {
                method: 'POST',
                headers: { 'Authorization': config.api_token }
            });

            return await response.json();
        } catch (error: any) {
            return { status: false, detail: error.message };
        }
    },

    /**
     * Get QR Code for Device Pairing
     * @param token Optional token if fetched elsewhere
     */
    async getQr(token?: string): Promise<FonnteResponse> {
        const apiToken = token || (await this.getConfig()).api_token;
        if (!apiToken) return { status: false, detail: 'Token tidak ditemukan' };

        try {
            const response = await fetch('https://api.fonnte.com/qr', {
                method: 'POST',
                headers: { 'Authorization': apiToken }
            });

            const result = await response.json();

            // Robust QR Data detection
            let qrData = result.url || result.data?.url || (typeof result.data === 'string' ? result.data : null);

            if (result.status) {
                if (qrData && qrData !== 'None') {
                    // Normalize Base64
                    if (!qrData.startsWith('http') && !qrData.startsWith('data:')) {
                        qrData = `data:image/png;base64,${qrData}`;
                    }
                    result.url = qrData;
                } else if (result.message?.toLowerCase().includes('already') || result.detail?.toLowerCase().includes('already')) {
                    result.url = 'ALREADY_CONNECTED';
                }
            }

            return result;
        } catch (error: any) {
            console.error('Fonnte QR Error:', error);
            return { status: false, detail: error.message };
        }
    },

    /**
     * Get Device Profile (Singular)
     * @param token Optional token
     */
    async getDeviceProfile(token?: string): Promise<FonnteResponse> {
        const apiToken = token || (await this.getConfig()).api_token;
        if (!apiToken) return { status: false, detail: 'Token tidak ditemukan' };

        try {
            const response = await fetch('https://api.fonnte.com/device', {
                method: 'POST',
                headers: { 'Authorization': apiToken }
            });

            return await response.json();
        } catch (error: any) {
            return { status: false, detail: error.message };
        }
    },

    /**
     * Get All Devices List
     * @param token Optional token
     */
    async getDevices(token?: string): Promise<FonnteResponse> {
        const apiToken = token || (await this.getConfig()).api_token;
        if (!apiToken) return { status: false, detail: 'Token tidak ditemukan' };

        try {
            // Some APIs behave better with an empty body
            const response = await fetch('https://api.fonnte.com/get-devices', {
                method: 'POST',
                headers: { 'Authorization': apiToken },
                body: '{}'
            });

            return await response.json();
        } catch (error: any) {
            return { status: false, detail: error.message };
        }
    },

    /**
     * Disconnect Device
     * @param token Optional token if fetched elsewhere
     */
    async disconnect(token?: string): Promise<FonnteResponse> {
        const apiToken = token || (await this.getConfig()).api_token;
        if (!apiToken) return { status: false, detail: 'Token tidak ditemukan' };

        try {
            const response = await fetch('https://api.fonnte.com/disconnect', {
                method: 'POST',
                headers: { 'Authorization': apiToken }
            });

            return await response.json();
        } catch (error: any) {
            return { status: false, detail: error.message };
        }
    }
};
