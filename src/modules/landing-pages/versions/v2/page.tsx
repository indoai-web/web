import React from 'react';

export default function LandingV2() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground overflow-hidden relative">
            {/* Gold Aurora Background Effects */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold-accent/10 rounded-full blur-[120px] -z-10 animate-aurora" />
            <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-yellow-accent/10 rounded-full blur-[120px] -z-10 animate-aurora delay-2000" />

            <main className="max-w-4xl w-full text-center space-y-12 relative z-10">
                <header className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-gold-accent/10 border border-gold-accent/20 text-[10px] font-black tracking-[0.3em] text-gold-accent uppercase mb-4">
                        IndoAi Edition V2
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                        IND<span className="text-gold-accent"><span style={{ backgroundColor: '#2dd4bf' }}><span style={{ backgroundColor: '#e11d48' }}>O</span></span></span> AI STUDIO
                    </h1>
                    <p className="text-sm md:text-base text-foreground/40 font-bold uppercase tracking-[0.4em]">
                        Luxury Gold Distribution System
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 rounded-2xl bg-card/20 backdrop-blur-3xl border border-white-border hover:border-gold-accent/30 transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-gold-accent/10 flex items-center justify-center text-gold-accent font-black mb-4 group-hover:bg-gold-accent group-hover:text-background transition-all">
                                {i}
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-tight mb-2">Module Feature 0{i}</h3>
                            <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
                                High performance neural architecture designed for scale and elegance.
                            </p>
                        </div>
                    ))}
                </section>

                <footer className="pt-8">
                    <button className="px-8 py-3 rounded-xl bg-gold-accent text-background font-black text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                        Launch Command
                    </button>
                </footer>
            </main>
        </div>
    );
}
