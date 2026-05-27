import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/api/auth-context';

type Props = {
    onClose: () => void;
};

export function AuthModal({ onClose }: Props) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [playerTag, setPlayerTag] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            if (mode === 'login') {
                await login(username, password);
            } else {
                await register(username, email, password, playerTag);
            }
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={onClose}>
            <div className='bg-card border border-border rounded-xl p-8 shadow-2xl w-full max-w-md mx-4' onClick={e => e.stopPropagation()}>
                <div className='flex items-center justify-between mb-6'>
                    <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                    <button onClick={onClose} className='p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm text-muted-foreground'>Username</label>
                        <input
                            type='text'
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'
                            required
                            minLength={3}
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className='block mb-2 text-sm text-muted-foreground'>Email</label>
                            <input
                                type='email'
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className='block mb-2 text-sm text-muted-foreground'>Password</label>
                        <input
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'
                            required
                            minLength={6}
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className='block mb-2 text-sm text-muted-foreground'>Player Tag (e.g. #2Y8QP9CV)</label>
                            <input
                                type='text'
                                value={playerTag}
                                onChange={e => setPlayerTag(e.target.value)}
                                className='w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors'
                                required
                                placeholder='#2Y8QP9CV'
                            />
                        </div>
                    )}

                    {error && (
                        <div className='text-sm text-[#ef4444] bg-[#ef4444]/10 rounded-lg p-3 border border-[#ef4444]/20'>
                            {error}
                        </div>
                    )}

                    <button
                        type='submit'
                        disabled={busy}
                        className='w-full py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50'
                    >
                        {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>

                    <div className='text-center text-sm text-muted-foreground'>
                        {mode === 'login' ? (
                            <>Don&apos;t have an account?{' '}
                                <button type='button' onClick={() => { setMode('register'); setError(''); }} className='text-primary hover:underline'>
                                    Register
                                </button>
                            </>
                        ) : (
                            <>Already have an account?{' '}
                                <button type='button' onClick={() => { setMode('login'); setError(''); }} className='text-primary hover:underline'>
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
