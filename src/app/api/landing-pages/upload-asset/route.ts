import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const version = formData.get('version') as string;

        if (!file || !version) {
            return NextResponse.json({ success: false, error: 'File and version are required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Security: Ensure version directory exists
        const dir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        if (!fs.existsSync(dir)) {
            return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 });
        }

        // Create assets folder if not exists
        const assetsDir = path.join(dir, 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        // Save file
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(assetsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // In landing pages, we serve assets relative to the root via serve-html
        // So the source URL should be 'assets/filename'
        const publicUrl = `assets/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
