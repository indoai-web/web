import { motion } from 'framer-motion'
import { Ticket, Calendar, Clock, Users } from 'lucide-react'
import GlassCard from '../GlassCard'

const HeroSection = () => {
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

                        <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-extrabold mb-5 leading-[1.1] tracking-tighter animate-text-shine font-syne uppercase">
                            Revolusi <span className="font-serif italic capitalize text-aurora-gold">AI Influencer</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-base md:text-lg text-white/70 mb-10 max-w-3xl leading-relaxed font-plus">
                            Kuasai strategi membangun <span className="text-white font-bold font-serif italic text-aurora-gold">Aset Digital AI Influencer</span> yang bekerja <span className="text-white font-medium font-serif italic text-aurora-gold">24/7</span> untuk Anda. Bangun <span className="text-white">otoritas</span> dan buka peluang monetisasi tak terbatas.
                        </motion.p>

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
