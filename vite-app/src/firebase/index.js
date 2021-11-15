import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { useRouter } from 'vue-router';
//import { getAnalytics } from 'firebase/analytics';


// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBj2ID5ItDwEPUeVzKfYUZBvtLxVB8bjZI',
    authDomain: 'ukv-bot-dev.firebaseapp.com',
    projectId: 'ukv-bot-dev',
    storageBucket: 'ukv-bot-dev.appspot.com',
    messagingSenderId: '560183245126',
    appId: '1:560183245126:web:a18be65feff81925094d47'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(app);
const auth = getAuth();
//const analytics = getAnalytics();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Hack since the user state gets dropped every refresh
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Logged in:', user.uid);
    } else {
        localStorage.setItem('user', null);
        console.log('Logged out');
    }
});

export { app, db, storage, auth };