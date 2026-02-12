import { supabase } from '@/shared/lib/supabase-client';

export interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    location_link: string | null;
    is_premium_only: boolean;
}

export const eventRepository = {
    async getEvents(): Promise<Event[]> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            return [];
        }

        return data as Event[];
    }
};
