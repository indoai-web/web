import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const version = searchParams.get('version');
        const file = searchParams.get('file') || 'index.html';

        if (!version) return new Response('Missing version', { status: 400 });

        const versionDir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        let filePath = path.join(versionDir, file);

        // Priority logic: If the file exists in 'dist' folder, use it.
        // This handles cases where the user uploads a full Vite/React project instead of just the build output.
        // We prefer 'dist' because the root index.html in a Vite project is just a template.
        const distPath = path.join(versionDir, 'dist', file);
        if (fs.existsSync(distPath)) {
            filePath = distPath;
        } else if (!fs.existsSync(filePath)) {
            return new Response(`File not found: ${file} in ${version}`, { status: 404 });
        }

        const content = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();

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

        // Only inject script for HTML files
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

            const editHelperScript = `
                <style>
                    .visual-edit-hover { outline: 2px dashed #2dd4bf !important; cursor: pointer !important; position: relative; }
                    .visual-edit-hover::after { 
                        content: "Click to Edit"; 
                        position: absolute; top: -20px; right: 0; 
                        background: #2dd4bf; color: black; font-size: 8px; font-weight: bold; padding: 2px 4px; border-radius: 2px; z-index: 10000;
                        text-transform: uppercase; white-space: nowrap;
                    }
                </style>
                <script>
                    document.addEventListener('mouseover', (e) => {
                        const target = e.target;
                        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'IMG', 'A', 'BUTTON', 'LI'].includes(target.tagName)) {
                            target.classList.add('visual-edit-hover');
                        }
                    });
                    document.addEventListener('mouseout', (e) => {
                        e.target.classList.remove('visual-edit-hover');
                    });
                    document.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const target = e.target;
                        const data = {
                            type: 'VISUAL_ELEMENT_SELECTED',
                            tagName: target.tagName,
                            content: target.tagName === 'IMG' ? target.src : target.innerText,
                            id: target.id || '',
                            className: target.className || '',
                            originalContent: target.tagName === 'IMG' ? target.src : target.innerText
                        };
                        window.parent.postMessage(data, '*');
                    });
                </script>
            `;

            // 2. Make paths relative so they work regardless of subdirectory (root or dist)
            // This works because our API (top of this file) automatically checks 'dist/' 
            // if the file isn't found in the root of the version folder.
            body = body.replace(/src="\/assets\//g, 'src="assets/');
            body = body.replace(/href="\/assets\//g, 'href="assets/');
            body = body.replace(/src='\/assets\//g, "src='assets/");
            body = body.replace(/href='\/assets\//g, "href='assets/");

            if (body.includes('</body>')) {
                body = body.replace('</body>', `${editHelperScript}</body>`);
            } else {
                body += editHelperScript;
            }

            return new Response(body, {
                headers: { 'Content-Type': contentType },
            });
        }

        // Return binary content directly for images/others
        return new Response(content, {
            headers: { 'Content-Type': contentType },
        });

    } catch (error: any) {
        return new Response(error.message, { status: 500 });
    }
}
