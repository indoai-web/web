import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Youtube, Instagram, Twitter, Music } from 'lucide-react'

const names = [
    "Putri Salju", "Andi Wijaya", "Santi Permata", "Budi Santoso", "Rina Amelia",
    "Eko Prasetyo", "Dewi Lestari", "Rizky Ramadhan", "Anita Sari", "Fajar Hidayat",
    "Kevin Sanjaya", "Lidya Putri", "Bambang Pamungkas", "Siti Aminah", "Joko Widodo",
    "Maya Kartika", "Hendra Setiawan", "Agus Sutrisno", "Yulia Wahyuni", "Dedi Kusnadi",
    "Ratna Sari", "Iwan Fals", "Siska Rahmawati", "Taufiq Hidayat", "Indah Permata",
    "Aditya Nugroho", "Fitriani Shinta", "Denny Sumargo", "Gita Gutawa", "Baim Wong",
    "Raisa Andriana", "Tulus", "Isyana Sarasvati", "Afgan Syahreza", "Vidi Aldiano",
    "Bunga Citra Lestari", "Ariel Noah", "Luna Maya", "Christian Sugiono", "Titi Kamal",
    "Raffi Ahmad", "Nagita Slavina", "Gading Marten", "Gisella Anastasia", "Deddy Corbuzier",
    "Najwa Shihab", "Sule", "Andre Taulany", "Vincent Rompies", "Desta Mahendra",
    "Raditya Dika", "Ernest Prakasa", "Pandji Pragiwaksono", "Arie Kriting", "Abdur Arsyad",
    "Kunto Aji", "Pamungkas", "Danilla Riyadi", "Hindia", "Yura Yunita",
    "Boy William", "Daniel Mananta", "Agnez Mo", "Cinta Laura", "Joe Taslim",
    "Iko Uwais", "Rio Dewanto", "Atiqah Hasiholan", "Reza Rahadian", "Adinia Wirasti",
    "Dian Sastro", "Nicholas Saputra", "Tara Basro", "Chicco Jerikho", "Pevita Pearce",
    "Hamish Daud", "Chelsea Islan", "Iqbaal Ramadhan", "Angga Yunanda", "Adhisty Zara",
    "Prilly Latuconsina", "Aliando Syarief", "Verrell Bramasta", "Natasha Wilona", "Stefan William",
    "Jessica Mila", "Enzy Storia", "Hesti Purwadinata", "Desta", "Irfan Hakim",
    "Rina Nose", "Gilang Dirga", "Ruben Onsu", "Sarwendah", "Ivan Gunawan",
    "Ayu Ting Ting", "Zaskia Gotik", "Via Vallen", "Nella Kharisma", "Denny Caknan"
]

const packages = [
    "Paket VIP", "Bundle Lengkap", "Akses Eksklusif", "Slot AI Influencer"
]

const platforms = [
    {
        name: "YouTube",
        icon: <Youtube className="w-5 h-5 text-white" />,
        color: "bg-[#FF0000]",
        textColor: "text-[#FF0000]"
    },
    {
        name: "Instagram",
        icon: <Instagram className="w-5 h-5 text-white" />,
        color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
        textColor: "text-[#ee2a7b]"
    },
    {
        name: "TikTok",
        icon: <Music className="w-5 h-5 text-white" />,
        color: "bg-[#000000] border border-white/20",
        textColor: "text-[#00f2ea]"
    },
    {
        name: "Twitter",
        icon: <Twitter className="w-5 h-5 text-white" />,
        color: "bg-[#1DA1F2]",
        textColor: "text-[#1DA1F2]"
    }
]

const PurchaseToast = () => {
    const [visible, setVisible] = useState(false)
    const [currentPurchase, setCurrentPurchase] = useState({
        name: "",
        package: "",
        time: "",
        platform: platforms[0]
    })

    const triggerNotification = () => {
        const randomName = names[Math.floor(Math.random() * names.length)]
        const randomPackage = packages[Math.floor(Math.random() * packages.length)]
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
        const randomMinutes = Math.floor(Math.random() * 55) + 5

        setCurrentPurchase({
            name: randomName,
            package: randomPackage,
            time: `${randomMinutes} menit yang lalu`,
            platform: randomPlatform
        })

        setVisible(true)

        // Hide after 6 seconds
        setTimeout(() => {
            setVisible(false)
        }, 6000)
    }

    useEffect(() => {
        // Initial trigger after 5 seconds
        const timer = setTimeout(triggerNotification, 5000)

        // Repeated trigger every 10 seconds
        const interval = setInterval(triggerNotification, 10000)

        return () => {
            clearTimeout(timer)
            clearInterval(interval)
        }
    }, [])

    return (
        <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-[#0f172a]/90 backdrop-blur-xl border border-aurora-gold/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[280px] md:min-w-[320px]"
                    >
                        {/* Icon Container (Branded Style) */}
                        <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 ${currentPurchase.platform.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                {currentPurchase.platform.icon}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-aurora-gold rounded-full animate-ping" />
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col">
                            <h4 className="text-white font-bold text-sm md:text-base font-syne uppercase">
                                {currentPurchase.name}
                            </h4>
                            <p className="text-white/60 text-[10px] md:text-xs font-medium font-plus leading-tight">
                                Telah membeli, {currentPurchase.package}...!!
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`${currentPurchase.platform.textColor} font-bold text-[9px] uppercase tracking-wider`}>
                                    {currentPurchase.platform.name} BUY
                                </span>
                                <span className="text-white/30 text-[9px]">•</span>
                                <span className="text-white/40 text-[9px] font-medium">{currentPurchase.time}</span>
                            </div>
                        </div>

                        {/* Side accent matching platform */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 ${currentPurchase.platform.color} rounded-r-full`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default PurchaseToast
