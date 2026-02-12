import { supabase } from '@/shared/lib/supabase-client';

export const moduleSettingsRepository = {
    async isEnabled(moduleName: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('module_settings')
            .select('is_enabled')
            .eq('module_name', moduleName)
            .single();

        if (error || !data) {
            console.error(`Error checking module status for ${moduleName}:`, error);
            return false;
        }

        return data.is_enabled;
    },

    async getAllSettings() {
        const { data, error } = await supabase
            .from('module_settings')
            .select('*');

        if (error) {
            console.error('Error fetching all module settings:', error);
            return [];
        }

        return data;
    }
};
