import { createRouter, createWebHistory } from 'vue-router';
import { getUser } from '../utils';


const routes = [
    { path: '/hanke/:project', component: () => import('../views/BotPage.vue') },
    { path: '/login', component: () => import('../views/LoginPage.vue') },
    { path: '/logout', component: () => import('../views/LogoutPage.vue') },
    {
        path: '/admin/:project',
        component: () => import('../views/AdminPage.vue'),
        meta: {
            loginRequired: true
        },
    },
    {
        path: '/admin',
        component: () => import('../views/ProjectSelectionPage.vue'),
        meta: {
            loginRequired: true
        },
    },

    // Errors
    { path: '/:pathMatch(.*)*', component: () => import('../views/404.vue') },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Authentication
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.loginRequired)) {
        const user = getUser();

        if (user) {
            next();
        } else {
            next({ path: '/login' });
        }
    } else {
        next();
    }
});

export default router;