import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const version = searchParams.get('version');

        if (!version) {
            return NextResponse.json({ success: false, error: 'Version missing' }, { status: 400 });
        }

        const dir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);

        if (!fs.existsSync(dir)) {
            return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 });
        }

        const files: string[] = [];

        function scanDir(currentDir: string, relativePath: string = '') {
            const items = fs.readdirSync(currentDir);

            items.forEach(item => {
                // Skip hidden files and unnecessary folders
                if (item.startsWith('.') || item === 'node_modules') return;

                const fullPath = path.join(currentDir, item);
                const itemRelativePath = path.join(relativePath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDir(fullPath, itemRelativePath);
                } else {
                    // Only standard web files
                    if (['.html', '.css', '.js', '.json', '.tsx', '.ts', '.txt'].includes(path.extname(item).toLowerCase())) {
                        files.push(itemRelativePath.replace(/\\/g, '/'));
                    }
                }
            });
        }

        scanDir(dir);

        return NextResponse.json({ success: true, files });

    } catch (error: any) {
        console.error('File List Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
