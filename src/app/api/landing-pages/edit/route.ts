import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const version = searchParams.get('version');
        const fileParam = searchParams.get('file');

        if (!version) return NextResponse.json({ success: false, error: 'Version missing' }, { status: 400 });

        const dir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        let filePath;

        if (fileParam) {
            // Security: Prevent directory traversal
            const targetPath = path.join(dir, fileParam);
            if (!targetPath.startsWith(dir)) {
                return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 403 });
            }
            filePath = targetPath;
        } else {
            // Default behavior
            filePath = path.join(dir, 'index.html');
            if (!fs.existsSync(filePath)) {
                filePath = path.join(dir, 'page.tsx');
            }
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath).toLowerCase();

        // Mode detection
        let mode = 'html';
        if (ext === '.tsx' || ext === '.ts') mode = 'typescript';
        else if (ext === '.js' || ext === '.jsx') mode = 'javascript';
        else if (ext === '.css') mode = 'css';
        else if (ext === '.json') mode = 'json';

        return NextResponse.json({ success: true, content, type: ext, mode });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { version, content, file } = await req.json();

        if (!version || content === undefined) {
            return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
        }

        const dir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        let filePath;

        if (file) {
            // Security: Prevent directory traversal
            const targetPath = path.join(dir, file);
            if (!targetPath.startsWith(dir)) {
                return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 403 });
            }
            filePath = targetPath;
        } else {
            filePath = path.join(dir, 'index.html');
            if (!fs.existsSync(filePath)) {
                filePath = path.join(dir, 'page.tsx');
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
