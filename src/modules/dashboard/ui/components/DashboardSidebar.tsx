'use client';

import React from 'react';
import {
    LayoutDashboard,
    Layers,
    Box,
    FileCode,
    Settings,
    LogOut,
    ExternalLink,
    Users,
    BookOpen,
    Coins,
    MessageSquare,
    Package
} from 'lucide-react';

export type DashboardView = 'overview' | 'versions' | 'modules' | 'settings' | 'members' | 'facilities' | 'affiliate' | 'messaging' | 'premium_tools';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-gold-accent/10 text-gold-accent'
            : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'
            }`}
    >
        <Icon size={20} className={active ? 'text-gold-accent' : 'group-hover:text-gold-accent/70 transition-colors'} />
        <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
);

interface DashboardSidebarProps {
    currentView: DashboardView;
    onViewChange: (view: DashboardView) => void;
    onSignOut: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ currentView, onViewChange, onSignOut }) => {
    return (
        <aside className="w-64 h-screen border-r border-white-border bg-card/30 backdrop-blur-3xl flex flex-col p-6 fixed left-0 top-0 z-20">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-gold-accent to-yellow-accent rounded-lg flex items-center justify-center shadow-lg shadow-gold-accent/20">
                    <Box size={18} className="text-background" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none text-gold-accent">
                        Indo AI
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Studio CMS</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-4 px-2">Main Menu</div>

                <SidebarItem
                    icon={LayoutDashboard}
                    label="Overview"
                    active={currentView === 'overview'}
                    onClick={() => onViewChange('overview')}
                />
                <SidebarItem
                    icon={Layers}
                    label="Landing Engine"
                    active={currentView === 'versions'}
                    onClick={() => onViewChange('versions')}
                />
                <SidebarItem
                    icon={Users}
                    label="Member List"
                    active={currentView === 'members'}
                    onClick={() => onViewChange('members')}
                />
                <SidebarItem
                    icon={BookOpen}
                    label="Library & Tools"
                    active={currentView === 'facilities'}
                    onClick={() => onViewChange('facilities')}
                />
                <SidebarItem
                    icon={Coins}
                    label="Affiliate Program"
                    active={currentView === 'affiliate'}
                    onClick={() => onViewChange('affiliate')}
                />
                <SidebarItem
                    icon={MessageSquare}
                    label="WhatsApp Center"
                    active={currentView === 'messaging'}
                    onClick={() => onViewChange('messaging')}
                />
                <SidebarItem
                    icon={Package}
                    label="TOOL Premium"
                    active={currentView === 'premium_tools'}
                    onClick={() => onViewChange('premium_tools')}
                />
                <SidebarItem
                    icon={Box}
                    label="Active Modules"
                    active={currentView === 'modules'}
                    onClick={() => onViewChange('modules')}
                />
                <SidebarItem
                    icon={Settings}
                    label="System Config"
                    active={currentView === 'settings'}
                    onClick={() => onViewChange('settings')}
                />
            </nav>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-6 border-t border-white-border">
                <button
                    onClick={() => window.open('/', '_blank')}
                    className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-gold-accent transition-colors"
                >
                    View Live Site <ExternalLink size={12} />
                </button>

                <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
