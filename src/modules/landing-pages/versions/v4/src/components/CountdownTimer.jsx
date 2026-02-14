import { useState, useEffect } from 'react';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(12 * 60 * 60); // 12 hours in seconds

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    return (
        <div className="flex justify-center gap-4 md:gap-6 mb-10">
            <TimeUnit value={time.h} label="Jam" />
            <div className="text-3xl md:text-5xl font-black text-white/20 self-center pt-2">:</div>
            <TimeUnit value={time.m} label="Menit" />
            <div className="text-3xl md:text-5xl font-black text-white/20 self-center pt-2">:</div>
            <TimeUnit value={time.s} label="Detik" />
        </div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-aurora-gold/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative w-16 h-20 md:w-24 md:h-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Visual Decorative Line */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5 z-10" />

                <span className="text-4xl md:text-6xl font-black text-white animate-text-shine font-space">
                    {value}
                </span>
            </div>
        </div>
        <span className="mt-3 text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-[0.2em] italic">
            {label}
        </span>
    </div>
);

export default CountdownTimer;
