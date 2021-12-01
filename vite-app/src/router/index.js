import { doc, increment, serverTimestamp, setDoc, updateDoc } from '@firebase/firestore';
import { createRouter, createWebHistory } from 'vue-router';
import { getUser } from '../utils';


const routes = [
    { path: '/', component: () => import('../views/LandingPage.vue') },
    { path: '/login', component: () => import('../views/LoginPage.vue') },

    {
        path: '/logout',
        component: () => import('../views/LogoutPage.vue'),
        meta: { loginRequired: true },
    },

    {
        path: '/p/:project/',
        component: () => import('../views/BotPage.vue'),
        children: [
            { path: '',           name: 'project', component: () => import('../views/BotPageProject.vue'), props: { project: {} }, },
            { path: 'tietosuoja', name: 'gdpr',    component: () => import('../views/BotPageGDPR.vue'),    props: { project: {} }, },
            { path: 'ukv',        name: 'ukv',     component: () => import('../views/BotPageUKV.vue'),     props: { project: {} }, },
        ],
    },

    {
        path: '/projekti/:project/',
        component: () => import('../views/BotPage.vue'),
        children: [
            { path: '',           name: 'project', component: () => import('../views/BotPageProject.vue'), props: { project: {} }, },
            { path: 'tietosuoja', name: 'gdpr',    component: () => import('../views/BotPageGDPR.vue'),    props: { project: {} }, },
            { path: 'ukv',        name: 'ukv',     component: () => import('../views/BotPageUKV.vue'),     props: { project: {} }, },
        ],
    },

    {
        path: '/admin/:project/',
        component: () => import('../views/AdminPage.vue'),
        meta: { loginRequired: true },
        children: [
            { path: '',          name: 'admin-management', meta: { loginRequired: true }, component: () => import('../views/AdminPageGeneral.vue'),   props: { project: {} }, },
            { path: 'site',      name: 'admin-editor',     meta: { loginRequired: true }, component: () => import('../views/AdminPageEditor.vue'),    props: { project: {} }, },
            { path: 'bot',       name: 'admin-graph',      meta: { loginRequired: true }, component: () => import('../views/AdminPageGraph.vue'),     props: { project: {} }, },
            { path: 'analytics', name: 'admin-anal',       meta: { loginRequired: true }, component: () => import('../views/AdminPageAnalytics.vue'), props: { project: {} }, },
        ],
    },
    {
        path: '/admin/',
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

let db = null;
const addAnalytics = (d) => db = d;

// Saves 
async function saveToDb(to) {
    // Doesn't monitor admin usage
    //if (to.path.startsWith('/admin')) return;
    if (to.matched.some(record => record.meta.loginRequired)) {
        return;
    }

    const key = btoa(to.fullPath);
    const docRef = doc(db, 'visits', key);
    const data = {
        visits: increment(1),
        lastUpdate: serverTimestamp(),
    };

    await updateDoc(docRef, data)
        .catch((e) => {
            // Creates the document for the first ever visit
            data.visits = 1;
            setDoc(docRef, data)
                .catch(console.error);
        });
}

// Authentication
router.beforeEach((to, from, next) => {
    if (db) saveToDb(to);

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

export { router, addAnalytics };