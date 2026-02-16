'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Laptop, PenTool, Brain, ArrowRight, Zap, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export default function LandingV1() {
    return (
        <div className="min-h-screen bg-[#020806] text-white selection:bg-teal-500/30 font-sans" style={{ fontFamily: '"Outfit", sans-serif' }}>
            <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');` }} />
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Navbar Placeholder */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 py-4 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-emerald-600 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
                        <span className="text-xl font-bold tracking-tighter">INDO<span className="text-teal-400">AI</span></span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium opacity-70">
                        <a href="#services" className="hover:text-teal-400 transition-colors">Services</a>
                        <a href="#why-us" className="hover:text-teal-400 transition-colors">Why Us</a>
                        <a href="#solutions" className="hover:text-teal-400 transition-colors">Solutions</a>
                    </div>
                    <button className="px-5 py-2 rounded-full border border-teal-500/30 text-teal-400 text-sm font-bold hover:bg-teal-500/10 transition-all">
                        Consultation
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest"
                    >
                        <Zap size={14} className="fill-current" />
                        Next-Gen Digital Creative Agency
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto"
                    >
                        Hentikan Cara Lama. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-emerald-400">
                            Masuki Era Kreativitas Terintegrasi AI.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto"
                    >
                        Kami adalah partner strategis Anda dalam membangun aplikasi, web, dan desain futuristik yang didukung AI untuk efisiensi maksimal.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <button className="group relative px-10 py-5 rounded-2xl bg-teal-500 text-[#020806] font-black text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(45,212,191,0.4)] overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Amankan Sesi Konsultasi <ArrowRight size={20} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-[25deg]" />
                        </button>
                        <p className="text-xs text-white/40 font-bold uppercase">Hanya 3 Slot Tersisa Minggu Ini</p>
                    </motion.div>
                </div>
            </header>

            {/* Services Grid */}
            <section id="services" className="py-24 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black tracking-tight">Solusi Digital Tanpa Kompromi</h2>
                        <p className="text-white/40 max-w-lg mx-auto italic">Up to 10x More Efficient through AI Orchestration</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Laptop className="text-teal-400" />, title: "Fullstack Web", desc: "Arsitektur modular dengan performa ultra-cepat & SEO optimized." },
                            { icon: <Rocket className="text-emerald-400" />, title: "App Development", desc: "Aplikasi mobile native & hybrid dengan UX modern yang fluid." },
                            { icon: <PenTool className="text-teal-200" />, title: "Premium Design", desc: "UI/UX & Branding visual yang menjatuhkan kompetitor seketika." },
                            { icon: <Brain className="text-white" />, title: "AI Integration", desc: "Otomasi alur kerja & data intelijen untuk produktivitas tak terbatas." }
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-teal-400/30 transition-all group flex flex-col justify-between h-[300px]">
                                <div className="space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:bg-teal-400/10 group-hover:text-teal-400 transition-all text-current">
                                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black">{item.title}</h3>
                                        <p className="text-sm text-white/50 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black tracking-widest text-teal-400/40 uppercase">Efficiency: +300%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Hook */}
            <section id="why-us" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto bg-gradient-to-b from-teal-500/10 to-transparent border border-teal-500/20 rounded-[40px] p-8 md:p-16 relative">
                    <div className="text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black">Bukan Sekadar Estetika, Kami Menciptakan Dampak.</h2>
                            <p className="text-white/50">Apa bedanya INDOAI dengan agency tradisional?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-6 p-6 rounded-3xl bg-red-500/5 border border-red-500/10 opacity-70">
                                <h4 className="text-red-400 font-bold flex items-center gap-2 italic underline text-xs tracking-widest">TRADITIONAL WAY (SLOW)</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-white/40"><ShieldCheck size={18} className="shrink-0" /> 7-14 Hari durasi pengerjaan awal.</li>
                                    <li className="flex items-start gap-3 text-sm text-white/40"><ShieldCheck size={18} className="shrink-0" /> Biaya operasional tinggi & revisi manual lambat.</li>
                                    <li className="flex items-start gap-3 text-sm text-white/40"><ShieldCheck size={18} className="shrink-0" /> Hasil yang stagnan tanpa dukungan intelijen data.</li>
                                </ul>
                            </div>
                            <div className="space-y-6 p-6 rounded-3xl bg-teal-500/10 border border-teal-500/30 relative overflow-hidden ring-1 ring-teal-400/50">
                                <div className="absolute top-0 right-0 px-3 py-1 bg-teal-500 text-[#020806] text-[8px] font-black uppercase tracking-tighter">RECOMMENDED</div>
                                <h4 className="text-teal-400 font-bold flex items-center gap-2 text-xs tracking-widest italic animate-pulse">THE INDOAI WAY (FAST & AI-POWERED)</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-white font-bold"><CheckCircle2 size={18} className="text-teal-400 shrink-0" /> 24-48 Jam pengiriman versi pertama.</li>
                                    <li className="flex items-start gap-3 text-sm text-white font-bold"><CheckCircle2 size={18} className="text-teal-400 shrink-0" /> Efisiensi biaya hingga 60% dengan sinkronisasi AI.</li>
                                    <li className="flex items-start gap-3 text-sm text-white font-bold"><CheckCircle2 size={18} className="text-teal-400 shrink-0" /> Optimalisasi performa berbasis data real-time.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Client Proof/Metrics Placeholder Area */}
            <section id="solutions" className="py-24 px-6">
                <div className="max-w-7xl mx-auto bg-white/[0.03] border border-white/5 rounded-[48px] overflow-hidden flex flex-col lg:flex-row shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <div className="flex-1 p-10 md:p-20 space-y-8">
                        <div className="space-y-4">
                            <span className="text-teal-400 font-bold text-xs uppercase tracking-widest">PRODUCTIVITY SOLUTIONS</span>
                            <h2 className="text-4xl md:text-6xl font-black">Digital Asset Yang Bekerja 24/7 Untuk Anda.</h2>
                        </div>
                        <p className="text-white/60 leading-relaxed max-w-xl">
                            Kami tidak hanya memberikan kode atau desain. Kami memberikan sistem otonom yang mempermudah operasional bisnis Anda melalui integrasi teknologi terbaik dunia.
                        </p>
                        <div className="flex gap-10">
                            <div>
                                <div className="text-4xl font-black text-white italic">10X</div>
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Workflow Speed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-white italic">65%</div>
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Cost Reduction</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[400px] relative group">
                        {/* Use Unsplash image as per user's request */}
                        <img
                            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                            alt="Cyber Solution INDOAI"
                            className="absolute inset-0 w-full h-full object-cover filter contrast-125 saturate-50 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020806] via-[#020806]/50 to-transparent lg:hidden" />
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020806] to-transparent hidden lg:block" />
                    </div>
                </div>
            </section>

            {/* Final Conversion Hook */}
            <footer className="py-24 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tighter">Sudah Siap Melipatgandakan <br /><span className="text-teal-400">Produktivitas Bisnis Anda?</span></h2>
                        <p className="text-white/40 font-bold uppercase text-xs tracking-[0.3em]">HANYA UNTUK KLIEN YANG BERANI BERINOVASI.</p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <button className="px-12 py-5 rounded-2xl bg-white text-[#020806] font-black text-2xl hover:bg-teal-400 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            START NOW
                        </button>
                        <p className="flex items-center gap-2 text-xs text-white/50"><Clock size={14} /> Sesi Gratis Hanya Sisa 3 Hari Lagi.</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between items-center opacity-30 text-[10px] font-bold tracking-widest gap-4">
                    <span>© 2026 INDOAI DIGITAL CREATIVE. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-8">
                        <a href="#">TWITTER</a>
                        <a href="#">INSTAGRAM</a>
                        <a href="#">LINKEDIN</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
