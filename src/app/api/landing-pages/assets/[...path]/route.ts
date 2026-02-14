import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/shared/lib/supabase-client';

/**
 * Global Asset Proxy
 * Catches any request to /api/landing-pages/assets/...
 * and serves it from the CURRENTLY ACTIVE landing page version.
 * This fixes absolute path issues in external landing pages (e.g. Vite builds).
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: assetPathSegments } = await params;
        if (!assetPathSegments || assetPathSegments.length === 0) {
            return new Response('Missing asset path', { status: 400 });
        }

        const assetPath = assetPathSegments.join('/');

        // 1. Get the active version from Supabase
        const { data: activePage, error: dbError } = await supabase
            .from('landing_pages')
            .select('version_name')
            .eq('is_active', true)
            .single();

        if (dbError || !activePage) {
            return new Response('No active landing page found to resolve asset', { status: 404 });
        }

        const version = activePage.version_name;
        const versionDir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);

        // 2. Try to find the file in 'dist/assets' or 'assets' of the active version
        let filePath = path.join(versionDir, 'dist', 'assets', assetPath);

        // If not in dist/assets, try root assets
        if (!fs.existsSync(filePath)) {
            filePath = path.join(versionDir, 'assets', assetPath);
        }

        // Final fallback: check root of the version (e.g. public files like vite.svg)
        if (!fs.existsSync(filePath)) {
            filePath = path.join(versionDir, assetPath);
        }

        if (!fs.existsSync(filePath)) {
            return new Response(`Asset not found: ${assetPath} in active version ${version}`, { status: 404 });
        }

        const content = fs.readFileSync(filePath);
        const ext = path.extname(assetPath).toLowerCase();

        const mimes: Record<string, string> = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.otf': 'font/otf',
        };

        const contentType = mimes[ext] || 'application/octet-stream';

        return new Response(content, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            },
        });

    } catch (error: any) {
        return new Response(error.message, { status: 500 });
    }
}
