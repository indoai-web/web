import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Crown } from 'lucide-react'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Benefits', href: '#benefits' },
        { name: 'VIP', href: '#vip' },
        { name: 'Bonus', href: '#bonus' },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 pt-0 md:pt-0">
            <motion.div
                initial={false}
                animate={{
                    width: isScrolled ? '90%' : '100%',
                    y: isScrolled ? 20 : 0,
                    borderRadius: isScrolled ? '9999px' : '0px',
                    backgroundColor: isScrolled ? 'rgba(15, 23, 42, 0.7)' : 'rgba(15, 23, 42, 0)',
                    backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
                    borderWidth: isScrolled ? '1px' : '0px',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    paddingTop: isScrolled ? '12px' : '20px',
                    paddingBottom: isScrolled ? '12px' : '20px',
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="flex items-center justify-between px-8 md:px-12 shadow-2xl overflow-hidden"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-aurora-gold/20 blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Crown className="w-8 h-8 text-aurora-gold relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter leading-none font-syne uppercase">
                            INDO<span className="text-aurora-gold">AI</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/40 font-space">REVOLUSI ASSET DIGITAL</span>
                    </div>
                </motion.div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-white/70 hover:text-white transition-colors tracking-wide"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                </div>
            </motion.div>
        </nav>
    )
}

export default Navbar
