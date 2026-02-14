import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
    try {
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

        // 1. Get the next version name
        const versionsDir = path.join(process.cwd(), 'src/modules/landing-pages/versions');
        const folders = fs.readdirSync(versionsDir).filter((file: string) =>
            fs.statSync(path.join(versionsDir, file)).isDirectory()
        );

        // Simple logic: find the highest 'vX' and increment
        let maxNum = 0;
        folders.forEach(f => {
            const match = f.match(/^v(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNum) maxNum = num;
            }
        });

        const nextVersion = `v${maxNum + 1}`;
        const newDir = path.join(versionsDir, nextVersion);

        // 2. Create the physical directory
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        // 3. Create a template page.tsx
        const templateContent = `'use client';

import React from 'react';

/**
 * Landing Page - ${nextVersion}
 * Created via Dashboard
 */
export default function LandingPage${nextVersion}() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-zinc-900 to-black">
            <div className="w-20 h-1 bg-amber-500 mb-8 rounded-full" />
            <h1 className="text-5xl font-black mb-4 tracking-tighter">EDITION ${nextVersion}</h1>
            <p className="text-zinc-500 uppercase tracking-[0.4em] text-xs font-bold mb-12">New Generation AI Workspace</p>
            
            <div className="max-w-2xl text-zinc-400 leading-relaxed font-medium">
                Welcome to your new landing page version. You can edit this file in 
                <code className="text-amber-500/80 mx-2">src/modules/landing-pages/versions/${nextVersion}/page.tsx</code>
                to customize the layout and design.
            </div>

            <button className="mt-12 px-8 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 transition-transform active:scale-95">
                Explore Features
            </button>
        </div>
    );
}
`;

        fs.writeFileSync(path.join(newDir, 'page.tsx'), templateContent);

        // 4. Insert into DB
        const { count } = await supabase.from('landing_pages').select('*', { count: 'exact', head: true });

        const { error: insertError } = await supabase
            .from('landing_pages')
            .insert({
                version_name: nextVersion,
                is_active: false,
                sort_order: (count || 0) + 1
            });

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            // Even if DB fails, folder is created. Sync will pick it up later.
            return NextResponse.json({
                success: true,
                version: nextVersion,
                warning: 'Folder created but DB registration failed due to RLS. Please run the SQL fix.'
            });
        }

        return NextResponse.json({
            success: true,
            version: nextVersion
        });

    } catch (error: any) {
        console.error('Create error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
