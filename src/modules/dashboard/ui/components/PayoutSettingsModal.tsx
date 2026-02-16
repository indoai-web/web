'use client';

import React, { useState } from 'react';
import { X, Landmark, Smartphone, Check, Loader2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/shared/ui/Toast';

interface PayoutSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDetails?: any;
    onSuccess: () => void;
}

const PROVIDERS = [
    {
        id: 'BCA',
        name: 'BCA (Bank Central Asia)',
        type: 'bank',
        icon: (
            <div className="bg-white p-1 rounded-md flex items-center justify-center h-6 w-12 overflow-hidden shadow-sm">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/512px-Bank_Central_Asia.svg.png"
                    alt="BCA"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=BCA&background=0066AE&color=fff&size=128'; }}
                />
            </div>
        )
    },
    {
        id: 'BNI',
        name: 'BNI (Bank Negara Indonesia)',
        type: 'bank',
        icon: (
            <div className="bg-white p-1 rounded-md flex items-center justify-center h-6 w-12 overflow-hidden shadow-sm">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Logo_BNI.svg/512px-Logo_BNI.svg.png"
                    alt="BNI"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=BNI&background=FF6600&color=fff&size=128'; }}
                />
            </div>
        )
    },
    {
        id: 'MANDIRI',
        name: 'Bank Mandiri',
        type: 'bank',
        icon: (
            <div className="bg-white p-1 rounded-md flex items-center justify-center h-6 w-12 overflow-hidden shadow-sm">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/512px-Bank_Mandiri_logo_2016.svg.png"
                    alt="Mandiri"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=MDR&background=F7941D&color=fff&size=128'; }}
                />
            </div>
        )
    },
    {
        id: 'DANA',
        name: 'DANA (E-Wallet)',
        type: 'ewallet',
        icon: (
            <div className="bg-white p-1 rounded-md flex items-center justify-center h-6 w-12 overflow-hidden shadow-sm">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/512px-Logo_dana_blue.svg.png"
                    alt="DANA"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=DANA&background=118EEA&color=fff&size=128'; }}
                />
            </div>
        )
    },
];

export const PayoutSettingsModal: React.FC<PayoutSettingsModalProps> = ({ isOpen, onClose, currentDetails, onSuccess }) => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState(currentDetails?.provider || '');
    const [accountName, setAccountName] = useState(currentDetails?.account_name || '');
    const [accountNumber, setAccountNumber] = useState(currentDetails?.account_number || currentDetails?.phone || '');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selected = PROVIDERS.find(p => p.id === provider);
        if (!selected) return;

        const payoutDetails = {
            type: selected.type,
            provider: selected.id,
            account_name: accountName,
            ...(selected.type === 'bank' ? { account_number: accountNumber } : { phone: accountNumber })
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ payout_details: payoutDetails })
            .eq('id', user.id);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Data Pembayaran Berhasil Disimpan!', 'success');
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0A0A0B] border border-white-border/10 rounded-[13px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-foreground/20 hover:text-foreground transition-all">
                    <X size={18} />
                </button>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-black tracking-tight text-foreground uppercase italic">Atur <span className="text-gold-accent">Data Pembayaran</span></h2>
                        <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest">Pilih bank atau e-wallet utama Anda</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-1">Pilih Provider</label>
                            <div className="grid grid-cols-2 gap-2">
                                {PROVIDERS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setProvider(p.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${provider === p.id ? 'bg-[#a3ff12]/10 border-[#a3ff12]/50 text-[#a3ff12]' : 'bg-white/[0.02] border-white/5 text-foreground/40 hover:border-white/10'}`}
                                    >
                                        {p.icon}
                                        <span className="text-[9px] font-black uppercase tracking-tight">{p.id}</span>
                                        {provider === p.id && <Check size={12} className="ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-1">Nama Pemilik Rekening</label>
                            <input
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="Sesuai buku tabungan / App"
                                className="w-full px-5 py-3 rounded-xl bg-white/[0.03] border border-white-border/10 focus:border-gold-accent/50 outline-none text-[11px] font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-1">
                                {provider === 'DANA' ? 'Nomor HP DANA' : 'Nomor Rekening'}
                            </label>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder={provider === 'DANA' ? 'Contoh: 0812...' : 'Masukkan No. Rekening'}
                                className="w-full px-5 py-3 rounded-xl bg-white/[0.03] border border-white-border/10 focus:border-gold-accent/50 outline-none text-[11px] font-bold"
                                required
                            />
                        </div>

                        {provider === 'DANA' && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <AlertCircle size={14} className="text-blue-400 mt-0.5" />
                                <p className="text-[8px] font-bold text-blue-400/60 leading-relaxed uppercase italic">Pastikan Nomor HP DANA aktif dan akun sudah premium agar transfer tidak terkendala.</p>
                            </div>
                        )}

                        <button
                            disabled={loading || !provider}
                            className="w-full mt-4 py-4 rounded-xl bg-gold-accent text-background font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold-accent/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Data Rekening'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
