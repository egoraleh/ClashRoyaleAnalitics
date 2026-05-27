import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AIDeckGenerator } from './pages/AIDeckGenerator';
import { DeckComparison } from './pages/DeckComparison';
import { MyDecks } from './pages/MyDecks';
import { Profile } from './pages/Profile';
import { useAuth } from '@/api/auth-context';

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (!user) {
        return (
            <Navigate
                to='/'
                replace
            />
        );
    }

    return children;
}

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            { index: true, Component: Dashboard },
            { path: 'ai-deck-generator', Component: AIDeckGenerator },
            { path: 'deck-comparison', Component: DeckComparison },
            {
                path: 'my-decks',
                element: (
                    <RequireAuth>
                        <MyDecks />
                    </RequireAuth>
                ),
            },
            {
                path: 'profile',
                element: (
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                ),
            },
        ],
    },
]);
