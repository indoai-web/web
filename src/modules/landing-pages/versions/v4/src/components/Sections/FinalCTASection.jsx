import { motion } from 'framer-motion'
import GlassCard from '../GlassCard'
import CountdownTimer from '../CountdownTimer'
import { Ticket } from 'lucide-react'

const FinalCTASection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <GlassCard className="p-8 md:p-12 text-center bg-black/40 border-aurora-gold/30 rounded-3xl relative overflow-hidden backdrop-blur-3xl cta-premium-card" animateSweep={true}>
                    {/* Inner Glow Elements */}
                    <div className="absolute top-0 left-1/4 w-48 h-48 bg-aurora-emerald/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-aurora-gold/10 blur-[80px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <div className="flex flex-col items-center mb-6">
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-emerald/30 border border-aurora-gold/20 text-[9px] font-bold tracking-[0.4em] uppercase mb-6 text-aurora-gold/60"
                            >
                                <Ticket className="w-3.5 h-3.5 text-aurora-gold fill-aurora-gold/20" />
                                KUOTA TERBATAS!
                            </motion.div>

                            <h2 className="text-4xl md:text-7xl font-bold text-white leading-[1] font-syne uppercase tracking-tighter mb-4">
                                <span className="red-gold-text animate-float-slow py-2 px-1 inline-block">Amankan</span> <br />
                                <span className="font-serif italic capitalize flex items-baseline gap-2 justify-center">
                                    <span className="relative inline-block group pt-2 pb-1">
                                        {/* Super Intense Background Glow */}
                                        <div className="absolute inset-0 bg-yellow-400 blur-2xl rounded-full scale-150 animate-pulse opacity-60 pointer-events-none" />
                                        <div className="absolute inset-0 bg-aurora-gold blur-3xl rounded-full scale-200 opacity-40 pointer-events-none" />
                                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-110 pointer-events-none" />

                                        <span className="relative animate-text-shine inline-block z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)] pr-3">Slot</span>
                                        <div className="absolute -bottom-1 left-0 w-full h-[4px] bg-gradient-to-r from-aurora-gold/0 via-aurora-gold to-aurora-gold/0 z-10 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                    </span>
                                    <span className="vibrant-yellow-text"> mu Sekarang</span>
                                </span>
                            </h2>
                            <div className="h-0.5 w-12 bg-gradient-to-r from-aurora-emerald to-aurora-gold rounded-full mt-2 opacity-30" />
                        </div>

                        <div className="mb-8 scale-90">
                            <CountdownTimer />
                        </div>

                        <div className="flex justify-center w-full mb-6">
                            <div className="hyper-button-container group active:scale-95 transition-transform duration-200">
                                <div className="hyper-button-border opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                                <a
                                    href="https://lynk.id/romance/o2jmp6z4d7ov"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hyper-button-content relative px-10 py-6 text-white overflow-hidden transition-all duration-300 min-w-[280px]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-aurora-emerald/5 to-aurora-gold/5 opacity-50 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex items-center justify-center w-full gap-6">
                                        <span className="text-xl md:text-2xl font-black tracking-tight text-aurora-gold group-hover:text-white transition-all duration-500 uppercase font-syne">
                                            Daftar Sekarang
                                        </span>

                                        <div className="w-12 h-12 rounded-full bg-aurora-gold/10 border border-aurora-gold/20 flex items-center justify-center group-hover:bg-aurora-gold group-hover:border-transparent transition-all duration-500 shadow-lg">
                                            <Ticket className="w-6 h-6 text-aurora-gold group-hover:text-aurora-emerald transition-colors" />
                                        </div>
                                    </div>
                                </a>

                                <div className="absolute -inset-6 bg-gradient-to-r from-aurora-emerald/20 to-aurora-gold/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                            </div>
                        </div>

                        <p className="text-white/20 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-space font-medium">
                            Akses VIP Langsung Terkirim ke WhatsApp
                        </p>
                    </motion.div>
                </GlassCard>
            </div>
        </section>
    )
}

export default FinalCTASection
