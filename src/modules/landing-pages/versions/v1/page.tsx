import React from 'react';

export default function LandingV1() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground overflow-hidden relative">
            {/* Aurora Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-accent/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

            <main className="max-w-4xl w-full text-center space-y-12">
                <header className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-accent to-violet-accent">
                        INDO AI
                    </h1>
                    <p className="text-xl md:text-2xl text-foreground/60 font-medium tracking-wide">
                        Deep Earth & Aurora Design System
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-card backdrop-blur-xl border border-white-border hover:border-teal-accent/50 transition-all group">
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-teal-accent transition-colors">Modular Architecture</h3>
                        <p className="text-foreground/50 leading-relaxed">
                            Strict boundaries enforced by ESLint. No cross-module internal imports allowed.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-card backdrop-blur-xl border border-white-border hover:border-violet-accent/50 transition-all group">
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-violet-accent transition-colors">Supabase Backend</h3>
                        <p className="text-foreground/50 leading-relaxed">
                            Secure authentication, signed URLs for downloads, and asynchronous WA workers.
                        </p>
                    </div>
                </section>

                <footer className="pt-12">
                    <button className="px-12 py-4 rounded-full bg-gradient-to-r from-teal-accent to-violet-accent text-background font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                        GET STARTED
                    </button>
                </footer>
            </main>
        </div>
    );
}
