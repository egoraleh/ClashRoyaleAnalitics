import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Sparkles, Swords, Layers, User } from 'lucide-react';

export function Layout() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/ai-deck-generator', label: 'AI Deck Generator', icon: Sparkles },
        { path: '/deck-comparison', label: 'Deck Comparison', icon: Swords },
        { path: '/my-decks', label: 'My Decks', icon: Layers },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className='dark min-h-screen bg-background text-foreground'>
            <nav className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
                <div className='max-w-[1440px] mx-auto px-6'>
                    <div className='flex items-center justify-between h-16'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-primary/20'>
                                <span className='text-xl'>⚔️</span>
                            </div>
                            <h1 className='text-xl tracking-tight'>Royale Analytics</h1>
                        </div>

                        <div className='flex items-center gap-1'>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-lg transition-all ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Icon className='w-4 h-4' />
                                            <span className='hidden md:inline'>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            <main className='max-w-[1440px] mx-auto px-6 py-8'>
                <Outlet />
            </main>
        </div>
    );
}
