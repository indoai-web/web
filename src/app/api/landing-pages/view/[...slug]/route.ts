import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug } = await params;
        if (!slug || slug.length === 0) {
            return new Response('Missing version and file', { status: 400 });
        }

        const version = slug[0];
        const filePathRelative = slug.length > 1 ? slug.slice(1).join('/') : 'index.html';

        console.log(`[Landing View] serving ${version} -> ${filePathRelative}`);

        const versionDir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        let filePath = path.join(versionDir, filePathRelative);

        // Priority logic for 'dist' folder
        const distPath = path.join(versionDir, 'dist', filePathRelative);
        if (fs.existsSync(distPath)) {
            filePath = distPath;
        } else if (!fs.existsSync(filePath)) {
            return new Response(`File not found: ${filePathRelative} in ${version}`, { status: 404 });
        }

        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePathRelative).toLowerCase();

        const mimes: Record<string, string> = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
        };

        const contentType = mimes[ext] || 'application/octet-stream';

        if (contentType === 'text/html') {
            let body = content.toString();

            // Inject Google Fonts
            const googleFonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Outfit:wght@400;900&family=Playfair+Display:ital,wght@0,400;0,900;1,400&family=Poppins:wght@400;900&family=Inter:wght@400;900&display=swap" rel="stylesheet">';
            if (body.includes('</head>')) {
                body = body.replace('</head>', `${googleFonts}</head>`);
            } else if (body.includes('<head>')) {
                body = body.replace('<head>', `<head>${googleFonts}`);
            } else {
                body = googleFonts + body;
            }

            // 2. Make paths relative so they work with this catch-all route
            // Vite builds use /assets/ which would bypass our route
            body = body.replace(/src="\/assets\//g, 'src="assets/');
            body = body.replace(/href="\/assets\//g, 'href="assets/');
            body = body.replace(/src='\/assets\//g, "src='assets/");
            body = body.replace(/href='\/assets\//g, "href='assets/");

            return new Response(body, {
                headers: { 'Content-Type': contentType },
            });
        }

        return new Response(content, {
            headers: { 'Content-Type': contentType },
        });

    } catch (error: any) {
        return new Response(error.message, { status: 500 });
    }
}
