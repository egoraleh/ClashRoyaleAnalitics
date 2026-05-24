import { Trophy, Target, TrendingUp, Award, Calendar, Zap } from 'lucide-react';

const favoriteCards = [
    { name: 'Hog Rider', usage: 150, winRate: 68, progressClass: 'w-[68%]' },
    { name: 'Valkyrie', usage: 142, winRate: 65, progressClass: 'w-[65%]' },
    { name: 'Fireball', usage: 138, winRate: 64, progressClass: 'w-[64%]' },
    { name: 'Musketeer', usage: 125, winRate: 67, progressClass: 'w-[67%]' },
    { name: 'Log', usage: 118, winRate: 70, progressClass: 'w-[70%]' },
    { name: 'Cannon', usage: 102, winRate: 62, progressClass: 'w-[62%]' },
];

const achievements = [
    { name: 'Arena Champion', description: 'Reach 6000 trophies', earned: true },
    { name: 'Deck Master', description: 'Create 10 unique decks', earned: true },
    { name: 'Win Streak', description: 'Win 10 games in a row', earned: true },
    { name: 'Tournament Victor', description: 'Win a tournament', earned: false },
    { name: 'Card Collector', description: 'Max out 50 cards', earned: false },
    { name: 'Legendary', description: 'Reach 7000 trophies', earned: false },
];

const stats = [
    { label: 'Total Games', value: '1,247', icon: Zap },
    { label: 'Total Wins', value: '798', icon: Trophy },
    { label: 'Win Rate', value: '64%', icon: TrendingUp },
    { label: 'Highest Trophies', value: '6,120', icon: Target },
    { label: 'Favorite Arena', value: 'Legendary', icon: Award },
    { label: 'Days Played', value: '245', icon: Calendar },
];

export function Profile() {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 lg:col-span-4'>
                <div className='bg-card border border-border rounded-xl p-6 shadow-xl mb-6'>
                    <div className='flex flex-col items-center mb-6'>
                        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-xl shadow-primary/30 mb-4'>
                            <span className='text-4xl'>👑</span>
                        </div>
                        <h2 className='mb-1'>ClashMaster</h2>
                        <p className='text-muted-foreground'>#2Y8QP9CV</p>
                    </div>

                    <div className='space-y-3'>
                        <div className='flex items-center justify-between p-3 rounded-lg bg-background/50'>
                            <span className='text-muted-foreground'>Level</span>
                            <span>13</span>
                        </div>
                        <div className='flex items-center justify-between p-3 rounded-lg bg-background/50'>
                            <span className='text-muted-foreground'>Clan</span>
                            <span>Royal Elite</span>
                        </div>
                        <div className='flex items-center justify-between p-3 rounded-lg bg-background/50'>
                            <span className='text-muted-foreground'>Current Trophies</span>
                            <span className='text-[#10b981]'>5,580</span>
                        </div>
                        <div className='flex items-center justify-between p-3 rounded-lg bg-background/50'>
                            <span className='text-muted-foreground'>Best Trophies</span>
                            <span className='text-[#06b6d4]'>6,120</span>
                        </div>
                    </div>
                </div>

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4'>Achievements</h2>
                    <div className='space-y-2'>
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border transition-all ${
                                    achievement.earned
                                        ? 'bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 border-primary/20'
                                        : 'bg-background/30 border-border/50 opacity-50'
                                }`}
                            >
                                <div className='flex items-start gap-3'>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            achievement.earned
                                                ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <Award className='w-4 h-4' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='mb-0.5'>{achievement.name}</div>
                                        <div className='text-xs text-muted-foreground'>
                                            {achievement.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='col-span-12 lg:col-span-8'>
                <div className='grid grid-cols-3 gap-4 mb-6'>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className='bg-card border border-border rounded-xl p-4 shadow-xl'
                            >
                                <Icon className='w-5 h-5 text-[#8b5cf6] mb-3' />
                                <div className='text-2xl mb-1'>{stat.value}</div>
                                <div className='text-sm text-muted-foreground'>{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div className='bg-card border border-border rounded-xl p-6 shadow-xl'>
                    <h2 className='mb-4'>Favorite Cards</h2>
                    <div className='grid grid-cols-2 gap-4'>
                        {favoriteCards.map((card, index) => (
                            <div
                                key={index}
                                className='p-4 rounded-lg bg-gradient-to-br from-background/50 to-background border border-border/50 hover:border-primary/30 transition-all'
                            >
                                <div className='flex items-center gap-4 mb-3'>
                                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg'>
                                        <span className='text-xl'>⚔️</span>
                                    </div>
                                    <div className='flex-1'>
                                        <h3>{card.name}</h3>
                                        <div className='text-sm text-muted-foreground'>
                                            {card.usage} uses
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm text-muted-foreground'>Win Rate</span>
                                    <span className='text-[#10b981]'>{card.winRate}%</span>
                                </div>
                                <div className='w-full bg-background rounded-full h-1.5 mt-2'>
                                    <div
                                        className={`bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-1.5 rounded-full transition-all ${card.progressClass}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
