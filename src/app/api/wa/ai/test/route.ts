
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { provider, apiKey } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key is required' }, { status: 400 });
        }

        if (provider === 'groq') {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return NextResponse.json({ success: true, message: 'Groq API Key is valid' });
            } else {
                const errorData = await response.json();
                return NextResponse.json({ success: false, error: errorData.error?.message || 'Invalid Groq API Key' });
            }
        }

        if (provider === 'gemini') {
            // Test Gemini with a simple list models or a small generation request
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

            if (response.ok) {
                return NextResponse.json({ success: true, message: 'Gemini API Key is valid' });
            } else {
                const errorData = await response.json();
                return NextResponse.json({ success: false, error: errorData.error?.message || 'Invalid Gemini API Key' });
            }
        }

        return NextResponse.json({ success: false, error: 'Unsupported provider' }, { status: 400 });

    } catch (error: any) {
        console.error('AI Test Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
