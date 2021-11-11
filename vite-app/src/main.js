import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { db, storage, auth } from './firebase';
import { getAuth } from '@firebase/auth';
import { getUser } from './utils';

//import 'materialize-css/dist/css/materialize.min.css'
//import 'material-design-icons-iconfont/src/material-design-icons.scss';
//import 'material-design-icons-iconfont/dist/fonts';

    //<link href=".../material-design-icons.css" rel="stylesheet"></link>

createApp(App)
    .provide('db', db)
    .provide('storage', storage)
    .provide('auth', auth)
    .use(router)
    .mount('#app');


    //.component('font-awesome-icon', FontAwesomeIcon)
//import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
//import { library } from "@fortawesome/fontawesome-svg-core";
//import { faPhone, faRedo, faUserCircle, faCommentAlt, faChevronDown } from "@fortawesome/free-solid-svg-icons";


//library.add(faPhone);
//library.add(faCommentAlt);
//library.add(faChevronDown);
//library.add(faUserCircle);
//library.add(faRedo);