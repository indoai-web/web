import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sparkles, ExternalLink, Instagram, Youtube, MessageCircle } from 'lucide-react'

const models = [
    {
        name: "Alya Putri",
        role: "Fashion & Lifestyle",
        followers: "125K",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
        video: "./video/putri_alya.mp4",
        platform: "Instagram",
        icon: <Instagram className="w-7 h-7 text-[#E4405F]" />
    },
    {
        name: "Raka Pratama",
        role: "Gaming & Tech",
        followers: "89K",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800",
        platform: "TikTok",
        icon: <MessageCircle className="w-7 h-7 text-[#00f2ea]" />
    },
    {
        name: "Siti Rahma",
        role: "Modest Fashion",
        followers: "210K",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=800",
        video: "./video/siti_rahma.mp4",
        platform: "Instagram",
        icon: <Instagram className="w-7 h-7 text-[#E4405F]" />
    },
    {
        name: "Bimo Kusuma",
        role: "Digital Nomad",
        followers: "54K",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
        platform: "Youtube",
        icon: <Youtube className="w-7 h-7 text-[#FF0000]" />
    },
    {
        name: "Nadine Olivia",
        role: "Beauty Enthusiast",
        followers: "172K",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
        video: "./video/nadine_olivia.mp4",
        platform: "Instagram",
        icon: <Instagram className="w-7 h-7 text-[#E4405F]" />
    }
]

const GalleryCard = ({ model, index }) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative group cursor-pointer w-[280px] md:w-[320px] flex-shrink-0"
        >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 border border-white/10 group-hover:border-aurora-gold/50 transition-colors duration-500 shadow-2xl">

                {model.video ? (
                    <video
                        src={model.video}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={model.image}
                    />
                ) : (
                    <img
                        src={model.image}
                        alt={model.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 pointer-events-none" />

                <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ transform: "translateZ(50px)" }}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-aurora-gold animate-pulse" />
                        <span className="text-[10px] font-bold text-aurora-gold uppercase tracking-[0.2em] font-space">{model.role}</span>
                    </div>

                    <h3 className="text-3xl font-black text-[#FFD700] font-syne italic tracking-tighter uppercase mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {model.name}
                    </h3>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                                {model.icon}
                            </span>
                            <span className="text-lg font-black italic bg-gradient-to-r from-[#d4fc79] to-[#96e6a1] bg-clip-text text-transparent font-plus drop-shadow-md">
                                {model.followers} Followers
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-aurora-gold group-hover:text-black transition-all duration-300">
                            <ExternalLink className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            <div className="absolute -inset-4 bg-aurora-gold/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        </motion.div>
    )
}

const GallerySection = () => {
    const [isPaused, setIsPaused] = useState(false)
    const doubledModels = [...models, ...models]

    return (
        <section id="gallery" className="py-24 relative overflow-hidden bg-black/20">
            <div className="max-w-[1600px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 px-6"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-aurora-gold animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] font-space mt-1 bg-gradient-to-r from-[#d4fc79] to-[#96e6a1] bg-clip-text text-transparent">Proof of Authority</span>
                    </div>

                    <h2 className="text-5xl md:text-8xl font-bold mb-6 tracking-tighter leading-[1.1]">
                        <span className="font-syne glow-gold block md:inline mb-2 md:mb-0 md:mr-6 uppercase">AI Influencer</span>
                        <span className="premium-serif-gold block md:inline">Showcase</span>
                    </h2>

                    <p className="max-w-xl mx-auto text-white/40 text-sm md:text-lg font-plus leading-relaxed">
                        Inilah kualitas aset digital yang akan kamu miliki. 100% buatan AI, tanpa perlu talent manusia, bekerja 24/7.
                    </p>
                </motion.div>

                <div className="relative flex overflow-hidden group marquee-wrapper">
                    <div
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className={`flex gap-8 px-4 animate-marquee-slow ${isPaused ? '[animation-play-state:paused]' : ''}`}
                        style={{ width: "max-content" }}
                    >
                        {doubledModels.map((model, index) => (
                            <GalleryCard key={index} model={model} index={index % 5} />
                        ))}
                    </div>

                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0c0c0c] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0c0c0c] to-transparent z-10 pointer-events-none" />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center px-6"
                >
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] font-space italic">
                        *Klik pada kartu untuk melihat profil aset • Scroll berhenti otomatis saat disentuh
                    </p>
                </motion.div>
            </div>

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aurora-gold/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-aurora-emerald/5 blur-[120px] rounded-full -z-10" />
        </section>
    )
}

export default GallerySection
