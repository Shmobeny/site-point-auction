<script setup>
import { ref, computed, onMounted } from 'vue';

const isActive = ref(false);
const navCSSClass = computed(() => isActive.value ? 'nav nav--active' : 'nav');

onMounted(() => setTimeout(() => { isActive.value = true; }, 1000));
</script>

<template>

  <nav id="navBar" :class="navCSSClass">
    <router-link to="/bets" class="nav_item">
      <button class="nav__btn"><span class="material-symbols-outlined">format_list_bulleted</span></button>
    </router-link>

    <router-link to="/piechart" class="nav_item">
      <button class="nav__btn"><span class="material-symbols-outlined">pie_chart</span></button>
    </router-link>

    <router-link to="/timer" class="nav_item">
      <button class="nav__btn"><span class="material-symbols-outlined">timer</span></button>
    </router-link>

    <button class="nav__btn nav__btn--close" @click="isActive = !isActive">
      <span v-if="isActive" class="material-symbols-outlined">close</span>
      <span v-else class="material-symbols-outlined">menu</span>
    </button>
  </nav>
  
</template>

<style scoped>
.nav {
  position: absolute;
  top: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
  /* height: 50px; */
  /* border-radius: 0px 25px 25px 0px; */
  background: rgb(0,0,0);
  background: linear-gradient(0deg, grey 0%, rgba(255,255,255,0) 100%);
  transition: transform 300ms ease-in-out;
  z-index: 9997;
}

.nav--active {
  transform: translateY(-100%);
}

.nav_item {
  height: 100%;
  padding: 15px 10px;
  /* background-color: red; */
  transform: translateY(100%);
  transition: all 300ms ease-in-out;
}

.nav--active > .nav_item {
  transform: translateY(0%);
}

.nav--active > .nav_item:first-of-type {
  transform: translateY(-10px);
  transition-delay: 300ms;
}

.nav--active > .nav_item:first-of-type span {
  color: rgb(150, 0, 150);
}

.nav--active > .nav_item:first-of-type:hover .nav__btn {
  background-color: rgb(150, 0, 150);
}

.nav--active > .nav_item:nth-of-type(2) {
  transition-delay: 400ms;
}

.nav--active > .nav_item:nth-of-type(2) span {
  color: rgb(0, 0, 150);
}

.nav--active > .nav_item:nth-of-type(2):hover .nav__btn {
  background-color: rgb(0, 0, 150);
}

.nav--active > .nav_item:nth-of-type(3) {
  transform: translateY(-10px);
  transition-delay: 500ms;
}

.nav--active > .nav_item:nth-of-type(3) span {
  color: rgb(187, 121, 0);
}

.nav--active > .nav_item:nth-of-type(3):hover .nav__btn {
  background-color: rgb(187, 121, 0);
}

.nav--active > .nav_item:hover span {
  color: white;
}

.nav__btn {
  width: 60px;
  height: 60px;
  border: 0;
  border-radius: 50%;
  box-shadow: 1px 1px 5px 0px black;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.nav__btn:not(.nav__btn.nav__btn--close):hover {
  transform: translateY(-5px);
}

.nav__btn > span {
  display: block;
  font-size: 35px;
  transform: translate(-0.1px, 0.4px);
  transition: all 150ms ease-in-out;
}

.nav__btn--close {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translate(-50%, -100%);
}

.nav--active > .nav__btn--close {
  transform: translate(-50%, -100%) scale(.75);
}

.nav__btn--close:hover {
  transform: translate(-50%, -100%) scale(1);
}
</style>
