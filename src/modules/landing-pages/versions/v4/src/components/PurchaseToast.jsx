import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const idNames = [
    "Agus Setiawan", "Siti Rahmawati", "Budi Santoso", "Dewi Lestari",
    "Rian Hidayat", "Ani Wijaya", "Fajar Pratama", "Larasati Putri", "Eko Prasetyo",
    "Maya Indah", "Hendra Kusuma", "Siska Amelia", "Dedi Kurniawan", "Ratna Sari",
    "Iwan Setiadi", "Indah Permata", "Aditya Nugroho", "Fitriani", "Andi Pratama",
    "Bambang Heru", "Siti Aminah", "Yulia Wahyuni", "Ahmad Fauzi", "Rina Kartika",
    "Taufik Hidayat", "Linda Sari", "Rizky Ramadhan", "Anita Permata", "Denny Irawan",
    "Herman Susanto", "Ratih Purwasih", "Agung Prayogo", "Doni Kusuma", "Ria Fitri"
]

const platforms = [
    {
        name: 'Facebook',
        id: 'facebook',
        color: '#1877F2',
        logo: `<svg viewBox="0 0 24 24" class="w-full h-full"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    },
    {
        name: 'Instagram',
        id: 'instagram',
        color: '#ee2a7b',
        logo: `<svg viewBox="0 0 24 24" class="w-full h-full"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#f9ce34;stop-opacity:1" /><stop offset="50%" style="stop-color:#ee2a7b;stop-opacity:1" /><stop offset="100%" style="stop-color:#6228d7;stop-opacity:1" /></linearGradient></defs><path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44-1.441-.645-1.441-1.44.646-1.44 1.441-1.44z"/></svg>`
    },
    {
        name: 'YouTube',
        id: 'youtube',
        color: '#FF0000',
        logo: `<svg viewBox="0 0 24 24" class="w-full h-full"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    {
        name: 'TikTok',
        id: 'tiktok',
        color: '#00f2ea',
        logo: `<svg viewBox="0 0 24 24" class="w-full h-full"><path fill="#fff" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
    }
];

const PurchaseToast = () => {
    const [toasts, setToasts] = useState([])
    const toastCounter = useRef(0)
    const timeoutRef = useRef(null)

    const triggerNotification = useCallback(() => {
        const name = idNames[Math.floor(Math.random() * idNames.length)]
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const mins = Math.floor(Math.random() * 45) + 2
        const id = toastCounter.current++

        const newToast = { id, name, platform, mins }
        setToasts(prev => [...prev, newToast])

        // Auto remove after 6 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 6000)

        // Schedule next toast (random 8-25s)
        const nextTime = Math.random() * (25000 - 8000) + 8000
        timeoutRef.current = setTimeout(triggerNotification, nextTime)
    }, [toasts.length])

    useEffect(() => {
        // Initial trigger
        const timer = setTimeout(triggerNotification, 5000)
        return () => {
            clearTimeout(timer)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div id="purchaseToasts" className="fixed bottom-5 right-5 z-[50000] flex flex-col gap-2 pointer-events-none items-end">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                mass: 1,
                                ease: [0.175, 0.885, 0.32, 1.275]
                            }
                        }}
                        exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.4 } }}
                        className="purchase-toast relative"
                    >
                        <div className="bg-[#141414]/95 backdrop-blur-xl border border-aurora-gold/40 rounded-[13px] flex items-center gap-3 p-3 md:p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-l-[3px]" style={{ borderLeftColor: toast.platform.color }}>

                            {/* Avatar / Logo Container */}
                            <div className="purchase-avatar w-12 h-12 flex-shrink-0 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden shadow-inner border border-white/5">
                                <div
                                    className="w-8 h-8 flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: toast.platform.logo }}
                                />
                            </div>

                            {/* Content */}
                            <div className="purchase-content flex flex-col pr-2">
                                <span className="purchase-name text-white font-bold text-sm md:text-base leading-tight">
                                    {toast.name}
                                </span>
                                <span className="purchase-text text-white/50 text-[10px] md:text-xs font-medium leading-tight mt-0.5">
                                    Telah membeli paket ini...!!
                                </span>
                                <span className="purchase-platform text-[9px] font-bold mt-1 tracking-wide opacity-80" style={{ color: toast.platform.color }}>
                                    {toast.platform.name} • {toast.mins} menit yang lalu
                                </span>
                            </div>

                            {/* Glow Accent */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-3/5 rounded-l-full opacity-30" style={{ backgroundColor: toast.platform.color }} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default PurchaseToast
