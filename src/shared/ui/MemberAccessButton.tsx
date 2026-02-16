'use client';

import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { MemberLoginModal } from './MemberLoginModal';

export const MemberAccessButton: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [targetPath, setTargetPath] = useState('#');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    setTargetPath('/dashboard');
                } else {
                    setTargetPath('/member');
                }
            }
        };
        checkSession();
    }, [supabase]);

    const handleAction = (e: React.MouseEvent) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-1000">
                <Link href={targetPath} onClick={handleAction} className="group">
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white-border/10 hover:border-gold-accent/40 hover:bg-gold-accent/5 transition-all duration-500 shadow-2xl">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gold-accent to-yellow-accent flex items-center justify-center shadow-lg shadow-gold-accent/20 group-hover:scale-110 transition-transform duration-500">
                            <Shield size={12} className="text-secondary" />
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent group-hover:text-yellow-accent">
                                {isLoggedIn ? 'Pro Hub Access' : 'Member Access'}
                            </span>
                            <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                                {isLoggedIn ? 'Enter Dashboard' : 'Secure Login'}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <MemberLoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};
