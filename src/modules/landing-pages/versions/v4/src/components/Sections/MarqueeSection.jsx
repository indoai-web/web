import { XCircle } from 'lucide-react'

const MarqueeSection = () => {
    const warningText = "WARNING: KONTEN NSFW HANYA UNTUK PENGGUNA"

    return (
        <div className="bg-yellow-400 py-6 relative overflow-hidden border-y-2 border-red-600 shadow-[0_0_30px_rgba(251,191,36,0.4)] z-20 font-space uppercase">
            <div className="flex whitespace-nowrap animate-marquee items-center">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center">
                        <XCircle className="w-8 h-8 text-red-600 mx-6 fill-red-600/10" />
                        <span className="text-black font-black text-base md:text-2xl tracking-[0.1em] font-syne flex items-center gap-4">
                            {warningText}
                            <span className="text-4xl md:text-6xl inline-block transform scale-110">🔞</span>
                            <span>— SEGALA BENTUK PENYALAHGUNAAN TEKNOLOGI ADALAH TANGGUNG JAWAB PENGGUNA MASING-MASING</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MarqueeSection
