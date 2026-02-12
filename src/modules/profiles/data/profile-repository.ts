import { supabase } from '@/shared/lib/supabase-client';
import { UserProfile } from '../domain/types';

export const profileRepository = {
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data as UserProfile;
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            return false;
        }

        return true;
    }
};
