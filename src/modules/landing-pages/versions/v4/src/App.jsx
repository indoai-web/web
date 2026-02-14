import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/Sections/HeroSection'
import BenefitsSection from './components/Sections/BenefitsSection'
import GallerySection from './components/Sections/GallerySection'
import VIPSection from './components/Sections/VIPSection'
import BonusSection from './components/Sections/BonusSection'
import FinalCTASection from './components/Sections/FinalCTASection'
import Footer from './components/Footer'

import MarqueeSection from './components/Sections/MarqueeSection'
import PurchaseToast from './components/PurchaseToast'
import backgroundImage from './assets/background.png'

function App() {
    const { scrollY, scrollYProgress } = useScroll()
    const backgroundY = useTransform(scrollY, [0, 3000], [-100, 100])
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <main className="relative min-h-screen">
            {/* Background Layer (Grainient) */}
            <div className="grainient-container">
                {/* Advanced Atmospheric Background System */}
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute -inset-x-0 -inset-y-20 pointer-events-none"
                >
                    <motion.img
                        src={backgroundImage}
                        initial={{ opacity: 0.2, scale: 1.3, rotate: 0, x: 0, y: 0 }}
                        animate={{
                            opacity: [0.2, 0.28, 0.35, 0.25, 0.2],
                            scale: [1.3, 1.35, 1.3, 1.38, 1.3],
                            rotate: [0, 0.5, -0.3, -0.5, 0.3, 0],
                            x: [0, 15, -10, 8, -15, 0],
                            y: [0, -10, 8, -4, 10, 0]
                        }}
                        transition={{
                            duration: 60,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-full h-full object-cover brightness-75 saturate-[0.9]"
                        alt="background"
                    />
                </motion.div>

                <div className="grainient-blobs">
                    <div className="grainient-blob blob-cyan opacity-20" />
                    <div className="grainient-blob blob-purple opacity-20" />
                    <div className="grainient-blob blob-deep opacity-10" />
                </div>

                {/* Subtle Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[#030a08] pointer-events-none" />
                <div className="grain-overlay noise-overlay opacity-[0.03]" />
            </div>

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-aurora-gold z-50 origin-left"
                style={{ scaleX }}
            />

            <Navbar />

            <div className="relative z-10">
                <HeroSection />
                <BenefitsSection />
                <GallerySection />
                <VIPSection />
                <BonusSection />
                <MarqueeSection />
                <FinalCTASection />
            </div>

            <Footer />
            <PurchaseToast />
        </main>
    )
}

export default App
