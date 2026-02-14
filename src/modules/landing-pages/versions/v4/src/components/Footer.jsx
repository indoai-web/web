import { AlertTriangle } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="py-20 px-6 border-t border-white/5 relative overflow-hidden bg-aurora-dark">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="relative group">
                    {/* Decorative Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-red-600/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden disclaimer-card">
                        {/* Red Accent Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.5)]" />

                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 p-4 rounded-2xl bg-aurora-gold/10 border border-aurora-gold/20 transition-all duration-500 disclaimer-icon-bg">
                                <AlertTriangle className="w-8 h-8 text-aurora-gold transition-colors duration-500 disclaimer-icon" />
                            </div>

                            <h4 className="text-aurora-gold font-serif italic text-2xl mb-6 tracking-wider uppercase transition-colors duration-500 disclaimer-title">
                                PERINGATAN & DISCLAIMER
                            </h4>

                            <p className="text-[11px] md:text-sm text-white/50 leading-relaxed font-plus uppercase tracking-[0.2em] max-w-3xl mx-auto leading-loose">
                                KONTEN NSFW HANYA DITUJUKAN UNTUK PENGGUNA BERUSIA <span className="text-red-500 font-black text-base drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">18+</span> DAN WAJIB MEMATUHI KETENTUAN SERTA REGULASI PLATFORM YANG DIGUNAKAN. <br className="hidden md:block" />
                                <span className="text-white/30 font-medium">SEGALA BENTUK PENYALAHGUNAAN TEKNOLOGI ADALAH TANGGUNG JAWAB PENGGUNA MASING-MASING</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
