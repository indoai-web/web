-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  membership_tier TEXT DEFAULT 'free',
  badge_level TEXT DEFAULT 'member',
  custom_permissions JSONB DEFAULT '{
    "can_download": false, 
    "access_materi": true, 
    "access_event": false
  }',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Module Settings Table
CREATE TABLE module_settings (
  module_name TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location_link TEXT,
  is_premium_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. WhatsApp Logs (Queue Table)
CREATE TABLE wa_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  retry_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Landing Pages Table
CREATE TABLE landing_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version_name TEXT NOT NULL UNIQUE, -- e.g., 'v1', 'v2', 'valentine-special'
  is_active BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Module Settings Policies
CREATE POLICY "Public can view enabled modules" ON module_settings 
  FOR SELECT USING (true);

-- Events Policies
CREATE POLICY "Everyone can view non-premium events" ON events 
  FOR SELECT USING (is_premium_only = false OR (auth.role() = 'authenticated'));

-- Landing Pages Policies
CREATE POLICY "Public can view active landing page" ON landing_pages 
  FOR SELECT USING (is_active = true OR (auth.role() = 'authenticated'));

-- Insert Default Module Settings
INSERT INTO module_settings (module_name, is_enabled) VALUES 
('auth', true),
('profiles', true),
('events', true),
('downloads', true),
('landing-pages', true),
('messaging-wa', true);

-- Insert Default Landing Page
INSERT INTO landing_pages (version_name, is_active) VALUES ('v1', true);
