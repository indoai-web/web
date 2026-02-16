export interface Material {
    id: string;
    title: string;
    description: string;
    category: 'Video' | 'PDF' | 'E-Book' | 'Template';
    file_url: string;
    thumbnail_url?: string;
    min_badge: 'Member' | 'VIP' | 'Sultan';
    allowed_batches?: string[]; // Optional: specific group access
    created_at: string;
}

export interface AiTool {
    id: string;
    name: string;
    description: string;
    tool_url: string;
    owner_id?: string; // If owned by a member
    is_public: boolean; // Sharing with other members
    is_approved: boolean; // Admin approval status
    category: 'Automation' | 'Design' | 'Marketing' | 'Others';
    created_at: string;
}
