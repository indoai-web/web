import { NextResponse } from 'next/server';
// Rebuild Sync 2026-02-16: auth-helpers only
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        console.log('--- Starting Sync Process ---');
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // 1. Scan the versions directory
        const versionsDir = path.join(process.cwd(), 'src/modules/landing-pages/versions');
        console.log('Scanning directory:', versionsDir);

        if (!fs.existsSync(versionsDir)) {
            console.error('Directory not found:', versionsDir);
            return NextResponse.json({ success: false, error: 'Versions directory not found' }, { status: 404 });
        }

        const folders = fs.readdirSync(versionsDir).filter((file: string) =>
            fs.statSync(path.join(versionsDir, file)).isDirectory()
        );
        console.log('Folders found on disk:', folders);

        // 2. Get existing versions from DB
        const { data: dbVersions, error: fetchError } = await supabase
            .from('landing_pages')
            .select('version_name');

        if (fetchError) {
            console.error('Database fetch error:', fetchError);
            throw fetchError;
        }

        const existingNames = dbVersions?.map((v: any) => v.version_name) || [];
        console.log('Existing versions in DB:', existingNames);

        const newFolders = folders.filter((f: string) => !existingNames.includes(f));
        console.log('New folders to sync:', newFolders);

        // 3. Insert new folders into DB
        if (newFolders.length > 0) {
            const inserts = newFolders.map(name => ({
                version_name: name,
                is_active: false
            }));

            const { error: insertError } = await supabase
                .from('landing_pages')
                .insert(inserts);

            if (insertError) {
                console.error('Database insert error:', insertError);
                throw insertError;
            }
            console.log('Successfully inserted new versions:', newFolders);
        }

        console.log('--- Sync Process Completed ---');
        return NextResponse.json({
            success: true,
            synced: folders.length,
            added: newFolders.length,
            folders: folders
        });

    } catch (error: any) {
        console.error('CRITICAL Sync error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
