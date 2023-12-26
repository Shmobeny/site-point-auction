import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './router';

const app = createApp(App).use(router);
app.mount('#app');

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register('/sw.js')
//     .then(reg => console.log("Service Worker registered", reg))
//     .catch(err => console.log("Service Worker NOT registered", err))
// }

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}