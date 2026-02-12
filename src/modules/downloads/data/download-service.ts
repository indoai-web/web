import { supabase } from '@/shared/lib/supabase-client';

export const downloadService = {
    async getSignedUrl(bucketName: string, path: string, expiresIn: number = 3600): Promise<string | null> {
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Error generating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    }
};
