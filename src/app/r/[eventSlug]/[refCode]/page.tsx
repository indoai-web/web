'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CloakRedirect() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const { eventSlug, refCode } = params;
        if (eventSlug && refCode) {
            // Redirect to the actual join page with the referral code
            router.replace(`/join/${eventSlug}?aff=${refCode}`);
        } else {
            router.replace('/');
        }
    }, [params, router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-gold-accent uppercase tracking-[0.3em] animate-pulse">Securing Link</span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">IndoAi Redirect Service</span>
            </div>
        </div>
    );
}
