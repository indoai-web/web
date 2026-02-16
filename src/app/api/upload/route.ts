import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Define upload directory
        const uploadDir = path.join(process.cwd(), 'public/uploads/materials');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Clean filename and add timestamp to avoid collisions
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${timestamp}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        // Write file
        fs.writeFileSync(filePath, buffer);

        // Public URL
        const publicUrl = `/uploads/materials/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            message: 'File berhasil diupload!'
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
