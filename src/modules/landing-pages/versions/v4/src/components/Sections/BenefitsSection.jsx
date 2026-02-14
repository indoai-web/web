import { motion } from 'framer-motion'
import GlassCard from '../GlassCard'
import { Bot, Sparkles, Rocket, Wrench, MessageCircle, Gift, Package } from 'lucide-react'

const BenefitsSection = () => {
    const benefits = [
        { text: "Cara bikin AI influencer dari nol sampai siap launch", icon: Bot, color: "text-aurora-gold", bg: "bg-aurora-gold/10", border: "border-aurora-gold/30" },
        { text: "Framework konten (pillar, hook, storytelling)", icon: Sparkles, color: "text-aurora-accent", bg: "bg-aurora-accent/10", border: "border-aurora-accent/30" },
        { text: "Panduan praktek sampai posting pertama", icon: Rocket, color: "text-aurora-gold", bg: "bg-aurora-gold/10", border: "border-aurora-gold/30" },
        { text: "List tools lengkap (Gratis Lifetime Tool VIP Member)", icon: Wrench, color: "text-aurora-emerald", bg: "bg-aurora-emerald/10", border: "border-aurora-emerald/30" },
        { text: "Akses Grup WhatsApp VIP Member", icon: MessageCircle, color: "text-aurora-accent", bg: "bg-aurora-accent/10", border: "border-aurora-accent/30" }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <section id="benefits" className="py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-3xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                            <span className="font-syne glow-gold block md:inline mb-2 md:mb-0 md:mr-6 uppercase">Yang Kamu</span>
                            <span className="premium-serif-gold block md:inline">Dapatkan</span>
                        </h2>
                    </div>
                    <div className="h-1 w-24 bg-aurora-gold mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    {/* Left: Original Benefits List */}
                    <div className="md:col-span-7">
                        <GlassCard className="p-8 md:p-10">
                            <motion.ul
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                {benefits.map((benefit, index) => (
                                    <motion.li
                                        key={index}
                                        variants={itemVariants}
                                        className="flex items-start gap-5 group"
                                    >
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${benefit.bg} border ${benefit.border} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/20`}>
                                            <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                                        </div>
                                        <p className="text-lg text-white/80 group-hover:text-white transition-colors pt-2">
                                            {benefit.text}
                                        </p>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </GlassCard>
                    </div>

                    {/* Right: NEW Redesigned Bundle Card (The only part that should be "bagus") */}
                    <div className="md:col-span-5 flex justify-center md:justify-end">
                        <div className="relative w-full max-w-sm group">
                            {/* Rotating Border Effect */}
                            <div className="absolute -inset-[2px] rounded-[32px] overflow-hidden pointer-events-none">
                                <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,var(--color-aurora-gold)_180deg,transparent_240deg,transparent_360deg)] opacity-40" />
                            </div>

                            <div className="relative p-1 rounded-[30px] bg-aurora-dark border border-aurora-gold/30 overflow-hidden">
                                <GlassCard className="p-10 flex flex-col items-center text-center bg-black/40 backdrop-blur-3xl border-none" animateSweep={true}>
                                    <div className="w-24 h-24 mb-6 relative mx-auto">
                                        <div className="absolute inset-0 bg-aurora-gold/20 blur-2xl rounded-full" />
                                        <div className="relative w-full h-full rounded-3xl bg-aurora-gold/10 border border-aurora-gold/20 flex items-center justify-center animate-float shadow-2xl">
                                            <Package className="w-12 h-12 text-aurora-gold" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-extrabold mb-3 font-syne uppercase tracking-tighter italic">
                                        Bundle <span className="font-serif italic capitalize text-aurora-gold">Lengkap</span>
                                    </h3>

                                    <p className="text-white/50 text-base leading-relaxed font-plus">
                                        Semua yang kamu butuhkan untuk memulai karir AI Influencer.
                                    </p>

                                    <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/20 text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase font-space">
                                        Highly Recommended
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Backglow */}
                            <div className="absolute -inset-10 bg-aurora-gold/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BenefitsSection
