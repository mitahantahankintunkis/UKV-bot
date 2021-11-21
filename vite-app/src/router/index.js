import { createRouter, createWebHistory } from 'vue-router';
import { getUser } from '../utils';


const routes = [
    { path: '/login', component: () => import('../views/LoginPage.vue') },
    { path: '/logout', component: () => import('../views/LogoutPage.vue') },

    {
        path: '/hanke/:project',
        component: () => import('../views/BotPage.vue'),
        //children: [
        //    { path: '', component: () => import('../views/AdminPageGeneral.vue'),   props: { project: {} }, },
        //],
    },

    {
        path: '/admin/:project',
        component: () => import('../views/AdminPage.vue'),
        meta: {
            loginRequired: true
        },
        children: [
            { path: '',          component: () => import('../views/AdminPageGeneral.vue'),   props: { project: {} }, },
            { path: 'site',      component: () => import('../views/AdminPageEditor.vue'),    props: { project: {} }, },
            { path: 'bot',       component: () => import('../views/AdminPageGraph.vue'),     props: { project: {} }, },
            { path: 'analytics', component: () => import('../views/AdminPageAnalytics.vue'), props: { project: {} }, },
        ],
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