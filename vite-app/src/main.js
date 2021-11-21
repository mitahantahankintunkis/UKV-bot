import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { db, storage, auth } from './firebase';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPhone, faRedo, faUserCircle, faCommentAlt, faChevronDown, faSave, faExpand, faDownload, faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";


library.add(faPhone);
library.add(faCommentAlt);
library.add(faChevronDown);
library.add(faUserCircle);
library.add(faRedo);
library.add(faSave);
library.add(faExpand);
library.add(faDownload);
library.add(faUpload);
library.add(faTimes);

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .provide('db', db)
    .provide('storage', storage)
    .provide('auth', auth)
    .use(router)
    .mount('#app');