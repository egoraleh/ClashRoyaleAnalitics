import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: { name: 'login' },
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@pages/LoginPage.vue'),
        meta: {
            title: 'Login',
        },
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@pages/RegistrationPage.vue'),
        meta: {
            title: 'Registration',
        },
    },
];

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
    const baseTitle = 'Clash Royale Analytics';
    document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;
});
