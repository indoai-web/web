import { motion } from 'framer-motion'
import GlassCard from '../GlassCard'
import { AlertTriangle, Zap, Target, Smartphone, Hourglass } from 'lucide-react'

const BonusSection = () => {
    const bonuses = [
        {
            title: "Support Konten NSFW",
            icon: Zap,
            desc: "Kami mendukung pembuatan AI influencer untuk berbagai niche termasuk NSFW (18+)"
        },
        {
            title: "Aplikasi GRATIS",
            icon: Smartphone,
            desc: "Dibagikan untuk seluruh peserta webinar"
        },
        {
            title: "Trial 3 Hari",
            icon: Hourglass,
            desc: "Coba gratis sebelum memutuskan"
        }
    ]

    return (
        <section id="bonus" className="py-24 relative">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Target className="w-8 h-8 md:w-12 md:h-12 text-aurora-gold animate-float" />
                        <motion.h2
                            className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter font-syne uppercase"
                            animate={{
                                textShadow: ["0 0 10px rgba(255,255,255,0.2)", "0 0 20px rgba(212,175,55,0.5)", "0 0 10px rgba(255,255,255,0.2)"]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            Exclusive <span className="font-serif italic capitalize text-aurora-gold">Bonus:</span>
                        </motion.h2>
                    </div>
                    <p className="text-white/60 text-lg">Hanya untuk pendaftar minggu ini</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Support Konten NSFW", icon: Zap, desc: "Kami mendukung pembuatan AI influencer untuk berbagai niche termasuk NSFW (18+)" },
                        { title: "Aplikasi GRATIS", icon: Smartphone, desc: "Dibagikan untuk seluruh peserta webinar" },
                        { title: "Trial 3 Hari", icon: Hourglass, desc: "Coba gratis sebelum memutuskan" }
                    ].map((bonus, idx) => (
                        <GlassCard key={idx} className="p-8 group hover:bg-aurora-emerald/20 transition-all duration-500 border-white/5 text-center" delay={0.1 * idx}>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-aurora-gold/10 border border-aurora-gold/30 flex items-center justify-center group-hover:bg-aurora-gold transition-all duration-500 shadow-lg shadow-aurora-gold/10">
                                <bonus.icon className="w-8 h-8 text-aurora-gold group-hover:text-aurora-emerald group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white font-syne uppercase tracking-tight italic group-hover:text-aurora-gold transition-colors">{bonus.title}</h3>
                            <p className="text-white/50 leading-relaxed font-plus text-sm">{bonus.desc}</p>
                        </GlassCard>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default BonusSection
