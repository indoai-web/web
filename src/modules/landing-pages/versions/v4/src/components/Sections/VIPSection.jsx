import { motion } from 'framer-motion'
import GlassCard from '../GlassCard'
import { Check, Crown } from 'lucide-react'

const VIPSection = () => {
    const benefits = [
        "Akses lifetime ke seluruh tools premium",
        "Update materi & tools terbaru di grup WA",
        "Support langsung dari mentor via grup WA",
        "Rekaman ulang (replay) webinar selamanya",
        "Tips & trik eksklusif komunitas VIP",
        "Networking eksklusif member VIP"
    ]

    return (
        <section id="vip" className="py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Content: Typography & Benefits */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 text-white/60">
                                THE VIP EXPERIENCE
                            </span>

                            <h2 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter font-syne uppercase">
                                Benefit <span className="font-serif italic capitalize text-aurora-gold">VIP Member:</span>
                            </h2>

                            <div className="space-y-4">
                                {[
                                    "Akses lifetime ke seluruh tools premium",
                                    "Update materi & tools terbaru di grup WA",
                                    "Support langsung dari mentor via grup WA",
                                    "Rekaman ulang (replay) webinar selamanya",
                                    "Tips & trik eksklusif komunitas VIP",
                                    "Networking eksklusif member VIP"
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-4 group">
                                        <div className="w-6 h-6 rounded-full bg-aurora-gold/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                            <Check className="w-3.5 h-3.5 text-aurora-gold" />
                                        </div>
                                        <span className="text-lg text-white/80 group-hover:text-white transition-colors font-plus">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content: VIP Card Visual */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            {/* Rotating Border Effect */}
                            <div className="absolute -inset-[2px] rounded-[42px] overflow-hidden pointer-events-none">
                                <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,var(--color-aurora-gold)_180deg,transparent_240deg,transparent_360deg)] opacity-40 group-hover:opacity-80 transition-opacity" />
                            </div>

                            <div className="relative p-1 rounded-[40px] bg-aurora-dark border border-aurora-gold/30 overflow-hidden shadow-2xl shadow-black/50">
                                <GlassCard className="aspect-[4/3] w-full flex flex-col items-center justify-center p-12 bg-black/60 backdrop-blur-3xl border-none relative overflow-hidden" animateSweep={true}>
                                    {/* Inner Glowing Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-gold/10 blur-3xl rounded-full" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-aurora-emerald/10 blur-3xl rounded-full" />

                                    <span className="text-[10px] tracking-[0.6em] text-white/40 uppercase mb-8 font-space font-bold">Authorized Member</span>

                                    <div className="relative mb-2">
                                        <h3 className="text-8xl font-black text-white font-syne italic tracking-tighter leading-none">VIP</h3>
                                    </div>

                                    <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-aurora-gold/40 to-transparent mb-8" />

                                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-pulse" />
                                        <div className="text-[9px] tracking-[0.4em] text-white/40 uppercase font-space font-black">Security Level 04</div>
                                    </div>

                                    {/* Subtle Overlay Pattern */}
                                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                                </GlassCard>
                            </div>

                            {/* Outer Glow */}
                            <div className="absolute -inset-10 bg-aurora-gold/10 blur-[100px] opacity-60 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default VIPSection
