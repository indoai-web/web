import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);

        // 1. Determine version name
        const versionsDir = path.join(process.cwd(), 'src/modules/landing-pages/versions');
        if (!fs.existsSync(versionsDir)) fs.mkdirSync(versionsDir, { recursive: true });

        const folders = fs.readdirSync(versionsDir).filter(f => fs.statSync(path.join(versionsDir, f)).isDirectory());

        let maxNum = 0;
        folders.forEach(f => {
            const match = f.match(/^v(\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNum) maxNum = num;
            }
        });

        const nextVersion = `v${maxNum + 1}`;
        const targetDir = path.join(versionsDir, nextVersion);

        // --- NEW: Raw Source Detection ---
        const entries = zip.getEntries();
        const hasPackageJson = entries.some(e => e.entryName.endsWith('package.json'));
        const hasIndexHtml = entries.some(e => e.entryName === 'index.html' || (e.entryName.includes('/') && e.entryName.endsWith('/index.html') && e.entryName.split('/').length <= 2));

        // If it has package.json but NO index.html at root level, it's likely a raw source
        if (hasPackageJson && !hasIndexHtml) {
            // Save as temporary for building
            const tempUploadDir = path.join(versionsDir, '.temp_uploads');
            if (!fs.existsSync(tempUploadDir)) fs.mkdirSync(tempUploadDir, { recursive: true });

            const tempZipPath = path.join(tempUploadDir, `${nextVersion}_raw.zip`);
            fs.writeFileSync(tempZipPath, buffer);

            return NextResponse.json({
                success: true,
                needs_build: true,
                version: nextVersion,
                temp_zip: tempZipPath,
                message: 'Terdeteksi file mentah (Raw Source Code).'
            });
        }
        // --- END Detection ---

        // 2. Extract (Normal Flow)
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        zip.extractAllTo(targetDir, true);

        // 3. Post-extraction check: Ensure there's a page.tsx
        const hasPageTsx = fs.existsSync(path.join(targetDir, 'page.tsx'));
        const filesInRoot = fs.readdirSync(targetDir);

        // Find the best entry point: index.html first, then any other .html file
        let entryPoint = 'index.html';
        const isIndexPresent = filesInRoot.includes('index.html');

        if (!isIndexPresent) {
            const otherHtmlFiles = filesInRoot.filter(f => f.endsWith('.html'));
            if (otherHtmlFiles.length > 0) {
                entryPoint = otherHtmlFiles[0]; // Take the first available html
            }
        }

        const actualEntryPointExists = fs.existsSync(path.join(targetDir, entryPoint));

        if (!hasPageTsx && actualEntryPointExists) {
            const wrapperContent = `'use client';

import React from 'react';

/**
 * Auto-generated wrapper for uploaded HTML website
 */
export default function UploadedPage() {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
            <iframe 
                src="/api/landing-pages/view/${nextVersion}/${entryPoint}" 
                className="w-full h-full border-none shadow-2xl"
                title="Landing Page Preview"
            />
        </div>
    );
}
`;
            fs.writeFileSync(path.join(targetDir, 'page.tsx'), wrapperContent);
        } else if (!hasPageTsx) {
            // Basic fallback if neither exists
            const fallbackContent = `'use client';
export default function Fallback() {
    return <div className="p-20 text-center font-bold">Web ini tidak memiliki page.tsx atau index.html</div>;
}
`;
            fs.writeFileSync(path.join(targetDir, 'page.tsx'), fallbackContent);
        }

        // 4. Handle schema.sql (Advanced Part)
        const schemaPath = path.join(targetDir, 'schema.sql');
        let sqlNote = '';
        if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            // Instruction: We won't auto-execute complex SQL here for safety, 
            // but we register its existence and let the admin know.
            sqlNote = 'Ditemukan file schema.sql. Mohon jalankan secara manual di Supabase Editor.';
        }

        // 5. Register in DB
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) { return cookieStore.get(name)?.value; },
                },
            }
        );

        const { count } = await supabase.from('landing_pages').select('*', { count: 'exact', head: true });

        const { error: dbError } = await supabase
            .from('landing_pages')
            .insert({
                version_name: nextVersion,
                is_active: false,
                sort_order: (count || 0) + 1
            });

        if (dbError) throw dbError;

        return NextResponse.json({
            success: true,
            version: nextVersion,
            message: 'Berhasil diupload dan diekstrak!',
            warning: sqlNote
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
