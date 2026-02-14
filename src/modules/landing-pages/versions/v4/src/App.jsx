import { motion, useScroll, useSpring } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/Sections/HeroSection'
import BenefitsSection from './components/Sections/BenefitsSection'
import VIPSection from './components/Sections/VIPSection'
import BonusSection from './components/Sections/BonusSection'
import FinalCTASection from './components/Sections/FinalCTASection'
import Footer from './components/Footer'

import MarqueeSection from './components/Sections/MarqueeSection'
import PurchaseToast from './components/PurchaseToast'

function App() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <main className="relative min-h-screen">
            {/* Background Layer (Grainient) */}
            <div className="grainient-container">
                <div className="grainient-blobs">
                    <div className="grainient-blob blob-cyan" />
                    <div className="grainient-blob blob-purple" />
                    <div className="grainient-blob blob-deep" />
                </div>
                <div className="grain-overlay noise-overlay" />
            </div>

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-aurora-gold z-50 origin-left"
                style={{ scaleX }}
            />

            <Navbar />

            <div className="relative z-10">
                <HeroSection />
                <MarqueeSection />
                <BenefitsSection />
                <VIPSection />
                <BonusSection />
                <FinalCTASection />
            </div>

            <Footer />
            <PurchaseToast />
        </main>
    )
}

export default App
