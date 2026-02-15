'use client';

import React, { useState } from 'react';

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white-border rounded-lg p-2 text-[9px] font-bold uppercase tracking-widest text-[#2dd4bf] flex justify-between items-center group hover:border-teal-accent/50 transition-all"
            >
                <span className="truncate">{options.find(o => o.value === value)?.label || placeholder}</span>
                <svg
                    className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-[#18181b] border border-white-border rounded-xl shadow-2xl overflow-hidden z-[70] animate-in slide-in-from-bottom-2 duration-200">
                        <div className="max-h-48 overflow-auto custom-scrollbar">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition-all
                                        ${value === opt.value ? 'bg-teal-accent text-background' : 'text-foreground/70 hover:bg-white/5 hover:text-teal-accent'}
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
