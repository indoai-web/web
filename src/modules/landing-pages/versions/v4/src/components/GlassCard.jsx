import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const GlassCard = ({ children, className, animateSweep = false, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={cn(
                "relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-xl transition-all duration-500 hover:bg-white/15",
                animateSweep && "light-sweep-container animate-sweep",
                className
            )}
        >
            {animateSweep && <div className="light-sweep" />}
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}

export default GlassCard
