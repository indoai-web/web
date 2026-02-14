"use client";

import React, { useState, useEffect } from 'react';

const BatikPattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <defs>
            <pattern id="batik-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Simplified Megamendung-inspired pattern */}
                <path d="M50 10 C70 10 80 25 80 40 C80 60 50 70 20 40 C20 25 30 10 50 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M50 20 C60 20 70 30 70 40 C70 50 50 60 30 40 C30 30 40 20 50 20" fill="none" stroke="currentColor" strokeWidth="0.3" />
                <path d="M0 80 C20 80 30 90 30 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M100 80 C80 80 70 90 70 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#batik-pattern)" />
    </svg>
);

export default function LandingV3() {
    const [timeLeft, setTimeLeft] = useState({ jam: 12, menit: 45, detik: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let d = prev.detik - 1;
                let m = prev.menit;
                let h = prev.jam;
                if (d < 0) { d = 59; m -= 1; }
                if (m < 0) { m = 59; h -= 1; }
                return { jam: h, menit: m, detik: d };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#070504] text-[#F9F6F2] font-sans selection:bg-[#D4AF37]/50 antialiased overflow-x-hidden">
            <BatikPattern />

            {/* Glowing Orbs */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/10 blur-[180px] rounded-full pointer-events-none animate-pulse" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2DD4BF]/5 blur-[180px] rounded-full pointer-events-none animate-pulse delay-1000" />

            {/* Top Hook Bar */}
            <div className="sticky top-0 z-[100] bg-[#D4AF37] text-black py-2.5 overflow-hidden border-b border-black/10">
                <div className="flex whitespace-nowrap animate-scroll items-center gap-12 font-black text-[10px] uppercase tracking-[0.3em]">
                    <span>🔥 SISA 14 SLOT TERAKHIR! AMANKAN SEKARANG</span>
                    <span>🎭 BANGUN ASET DIGITAL AI INFLUENCER ANDA</span>
                    <span>⚡ WEBINAR REVOLUSI AI 2026 - 14 FEBRUARI</span>
                    <span>🎁 GRATIS LIFETIME TOOL KHUSUS VIP MEMBER</span>
                    <span>🔥 SISA 14 SLOT TERAKHIR! AMANKAN SEKARANG</span>
                </div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7355] rounded-xl flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                        <span className="font-black text-black text-xs">IA</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-[0.4em] uppercase">IndoAi<span className="text-[#D4AF37]">.id</span></span>
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Digital Heritage</span>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
                    <a href="#kurikulum" className="hover:text-[#D4AF37] transition-colors">Program</a>
                    <a href="#vip" className="hover:text-[#D4AF37] transition-colors">VIP Benefit</a>
                    <a href="#bonus" className="hover:text-[#D4AF37] transition-colors">Bonus</a>
                </div>
                <button className="px-6 py-3 rounded-full border border-[#D4AF37]/20 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-black transition-all">
                    Member Access
                </button>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 pt-16 pb-32 px-6 md:px-12 max-w-6xl mx-auto text-center">
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-12 backdrop-blur-xl shadow-2xl">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Batch 2026: Pendaftaran VIP Dibuka Hari Ini</span>
                </div>

                <h1 className="text-5xl md:text-[100px] font-black leading-[0.9] tracking-tightest mb-12 max-w-5xl mx-auto">
                    WEBINAR: <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] via-white to-[#8B7355]">REVOLUSI AI INFLUENCER</span> 2026 🎭⚡
                </h1>

                <p className="max-w-3xl mx-auto text-base md:text-xl text-white/50 font-medium leading-relaxed mb-16 px-4">
                    "Bangun AI Influencer yang bisa jadi <span className="text-white font-bold italic">aset digital kamu</span>. Gantikan proses produksi konten yang melelahkan dengan mesin cerdas yang bekerja 24/7."
                </p>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-20 text-left">
                    {[
                        { label: 'TANGGAL & WAKTU', val: '14 Februari 2026', sub: '19.00 – 21.00 WIB (Zoom)' },
                        { label: 'INVESTASI / KONTRIBUSI', val: 'Rp 250.000,-', sub: 'Akses Sekali untuk Selamanya' },
                        { label: 'STATUS SLOT', val: 'SISA 14 SLOT', sub: 'Update 2 Menit Yang Lalu' },
                    ].map((card, i) => (
                        <div key={i} className={`p-8 rounded-[40px] border transition-all ${i === 1 ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_20px_60px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10 backdrop-blur-md'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${i === 1 ? 'text-black/60' : 'text-[#D4AF37]'}`}>{card.label}</p>
                            <p className="text-2xl font-black tracking-tighter leading-none mb-2">{card.val}</p>
                            <p className={`text-[11px] font-bold uppercase tracking-wide italic ${i === 1 ? 'text-black/40' : 'text-white/20'}`}>{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-12">
                    <a
                        href="https://lynk.id/romance/o2jmp6z4d7ov"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-full max-w-2xl py-8 rounded-[50px] bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-black font-black text-sm md:text-2xl uppercase tracking-[0.5em] shadow-[0_30px_100px_rgba(212,175,55,0.5)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-4">
                            DAFTAR SEKARANG <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </span>
                    </a>
                </div>
            </header>

            {/* Curriculum Section */}
            <section id="kurikulum" className="relative z-10 px-6 py-32 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-24 space-y-6">
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.5em]">The Learning Curve</p>
                    <h2 className="text-4xl md:text-8xl font-black tracking-tightest leading-none">Yang kamu <span className="opacity-20 italic">dapet:</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                        {[
                            { title: 'AI Influencer dari nol sampai launch', desc: 'Step-by-step membangun identitas tanpa repot syuting manual.' },
                            { title: 'Framework konten (pillar, hook, storytelling)', desc: 'Strategi biar ide kamu nggak mentok dan konten tetap viral.' },
                            { title: 'Panduan praktek: riset niche, visual, caption', desc: 'Riset rahasia untuk menemukan celah market yang paling profit.' },
                        ].map((item, i) => (
                            <div key={i} className="p-10 rounded-[50px] bg-white/3 border border-white/5 hover:border-[#D4AF37]/30 transition-all group">
                                <div className="text-5xl font-black text-[#D4AF37]/10 mb-6 group-hover:text-[#D4AF37]/40 transition-colors italic">0{i + 1}</div>
                                <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter leading-none">{item.title}</h3>
                                <p className="text-sm text-white/30 font-bold leading-relaxed uppercase tracking-[0.1em]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: 'List tools lengkap + Cara Pakainya', desc: 'Gratis Lifetime Tool VIP bagi member yang mendaftar hari ini.' },
                            { title: 'Akses Grup WhatsApp VIP Member', desc: 'Diskusi eksklusif, tips rahasia, & networking sesama kreator.' },
                            { title: 'Support Konten NSFW Support', desc: 'Dukungan pembuatan influencer untuk Niche khusus dewasa (18+).' },
                        ].map((item, i) => (
                            <div key={i} className="p-10 rounded-[50px] bg-white/3 border border-white/5 hover:border-[#D4AF37]/30 transition-all group shadow-2xl">
                                <div className="text-5xl font-black text-[#D4AF37]/10 mb-6 group-hover:text-[#D4AF37]/40 transition-colors italic">0{i + 4}</div>
                                <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter leading-none">{item.title}</h3>
                                <p className="text-sm text-white/30 font-bold leading-relaxed uppercase tracking-[0.1em]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* VIP Member Area (Dahsyat Hook) */}
            <section id="vip" className="relative z-10 px-6 py-32 bg-[#D4AF37] text-black rounded-t-[60px] md:rounded-t-[100px]">
                <div className="absolute top-10 right-10 opacity-10 pointer-events-none mb-10">
                    <BatikPattern />
                </div>
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
                    <div className="flex-1 space-y-10">
                        <div className="inline-block px-5 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full">
                            The VIP Experience
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black leading-[0.8] tracking-tightest">Benefit <span className="text-[#D4AF37] drop-shadow-sm italic">Sultan</span> VIP Member:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                'Akses lifetime ke seluruh tools premium',
                                'Update materi & tools di grup WA',
                                'Support langsung mentor via Grup WA',
                                'Rekaman ulang (replay) webinar selamanya',
                                'Tips & trik eksklusif komunitas VIP',
                                'Trial 3 Hari - Coba dulu gratis!'
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <span className="font-black text-[11px] uppercase tracking-wide">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-[450px] aspect-square bg-neutral-900 rounded-[80px] border-[20px] border-black flex flex-col items-center justify-center p-12 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent" />
                        <span className="relative z-10 text-[10px] font-black uppercase tracking-[1em] mb-4 opacity-50">Authorized Member</span>
                        <h4 className="relative z-10 font-black text-7xl italic tracking-tightest group-hover:scale-110 transition-transform">VIP</h4>
                        <div className="absolute bottom-10 left-0 right-0 text-center relative z-10">
                            <p className="font-bold text-[8px] uppercase tracking-[0.5em] opacity-30">Security Clearance Level 04</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Conversion Section */}
            <section id="bonus" className="relative z-10 px-6 py-40 border-t border-white/5 bg-[#0A0705]">
                <div className="max-w-4xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <p className="text-red-500 font-black text-[11px] uppercase tracking-[0.5em]">Exclusive Launch Bonus</p>
                        <h2 className="text-4xl md:text-8xl font-black tracking-tightest leading-none">BONUS <span className="text-[#D4AF37]">SPESIAL</span> PESERTA:</h2>
                    </div>

                    <div className="p-16 rounded-[60px] bg-white/3 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M2 12h20" /></svg>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mb-16">
                            <div className="space-y-4">
                                <h4 className="text-[#D4AF37] font-black text-2xl uppercase tracking-tighter">Support Konten NSFW</h4>
                                <p className="text-sm font-bold opacity-40 leading-relaxed uppercase tracking-wider">Mendukung pembuatan AI influencer untuk berbagai niche, termasuk konten khusus dewasa (18+).</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[#D4AF37] font-black text-2xl uppercase tracking-tighter">Aplikasi GRATIS</h4>
                                <p className="text-sm font-bold opacity-40 leading-relaxed uppercase tracking-wider">Aplikasi khusus yang dibagikan secara gratis untuk seluruh peserta webinar tanpa biaya tambahan.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Segera Daftar di Tautan Berikut:</p>
                            <a
                                href="https://lynk.id/romance/o2jmp6z4d7ov"
                                className="block text-xl md:text-4xl font-black text-[#D4AF37] underline underline-offset-8 hover:opacity-70 break-all"
                            >
                                lynk.id/romance/o2jmp6z4d7ov
                            </a>
                            <button
                                onClick={() => window.open('https://lynk.id/romance/o2jmp6z4d7ov', '_blank')}
                                className="w-full mt-10 py-7 rounded-[40px] bg-[#D4AF37] text-black font-black uppercase tracking-[0.5em] shadow-[0_20px_80px_rgba(212,175,55,0.3)] hover:scale-[1.03] transition-all"
                            >
                                AMANKAN SLOTMU SEKARANG
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-24 bg-black border-t border-white/5">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="p-10 rounded-[40px] bg-red-600/5 border border-red-600/20 mb-16 px-12">
                        <p className="text-[10px] md:text-xs leading-loose text-white/20 font-bold uppercase tracking-[0.2em]">
                            ⚠️ DISCLAIMER: KONTEN NSFW HANYA DITUJUKAN UNTUK PENGGUNA BERUSIA 18+ DAN WAJIB MEMATUHI KETENTUAN SERTA REGULASI PLATFORM YANG DIGUNAKAN. SEGALA BENTUK PENYALAHGUNAAN TEKNOLOGI ADALAH TANGGUNG JAWAB PENGGUNA MASING-MASING.
                        </p>
                    </div>
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">IndoAi Revolusi 2026 • Digital Heritage</p>
                </div>
            </footer>

            <style jsx>{`
                .tracking-tightest { letter-spacing: -0.06em; }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
