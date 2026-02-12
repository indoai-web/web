import { supabase } from '@/shared/lib/supabase-client';

export const messagingRepository = {
    async enqueueMessage(phoneNumber: string, message: string): Promise<boolean> {
        const { error } = await supabase
            .from('wa_logs')
            .insert({
                phone_number: phoneNumber,
                message: message,
                status: 'pending'
            });

        if (error) {
            console.error('Error enqueuing WA message:', error);
            return false;
        }

        return true;
    }
};
