import { motion } from 'framer-motion'
import GlassCard from '../GlassCard'
import { AlertTriangle, Zap, Target, Smartphone, Hourglass, MessageCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const BonusSection = () => {
    const WhatsAppIcon = ({ className }) => (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    )

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
                        <h2 className="text-3xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                            <span className="font-syne glow-gold block md:inline mb-2 md:mb-0 md:mr-6 uppercase">Exclusive</span>
                            <span className="premium-serif-gold block md:inline">Bonus:</span>
                        </h2>
                    </div>
                    <p className="text-white/60 text-lg">Hanya untuk pendaftar minggu ini</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Support Konten NSFW",
                            icon: AlertTriangle,
                            desc: "Kami mendukung pembuatan AI influencer untuk berbagai niche termasuk NSFW (18+)",
                            type: 'danger',
                            tag: "18+ EXTREME"
                        },
                        {
                            title: "Aplikasi GRATIS",
                            icon: Smartphone,
                            desc: "Dibagikan untuk seluruh peserta webinar tanpa biaya tambahan",
                            type: 'sultan'
                        },
                        {
                            title: "Join WA",
                            icon: WhatsAppIcon,
                            desc: "Siap untuk masuk komunitas, Kami Tunggu,.....",
                            type: 'wa'
                        }
                    ].map((bonus, idx) => (
                        <a
                            key={idx}
                            href="https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full group/link"
                        >
                            <GlassCard
                                className={cn(
                                    "p-8 group transition-all duration-500 text-center relative overflow-hidden h-full cursor-pointer",
                                    bonus.type === 'danger' ? "danger-zone-card hazard-stripes" :
                                        bonus.type === 'wa' ? "wa-glass-card" : "sultan-glass-card"
                                )}
                                delay={0.1 * idx}
                            >
                                {bonus.tag && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="danger-badge">{bonus.tag}</span>
                                    </div>
                                )}

                                <div className={cn(
                                    "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
                                    bonus.type === 'danger'
                                        ? "bg-red-500/20 border border-red-500/50 group-hover:bg-red-500 group-hover:shadow-red-500/40" :
                                        bonus.type === 'wa'
                                            ? "bg-green-500/20 border border-green-500/50 group-hover:bg-[#25D366] group-hover:shadow-[#25D366]/40"
                                            : "bg-[#d4af37]/20 border border-[#d4af37]/50 group-hover:bg-[#ffd700] group-hover:shadow-[#ffd700]/40"
                                )}>
                                    <bonus.icon className={cn(
                                        "w-10 h-10 transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110",
                                        bonus.type === 'danger' ? "text-red-500 group-hover:text-white" :
                                            bonus.type === 'wa' ? "text-[#25D366] group-hover:text-white" :
                                                "text-[#d4af37] group-hover:text-black"
                                    )} />
                                </div>

                                <h3 className={cn(
                                    "text-2xl font-black mb-4 font-syne uppercase tracking-tighter italic transition-all duration-300",
                                    bonus.type === 'danger' ? "neon-red-text" :
                                        bonus.type === 'wa' ? "wa-text-glow" :
                                            "gold-foil-text text-3xl"
                                )}>
                                    {bonus.title}
                                </h3>

                                <p className="text-white/60 leading-relaxed font-plus text-sm group-hover:text-white transition-colors">
                                    {bonus.desc}
                                </p>
                            </GlassCard>
                        </a>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default BonusSection
