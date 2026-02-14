import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Proteksi rute /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Alihkan /login ke /dashboard jika sudah login
    if (request.nextUrl.pathname.startsWith('/login')) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
