import { createRouter, createWebHistory } from 'vue-router';
import Bets from './views/Bets.vue';
import PieChart from './views/PieChart.vue';
import Timer from './views/Timer.vue';

const pages = ['/', '/bets', '/piechart', '/timer'];

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Bets,
      props: true,
      beforeEnter: detectSlideAnimation,
    },
    {
      path: '/bets',
      component: Bets,
      props: true,
      beforeEnter: detectSlideAnimation,
    },
    {
      path: '/piechart',
      component: PieChart,
      beforeEnter: detectSlideAnimation,
    },
    {
      path: '/timer',
      component: Timer,
      beforeEnter: detectSlideAnimation,
    }
  ],
});

function detectSlideAnimation(to, from) { 

  const fromPage = pages.indexOf(from.path);
  const toPage = pages.indexOf(to.path);

  switch (true) {
    case toPage < fromPage:
      from.meta.transition = 'slide-left';
      to.meta.transition = 'slide-right';
      break;

    case toPage > fromPage:
      from.meta.transition = 'slide-right';
      to.meta.transition = 'slide-left';
      break;

    case (toPage === fromPage) && (fromPage === 0):
      console.log('main page');
      break;
  
    default:
      console.log('no animate');
      break;
  } 
}