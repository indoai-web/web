import { TriangleAlert } from 'lucide-react'

const MarqueeSection = () => {
    const warningText = "WARNING: KONTEN NSFW HANYA UNTUK PENGGUNA"

    return (
        <div className="industrial-hazard-tape font-space uppercase">
            <div className="industrial-hazard-inner py-2">
                <div className="flex whitespace-nowrap animate-marquee items-center">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <TriangleAlert className="w-10 h-10 text-black mx-10 fill-black/20" />
                            <span className="text-black font-black text-xl md:text-3xl tracking-[-0.05em] font-syne flex items-center gap-6">
                                {warningText}
                                <span className="text-5xl md:text-7xl leading-none transform -rotate-12">🔞</span>
                                <span className="opacity-40 font-black">— CAUTION —</span>
                                <span>SEGALA BENTUK PENYALAHGUNAAN ADALAH TANGGUNG JAWAB PENGGUNA</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MarqueeSection
