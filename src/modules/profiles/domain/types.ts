export interface UserPermissions {
    can_download: boolean;
    access_materi: boolean;
    access_event: boolean;
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    membership_tier: string[];
    role: 'admin' | 'member';
    badge_level: string;
    custom_permissions: UserPermissions;
    assigned_landing_page: string | null;
    batches: string[]; // Grouping members
    strict_protection: boolean; // Whitelist/Bypass toggle
    is_active: boolean;
    created_at: string;
}
