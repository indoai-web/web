import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { version, filename } = await req.json();

        if (!version || !filename) {
            return NextResponse.json({ success: false, error: 'Version and filename are required' }, { status: 400 });
        }

        // Security: Basic injection check
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
        }

        const dir = path.join(process.cwd(), 'src/modules/landing-pages/versions', version);
        if (!fs.existsSync(dir)) {
            return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 });
        }

        const filePath = path.join(dir, filename);
        if (fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File already exists' }, { status: 400 });
        }

        const ext = filename.split('.').pop()?.toLowerCase();
        let boilerplate = '';

        if (ext === 'html') {
            boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Page</title>
</head>
<body>
    <h1>New Content for ${version}</h1>
</body>
</html>`;
        } else if (ext === 'tsx' || ext === 'jsx') {
            boilerplate = `import React from 'react';

export default function NewPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
            <h1 className="text-4xl font-bold">New Version Content</h1>
        </div>
    );
}`;
        } else if (ext === 'css') {
            boilerplate = `/* New Styles for ${version} */`;
        }

        fs.writeFileSync(filePath, boilerplate);

        return NextResponse.json({
            success: true,
            message: 'File created successfully',
            file: filename
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
