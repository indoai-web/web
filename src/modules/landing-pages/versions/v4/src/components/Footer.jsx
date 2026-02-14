import { AlertTriangle } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="py-20 px-6 border-t border-white/5 relative overflow-hidden bg-aurora-dark">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="relative group">
                    {/* Decorative Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-aurora-gold/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden">
                        {/* Gold Accent Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-aurora-gold/50 to-transparent" />

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 p-3 rounded-2xl bg-aurora-gold/10 border border-aurora-gold/20">
                                <AlertTriangle className="w-6 h-6 text-aurora-gold" />
                            </div>

                            <h4 className="text-aurora-gold font-serif italic text-xl mb-4 tracking-wider uppercase">
                                PERINGATAN & DISCLAIMER
                            </h4>

                            <p className="text-[11px] md:text-xs text-white/60 leading-relaxed font-plus uppercase tracking-[0.15em] max-w-2xl mx-auto leading-loose">
                                KONTEN NSFW HANYA DITUJUKAN UNTUK PENGGUNA BERUSIA <span className="text-white font-bold">18+</span> DAN WAJIB MEMATUHI KETENTUAN SERTA REGULASI PLATFORM YANG DIGUNAKAN. <br className="hidden md:block" />
                                <span className="text-white/40">SEGALA BENTUK PENYALAHGUNAAN TEKNOLOGI ADALAH TANGGUNG JAWAB PENGGUNA MASING-MASING</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
