import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    let tempBuildDir = '';
    try {
        const { temp_zip, version } = await req.json();

        if (!temp_zip || !fs.existsSync(temp_zip)) {
            return NextResponse.json({ success: false, error: 'File sumber tidak ditemukan' }, { status: 400 });
        }

        const versionsDir = path.join(process.cwd(), 'src/modules/landing-pages/versions');
        const targetVersionDir = path.join(versionsDir, version);
        tempBuildDir = path.join(versionsDir, `.build_${version}`);

        // 1. Extract to temp build dir
        if (fs.existsSync(tempBuildDir)) fs.rmSync(tempBuildDir, { recursive: true, force: true });
        fs.mkdirSync(tempBuildDir, { recursive: true });

        const zip = new AdmZip(temp_zip);
        zip.extractAllTo(tempBuildDir, true);

        // Detect if it's nested (e.g., project-folder/package.json instead of package.json at root)
        let buildRoot = tempBuildDir;
        const entries = fs.readdirSync(tempBuildDir);
        if (entries.length === 1 && fs.statSync(path.join(tempBuildDir, entries[0])).isDirectory()) {
            buildRoot = path.join(tempBuildDir, entries[0]);
        }

        // 2. Build Process
        console.log(`Starting build for ${version} in ${buildRoot}...`);

        // npm install
        try {
            execSync('npm install --omit=optional', { cwd: buildRoot, stdio: 'inherit' });
        } catch (e) {
            console.warn('npm install warning (continuing if possible):', e);
        }

        // npm run build
        execSync('npm run build', { cwd: buildRoot, stdio: 'inherit' });

        // 3. Move dist to target version dir
        const distPath = path.join(buildRoot, 'dist');
        if (!fs.existsSync(distPath)) {
            throw new Error('Folder "dist" tidak ditemukan setelah build. Pastikan script build menghasilkan folder "dist".');
        }

        if (fs.existsSync(targetVersionDir)) fs.rmSync(targetVersionDir, { recursive: true, force: true });
        fs.mkdirSync(targetVersionDir, { recursive: true });

        // Copy dist content
        const distFiles = fs.readdirSync(distPath);
        distFiles.forEach(file => {
            const src = path.join(distPath, file);
            const dest = path.join(targetVersionDir, file);
            if (fs.statSync(src).isDirectory()) {
                fs.cpSync(src, dest, { recursive: true });
            } else {
                fs.copyFileSync(src, dest);
            }
        });

        // 4. Create wrapping page.tsx
        const filesInTarget = fs.readdirSync(targetVersionDir);
        let entryPoint = 'index.html';
        if (!filesInTarget.includes('index.html')) {
            const otherHtml = filesInTarget.filter(f => f.endsWith('.html'));
            if (otherHtml.length > 0) entryPoint = otherHtml[0];
        }

        const wrapperContent = `'use client';
import React from 'react';
export default function UploadedPage() {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
            <iframe 
                src="/api/landing-pages/view/${version}/${entryPoint}" 
                className="w-full h-full border-none shadow-2xl"
                title="Landing Page Preview"
            />
        </div>
    );
}
`;
        fs.writeFileSync(path.join(targetVersionDir, 'page.tsx'), wrapperContent);

        // 5. Register in Supabase
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
            .upsert({
                version_name: version,
                is_active: false,
                sort_order: (count || 0) + 1
            }, { onConflict: 'version_name' });

        if (dbError) throw dbError;

        // Clean up
        fs.rmSync(temp_zip, { force: true });
        fs.rmSync(tempBuildDir, { recursive: true, force: true });

        return NextResponse.json({
            success: true,
            version: version,
            message: 'Build server-side berhasil!'
        });

    } catch (error: any) {
        console.error('Build Error:', error);
        // Clean up on error if possible
        if (tempBuildDir && fs.existsSync(tempBuildDir)) {
            // fs.rmSync(tempBuildDir, { recursive: true, force: true });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
