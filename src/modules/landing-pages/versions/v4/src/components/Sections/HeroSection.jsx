import React from 'react'
import { motion } from 'framer-motion'
import { Ticket, Calendar, Clock, Users, Trophy, Gift } from 'lucide-react'
import GlassCard from '../GlassCard'

const HeroSection = () => {
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        let start = 0
        const end = 500
        const duration = 2000
        const increment = end / (duration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setCount(end)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <section className="min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
                {/* Floating elements for visual interest */}
                <div className="absolute -top-32 -left-20 w-72 h-72 bg-aurora-gold/20 blur-[100px] rounded-full animate-float" />
                <div className="absolute top-1/2 -right-20 w-80 h-80 bg-aurora-emerald/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />

                <div className="flex flex-col items-center text-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-col items-center w-full"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="px-6 py-2 rounded-full bg-aurora-emerald/30 border border-aurora-gold/20 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-8 text-aurora-gold flex items-center gap-3 backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-gold"></span>
                            </span>
                            🚀 MASA DEPAN ASET DIGITAL
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl md:text-9xl font-black mb-6 leading-[0.85] tracking-tighter uppercase relative">
                            <span className="font-bebas text-yellow-400 block mb-2 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]">Revolusi</span>
                            <span className="font-serif italic capitalize premium-gold-shimmer text-4xl md:text-7xl block pb-2">AI Influencer</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg md:text-2xl text-white/90 mb-10 max-w-4xl leading-[1.4] font-newspaper text-center">
                            Kuasai strategi membangun <span className="text-yellow-400 text-xl md:text-3xl italic block md:inline mb-2 md:mb-0">"Aset Digital AI Influencer"</span> yang bekerja <span className="text-yellow-400">24/7</span> untuk Anda. Bangun <span className="power-authority">otoritas</span> dan buka peluang monetisasi tak terbatas.
                        </motion.p>

                        {/* Revolusi Trust Ticker - Final Premium Version */}
                        <motion.div
                            variants={itemVariants}
                            className="w-full max-w-[1600px] mx-auto trust-ticker-container px-12 md:px-32 py-6 mb-12 flex flex-row flex-nowrap justify-center items-center gap-6 md:gap-10 overflow-hidden"
                        >
                            <div className="flex flex-col text-center shrink-0">
                                <span className="font-bebas-bold text-2xl md:text-5xl text-gold-premium leading-none">{count}+</span>
                                <span className="text-[9px] font-bold text-subtitle-gold uppercase tracking-[0.2em] font-space mt-1">Member Aktif</span>
                            </div>

                            <div className="w-px h-8 bg-white/5 shrink-0" />

                            <div className="flex flex-col text-center shrink-0">
                                <span className="font-bebas-bold text-2xl md:text-5xl green-gold-border leading-none">TERBUKTI</span>
                                <span className="text-[9px] font-bold text-subtitle-gold uppercase tracking-[0.2em] font-space mt-1">Menghasilkan</span>
                            </div>

                            <div className="w-px h-8 bg-white/5 shrink-0" />

                            <div className="flex flex-col text-left shrink-0">
                                <div className="flex items-center">
                                    <span className="font-bebas-bold text-2xl md:text-5xl text-red-600 leading-none">Ai Influencer</span>
                                    <span className="premium-badge">Lifetime</span>
                                </div>
                                <span className="text-[9px] font-bold text-subtitle-gold uppercase tracking-[0.2em] font-space mt-1 text-center md:text-left">TOOL PREMIUM</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full mb-12 py-8 border-y border-white/5">
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-aurora-gold group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-aurora-gold/20">
                                    <Calendar className="w-5 h-5 text-aurora-gold group-hover:text-black transition-colors" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-0.5 font-space">Jadwal</span>
                                    <span className="block text-xl font-black tracking-tighter font-syne italic uppercase">14 Feb 2026</span>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-white/10" />
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-aurora-accent group-hover:text-black transition-all duration-500 shadow-xl group-hover:shadow-aurora-accent/20">
                                    <Clock className="w-5 h-5 text-aurora-accent group-hover:text-black transition-colors" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-0.5 font-space">Waktu</span>
                                    <span className="block text-xl font-black tracking-tighter font-syne italic uppercase">19.00 WIB</span>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-white/10" />
                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
                                    <Users className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-0.5 font-space">Sisa Slot</span>
                                    <span className="block text-xl font-black tracking-tighter font-syne italic uppercase text-red-500 animate-pulse">Sisa 07 Slot</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="w-full max-w-md">
                            <div className="hyper-button-container group active:scale-95 transition-transform duration-200">
                                {/* Spinning Border Background */}
                                <div className="hyper-button-border opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                                <button
                                    onClick={() => document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' })}
                                    className="hyper-button-content relative px-10 py-6 text-white overflow-hidden transition-all duration-300 w-full"
                                >
                                    {/* Soft Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-aurora-gold/5 to-aurora-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex items-center justify-center w-full gap-6">
                                        <span className="text-xl md:text-2xl font-black tracking-tight text-aurora-gold group-hover:text-white transition-all duration-500 uppercase font-syne">
                                            Liat Benefit
                                        </span>

                                        <div className="w-12 h-12 rounded-full bg-aurora-gold/10 border border-aurora-gold/20 flex items-center justify-center group-hover:bg-aurora-gold group-hover:border-transparent transition-all duration-500 shadow-lg">
                                            <Ticket className="w-6 h-6 text-aurora-gold group-hover:text-aurora-emerald transition-colors" />
                                        </div>
                                    </div>
                                </button>

                                {/* Backglow for the whole button */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-aurora-gold/20 to-aurora-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
