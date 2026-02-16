import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import GlassCard from '../GlassCard'
import { Check, Crown, MessageCircle } from 'lucide-react'

const VIPSection = () => {
    const WhatsAppIcon = () => (
        <a
            href="https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block cursor-pointer hover:scale-110 transition-transform active:scale-95"
        >
            <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-[#4ade80] drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
        </a>
    )

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { stiffness: 150, damping: 20 }
    const mouseXSpring = useSpring(mouseX, springConfig)
    const mouseYSpring = useSpring(mouseY, springConfig)

    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mouseXSpring}px ${mouseYSpring}px, rgba(212, 175, 55, 0.15), transparent 80%)`

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    const benefits = [
        "Akses lifetime ke seluruh tools PRO",
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
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 text-white/60 glint-effect">
                                THE VIP EXPERIENCE
                            </span>

                            <h2 className="text-3xl md:text-7xl font-bold mb-6 tracking-tighter leading-[1.1]">
                                <span className="font-syne glow-gold block md:inline mb-2 md:mb-0 md:mr-6 uppercase">Benefit</span>
                                <span className="premium-serif-gold block md:inline">VIP</span>
                            </h2>

                            <div className="space-y-6">
                                {[
                                    { title: "Lifetime Access", desc: "Akses Lifetime ke tool PRO / Gak Lagi bayar bulanan", highlight: true },
                                    { title: "Update Real-time", desc: "update Materi dan Tool terbaru di WA Groub", highlight: false, link: "https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV" },
                                    { title: "Direct Support", desc: "Konsultasi Langsung dengan Mentor di WA Groub", highlight: false, link: "https://chat.whatsapp.com/F8kBfqGyMPbJ1LZeBcP4vV" },
                                    { title: "Replay Webinar", desc: "Nonton ulang video rekaman webinar kapan saja", highlight: false },
                                    { title: "Strategi Eksklusif", desc: "Bongkar rahasia cuan dari AI Influencer", highlight: true },
                                    { title: "Networking Elite", desc: "Gabung komunitas eksklusif pemilik AI Influencer", highlight: false }
                                ].map((benefit, index) => {
                                    const content = (
                                        <div className="flex items-center gap-5 group cursor-pointer w-full">
                                            <div className="w-10 h-10 rounded-2xl premium-check-container flex items-center justify-center flex-shrink-0">
                                                <Check className="w-5 h-5 text-aurora-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                                            </div>
                                            <div className="benefit-text-premium flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black italic tracking-tight text-gold-yellow-gradient pr-2">
                                                        {benefit.title}
                                                    </span>
                                                    {benefit.link && <WhatsAppIcon />}
                                                </div>
                                                <span className="text-sm text-white/50 font-plus">
                                                    {benefit.desc}
                                                </span>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            {benefit.link ? (
                                                <a
                                                    href={benefit.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full"
                                                >
                                                    {content}
                                                </a>
                                            ) : (
                                                content
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Content: VIP Card Visual (Elite Vertical) */}
                    <div className="lg:col-span-5 hidden lg:flex flex-col h-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            onMouseMove={handleMouseMove}
                            className="relative group h-full flex flex-col"
                        >
                            {/* Combo Sultan: Shimmering Gold Border */}
                            <div className="shimmering-border-glow" />

                            <div className="relative p-1 rounded-[40px] bg-aurora-dark border border-aurora-gold/20 overflow-hidden shadow-2xl shadow-black/90 h-full flex flex-col">
                                <div className="flex-1 w-full flex flex-col justify-between py-10 px-8 carbon-texture rounded-[39px] relative overflow-hidden h-full">
                                    {/* Spotlight Follower Overlay */}
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none z-10"
                                        style={{ background: spotlight }}
                                    />

                                    {/* Header: Chip & Labels */}
                                    <div className="w-full relative z-20 flex justify-between items-start">
                                        <div className="emv-chip scale-75 origin-top-left" />
                                        <div className="text-right">
                                            <span className="text-[7px] tracking-[0.4em] text-white/30 uppercase font-space font-bold block mb-1">Elite Identifier</span>
                                            <div className="credit-card-font text-[14px] leading-none mt-1">
                                                001 3379 2026 ELITE
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body: VIP Branding */}
                                    <div className="w-full relative z-20 flex flex-col items-center flex-1 justify-center py-2">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <h3 className="gold-foil-text text-[8rem] leading-[0.85] font-black font-syne italic tracking-tighter select-none pr-12">
                                                    VIP
                                                </h3>
                                            </div>
                                            <div className="gold-foil-text font-newspaper italic text-[2.2rem] leading-none tracking-tight">
                                                AI Influencer
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Details & Access */}
                                    <div className="w-full relative z-20">
                                        <div className="grid grid-cols-2 gap-2 mb-6 border-t border-white/10 pt-6">
                                            <div>
                                                <div className="text-[6px] tracking-[0.3em] text-white/30 uppercase font-space mb-0.5">Clearance Level</div>
                                                <div className="text-[9px] text-aurora-gold font-black tracking-widest font-space truncate">AI INFLUENCER</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[6px] tracking-[0.3em] text-white/30 uppercase font-space mb-0.5">Validity</div>
                                                <div className="text-[9px] text-white/80 font-black tracking-widest font-space truncate">LIFETIME</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/60 border border-white/5 backdrop-blur-md w-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse flex-shrink-0" />
                                            <div className="text-[8px] tracking-[0.3em] text-white/90 uppercase font-space font-black whitespace-nowrap">System Access Granted</div>
                                        </div>
                                    </div>

                                    {/* Aesthetic Foil Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-gold/5 blur-[50px] rounded-full pointer-events-none" />
                                    <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-aurora-emerald/5 blur-[50px] rounded-full pointer-events-none" />
                                </div>
                            </div>

                            {/* Outer Glow */}
                            <div className="absolute -inset-10 bg-aurora-gold/5 blur-[100px] opacity-60 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default VIPSection
