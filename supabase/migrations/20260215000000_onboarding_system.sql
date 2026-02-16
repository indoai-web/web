-- Add source_event and notes to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS source_event TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  membership_tier TEXT DEFAULT 'free',
  badge_level TEXT DEFAULT 'Member',
  wa_group_url TEXT DEFAULT 'https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- NOTE: Ensure these policies are applied via Supabase Dashboard or CLI
-- CREATE POLICY "Admins can do everything on invitations" ON invitations 
--   FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- CREATE POLICY "Public can view active invitations" ON invitations 
--   FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
