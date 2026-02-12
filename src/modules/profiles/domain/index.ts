export interface UserPermissions {
    can_download: boolean;
    access_materi: boolean;
    access_event: boolean;
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    membership_tier: 'free' | 'premium';
    badge_level: string;
    custom_permissions: UserPermissions;
    is_active: boolean;
    created_at: string;
}

export const PROFILES_MODULE = 'profiles';
