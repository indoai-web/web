-- ==========================================
-- INDOAI MASTER DATABASE SCHEMA
-- Version: 3.1.0 (Consolidated & Refined)
-- Last Updated: 2026-02-17
-- ==========================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HELPERS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (auth.jwt() ->> 'email' = 'admin@indoai.web.id') OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLES

-- PROFILES (Member & Admin Data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    membership_tier TEXT[] DEFAULT '{}'::text[],
    role TEXT DEFAULT 'member', -- member, admin
    badge_level TEXT DEFAULT 'Member',
    custom_permissions JSONB DEFAULT '{
        "can_download": false, 
        "access_materi": true, 
        "access_event": false
    }',
    assigned_landing_page TEXT,
    batches TEXT[] DEFAULT '{}'::text[],
    strict_protection BOOLEAN DEFAULT false,
    payout_details JSONB DEFAULT NULL,
    source_event TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    allowed_tools UUID[] DEFAULT '{}'::uuid[], -- New: Individual Tool Access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MODULE SETTINGS (Feat Toggle)
CREATE TABLE IF NOT EXISTS public.module_settings (
    module_name TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    location_link TEXT,
    is_premium_only BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WHATSAPP LOGS (Queue)
CREATE TABLE IF NOT EXISTS public.wa_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    retry_count INT DEFAULT 0,
    error_message TEXT,
    ai_response TEXT,
    fonnte_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_wa_logs_fonnte_id ON public.wa_logs(fonnte_id);

-- LANDING PAGES ENGINE
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    version_name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE
);

-- INVITATIONS SYSTEM
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    membership_tier TEXT[] DEFAULT '{free}'::text[],
    badge_level TEXT DEFAULT 'Member',
    wa_group_url TEXT DEFAULT 'https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_special_offer BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    member_discount NUMERIC DEFAULT 0,
    product_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONFIG: MEMBERSHIP TIERS
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#ffffff',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONFIG: BADGE LEVELS
CREATE TABLE IF NOT EXISTS public.badge_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    color_scheme TEXT DEFAULT 'default',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AFFILIATE: REFERRALS
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    commission_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, paid, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AFFILIATE: PAYOUTS
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, rejected
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- RESOURCES (Materials & Tools)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'material', -- material, tool
    category TEXT NOT NULL DEFAULT 'link', -- video, pdf, image, link
    content_url TEXT NOT NULL,
    allowed_tiers TEXT[] DEFAULT '{sultan}',
    downloads_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'approved', -- approved, pending
    group_name TEXT DEFAULT NULL,
    is_special_offer BOOLEAN DEFAULT false,
    price NUMERIC DEFAULT 0,
    member_discount NUMERIC DEFAULT 0,
    commission_per_sale NUMERIC DEFAULT 0,
    direct_checkout_url TEXT,
    sale_description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PREMIUM TOOLS SYSTEM (New)
CREATE TABLE IF NOT EXISTS public.premium_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    iframe_url TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Box',
    badge_text TEXT,
    allowed_badges TEXT[] DEFAULT '{}', -- Previous allowed_tiers logic moved here
    allowed_tags TEXT[] DEFAULT '{}', -- New Tag logic
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_tools ENABLE ROW LEVEL SECURITY;

-- GLOBAL ADMIN POLICY (Role-based & Email fallback)
DO $$ 
DECLARE
    tbl_name TEXT;
BEGIN
    FOR tbl_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admin Manage All" ON public.%I', tbl_name);
        EXECUTE format('DROP POLICY IF EXISTS "Admin Manage All Settings" ON public.%I', tbl_name);
        EXECUTE format('
            CREATE POLICY "Admin Manage All" ON public.%I 
            FOR ALL 
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin())
        ', tbl_name);
    END LOOP;
END $$;

-- MEMBER POLICIES
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view enabled modules" ON public.module_settings FOR SELECT USING (true);

CREATE POLICY "Everyone can view non-premium events" ON public.events 
FOR SELECT USING (is_premium_only = false OR (auth.role() = 'authenticated'));

CREATE POLICY "Public can view active landing page" ON public.landing_pages 
FOR SELECT USING (is_active = true OR (auth.role() = 'authenticated'));

CREATE POLICY "Public can view active invitations" ON public.invitations 
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Public can view tiers" ON public.membership_tiers FOR SELECT USING (true);
CREATE POLICY "Public can view badges" ON public.badge_levels FOR SELECT USING (true);

CREATE POLICY "Member can view allowed resources" ON public.resources 
FOR SELECT USING (
    (public.is_admin()) OR 
    (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.membership_tier && resources.allowed_tiers)
    ))
);

CREATE POLICY "Users can view their own referrals" ON public.affiliate_referrals 
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can view their own payouts" ON public.affiliate_payouts 
FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own payout requests" ON public.affiliate_payouts 
FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Premium Tools Policies
-- Policy: Member can see the tool if:
-- 1. Admin (always)
-- 2. Their tier matches allowed_tags
-- 3. Their badge matches allowed_badges
-- 4. The tool ID is in their personal allowed_tools array
DROP POLICY IF EXISTS "Member can view allowed tools" ON public.premium_tools;
CREATE POLICY "Member can view allowed tools" 
ON public.premium_tools 
FOR SELECT 
TO authenticated
USING (
    (public.is_admin()) OR 
    (is_active = true AND (
        (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                (profiles.membership_tier && premium_tools.allowed_tags) OR
                (ARRAY[profiles.badge_level] && premium_tools.allowed_badges)
            )
        )) OR
        (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (premium_tools.id = ANY(profiles.allowed_tools))
        ))
    ))
);

-- 4. STORAGE SETUP

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can manage their own avatar" ON storage.objects FOR ALL USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. SEED INITIAL DATA

INSERT INTO public.module_settings (module_name, is_enabled, metadata) VALUES 
('auth', true, '{}'), 
('profiles', true, '{}'), 
('events', true, '{}'), 
('downloads', true, '{}'), 
('landing-pages', true, '{}'), 
('messaging-wa', true, '{"api_token": "", "device_id": ""}'),
('system-config', true, '{"openai_api_key": "", "groq_api_key": ""}'),
('premium-tools', true, '{}')
ON CONFLICT (module_name) DO NOTHING;

INSERT INTO public.membership_tiers (label, value, color, sort_order) VALUES 
('Free', 'free', '#a3ff12', 1), 
('Premium', 'premium', '#3b82f6', 2), 
('Elite', 'elite', '#0FFFFF', 3), 
('Sultan', 'sultan', '#fbbf24', 4)
ON CONFLICT (value) DO NOTHING;

INSERT INTO public.badge_levels (label, value, color_scheme, sort_order) VALUES 
('Member', 'member', 'green', 1), 
('Pro', 'pro', 'red', 2), 
('Elite', 'elite', 'gold', 3), 
('Sultan', 'sultan', 'sultan', 4)
ON CONFLICT (value) DO NOTHING;

INSERT INTO public.landing_pages (version_name, is_active) VALUES ('v1', true)
ON CONFLICT (version_name) DO NOTHING;

-- Sample Resources
INSERT INTO public.resources (title, description, type, category, content_url, allowed_tiers, downloads_count)
VALUES 
    ('Strategi AI Marketing 2026', 'Panduan lengkap strategi marketing masa depan.', 'material', 'pdf', 'https://example.com/marketing-2026.pdf', '{premium, sultan}', 145),
    ('Prompt Engineering Masterclass', 'Video tutorial advance prompt engineering.', 'material', 'video', 'https://example.com/masterclass-prompt.mp4', '{sultan}', 89),
    ('Basic AI Tools Guide', 'Cara penggunaan alat AI dasar untuk pemula.', 'material', 'pdf', 'https://example.com/basic-ai.pdf', '{free, premium, sultan}', 230),
    ('Nano Banana Automation', 'Desktop tool untuk otomatisasi posting.', 'tool', 'link', 'https://nanobanana.pro/download', '{premium, sultan}', 55)
ON CONFLICT DO NOTHING;

-- Seed Premium Tools (Refined)
INSERT INTO public.premium_tools (name, slug, description, iframe_url, icon_name, badge_text, allowed_tags, is_active, sort_order)
VALUES 
    (
        'n8n Master Suite', 'n8n-master', 'Automasi tingkat tinggi dengan node-based workflow.', 
        '/Tool/n8n-master/index.html', 'Zap', 'LEGENDARY', '{"n8n-master"}', true, 10
    ),
    (
        'YouTube Turbo Scraper', 'youtube-tools', 'Riset konten kompetitor dalam hitungan detik.', 
        '/Tool/youtube-tools/index.html', 'Youtube', 'HOT', '{"youtube-tools"}', true, 11
    ),
    (
        'SocMed Pro Automator', 'socmed-pro', 'Kelola banyak akun sosmed tanpa pusing.', 
        '/Tool/socmed-pro/index.html', 'Share2', 'V1.0', '{"socmed-pro"}', true, 12
    )
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    allowed_tags = EXCLUDED.allowed_tags;
