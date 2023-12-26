<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps(['timerIsActive', 'timerIsPaused', 'timeInSec']);
const emit = defineEmits(['addTime', 'removeTime', 'startTimer', 'resetTimer']);

const timerElem = ref(null);
const handElem = ref(null);
const secondHandElem = ref(null);
const isReseting = ref(false);

const fullHours = computed(() => Math.floor(props.timeInSec / 3600));
const fullMinutes = computed(() => Math.floor(props.timeInSec / 60));
const fullSeconds = computed(() => Math.floor(props.timeInSec - fullMinutes.value * 60));

watch(() => props.timeInSec, placeHands);

onMounted(placeHands);
onMounted(resizeClock);
onMounted(() => window.addEventListener('resize', resizeClock));
onUnmounted(() => window.removeEventListener('resize', resizeClock));

function placeHands() {
  handElem.value.style.transform = `translateY(-50%) rotate(${ -90 + props.timeInSec * 0.1 }deg)`;
  secondHandElem.value.style.transform = `translateY(-50%) rotate(${ 270 + ((360 * fullMinutes.value) + (6 * fullSeconds.value)) }deg)`;
}

function reset() {
  handElem.value.style.transform = `translateY(-50%) rotate(${ -90 + props.timeInSec * 0.1 - (props.timeInSec * 0.1 - 360 * fullHours.value) }deg)`;
  secondHandElem.value.style.transform = `translateY(-50%) rotate(${270 + ((360 * fullMinutes.value) + (6 * fullSeconds.value)) + ((60 - fullSeconds.value) * 6) }deg)`;

  isReseting.value = true;
  
  setTimeout(() => {
    isReseting.value = false;
    
    setTimeout(() => {
      handElem.value.classList.remove('timer__hand--animated');
      setTimeout(() => handElem.value.classList.add('timer__hand--animated'));
    }, 0);
    
  }, 380);

  emit('resetTimer', 380);
}

function resizeClock() {
  switch (document.documentElement.clientWidth > timerElem.value.offsetWidth + 70) {
    case true:
      timerElem.value.style.width = 'unset';
      timerElem.value.style.height = '100%';
      break;
    default:
      timerElem.value.style.width = '100%';
      timerElem.value.style.height = 'unset';
  }
} 
</script>

<template>
  <div class="wrapper">
    <div class="paddings">
      <div ref="timerElem" class="timer">

        <div class="timer__btn timer__btn--left-1min" :class="props.timeInSec === 0 || props.timerIsActive ? 'timer__btn--disabled' : ''" @click="$emit('removeTime', 60)">
          <div class="btn__leg"></div>
          <div class="btn__head"><span>- 1 хв.</span></div>
        </div>

        <div class="timer__btn timer__btn--left-5min" :class="props.timeInSec === 0 || props.timerIsActive ? 'timer__btn--disabled' : ''" @click="$emit('removeTime', 300)">
          <div class="btn__leg"></div>
          <div class="btn__head"><span>- 5 хв.</span></div>
        </div>

        <div class="timer__btn timer__btn--top" :class="props.timeInSec === 0 ? 'timer__btn--disabled' : ''" @click="$emit('startTimer')">
          <div class="btn__leg"></div>
          <div class="btn__head">
            <span v-if="(props.timerIsActive && props.timerIsPaused) || !props.timerIsActive" class="material-symbols-outlined">play_arrow</span>
            <span v-else-if="props.timerIsActive && !props.timerIsPaused" class="material-symbols-outlined">pause</span>
          </div>
        </div>

        <div class="timer__btn timer__btn--right-1min" @click="$emit('addTime', 60, true)">
          <div class="btn__leg"></div>
          <div class="btn__head"><span>+ 1 хв.</span></div>
        </div>

        <div class="timer__btn timer__btn--right-5min" :class="props.timerIsActive ? 'timer__btn--disabled' : ''" @click="$emit('addTime', 300)">
          <div class="btn__leg"></div>
          <div class="btn__head"><span>+ 5 хв.</span></div>
        </div>

        <div class="timer__face">
          <div v-for="n in 60" class="timer__serif">
            <div :class="(n - 1) % 5  === 0 ? 'serif serif--minute' : 'serif'" :style="{ transform: `rotate(${-90 + (n - 1) * 6}deg)` }">
              <span class="serif__number" :style="{ transform: `rotate(${(-90 + (n - 1) * 6) * -1}deg)` }">{{ (n - 1) + fullHours * 60 }}</span>
            </div>
          </div>

          <div class="timer__digital-block">
            <div class="digital-block__item">{{ fullMinutes > 9 ? fullMinutes : "0" + fullMinutes}}</div>
            <div class="digital-block__item">{{ fullSeconds > 9 ? fullSeconds : "0" + fullSeconds }}</div>
          </div>

          <div ref="secondHandElem" :class="props.timerIsActive || isReseting ? 'timer__hand timer__hand--second timer__hand--animated' : 'timer__hand timer__hand--second'"></div>

          <div ref="handElem" :class="!props.timerIsActive || isReseting ? 'timer__hand timer__hand--animated' : 'timer__hand'">
            <div class="hand__arrow"></div>
          </div>

          
        </div>

        <div :class="props.timerIsActive ? 'timer__pin timer__pin--active' : 'timer__pin'" @click="reset">
          <span class="material-symbols-outlined">stop_circle</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.wrapper::before {
  content: '';
  width: 100%;
  margin-top: auto;
}

.wrapper::after {
  content: '';
  width: 100%;
  margin-bottom: auto;
}

.paddings {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 600px;
  min-height: 600px;
  padding: 65px 35px 80px 35px;
}

.timer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* height: 100%; */
  border-radius: 50%;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  /* margin-top: 80px; */
}

.timer__btn {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  align-items: center;
  width: 50%;
  height: 10px;
  background-color: rgb(160, 0, 0);
  transform-origin: center right;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.timer__btn--disabled {
  opacity: 0.5;
}

.timer__btn--left-1min {
  transform: translateY(-50%) rotate(65deg) translateX(-5px);
}

.timer__btn--left-1min:active {
  transform: translateY(-50%) rotate(65deg) translateX(0px);
}

.timer__btn--left-1min.timer__btn--disabled {
  transform: translateY(-50%) rotate(65deg) translateX(15px);
}

.timer__btn--left-5min {
  transform: translateY(-50%) rotate(35deg) translateX(-5px);
}

.timer__btn--left-5min:active {
  transform: translateY(-50%) rotate(35deg) translateX(0px);
}

.timer__btn--left-5min.timer__btn--disabled {
  transform: translateY(-50%) rotate(35deg) translateX(15px);
}

.timer__btn--top {
  transform: translateY(-50%) rotate(90deg) translateX(-5px);
}

.timer__btn--top:active {
  transform: translateY(-50%) rotate(90deg) translateX(0px);
}

.timer__btn--top.timer__btn--disabled {
  transform: translateY(-50%) rotate(90deg) translateX(15px);
}

.timer__btn--right-1min {
  transform: translateY(-50%) rotate(115deg) translateX(-5px);
}

.timer__btn--right-1min:active {
  transform: translateY(-50%) rotate(115deg) translateX(0px);
}

.timer__btn--right-1min.timer__btn--disabled {
  transform: translateY(-50%) rotate(115deg) translateX(15px);
}

.timer__btn--right-5min {
  transform: translateY(-50%) rotate(145deg) translateX(-5px);
}

.timer__btn--right-5min:active {
  transform: translateY(-50%) rotate(145deg) translateX(0px);
}

.timer__btn--right-5min.timer__btn--disabled {
  transform: translateY(-50%) rotate(145deg) translateX(15px);
}

.btn__leg {
  width: 10px;
  height: 20px;
  background-color: grey;
  transform: translateX(-10px);
}

.btn__head {
  position: relative;
  width: 30px;
  height: 80px;
  background-color: white;
  border-radius: 5px;
  transform: translateX(-50px);
  box-shadow: 1px 1px 5px 0px black;
}

.btn__head > span {
  position: absolute;
  top: 50%;
  display: block;
  width: 80px;
  font-size: 25px;
  text-align: center;
  transform: translate(-32%, -50%) rotate(-90deg);
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.5);
}

.timer__btn--top > .btn__head {
  width: 45px;
  height: 45px;
  transform: translateX(-65px);
}

.timer__btn--top > .btn__head > span {
  font-size: 45px;
  transform: translate(-22%, -48%) rotate(-90deg);
}

.timer__face {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid white;
  border-radius: 50%;
  background-color: white;
  box-shadow: inset 0px 0px 20px 0px black;
  overflow: hidden;
}

.timer__hand {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  width: 43%;
  height: 4px;
  border-radius: 5px;
  background-color: black;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: center left;
  box-shadow: 0px 0px 5px 0px white;
}

.timer__hand--animated {
  transition: transform 380ms ease-in-out;
}

.timer__hand--second {
  height: 2px;
  background-color: rgb(160, 0, 0);
}

.hand__arrow {
  width: 0;
  height: 0;
  margin-left: auto;
  border-style: solid;
  border-width: 10px 0 10px 20px;
  border-color: transparent transparent transparent #007bff;
  /* transform: translateY(-50%); */
}

.timer__digital-block {
  position: absolute;
  top: 50%;
  display: flex;
  justify-content: center;
  width: 100%;
  transform: translateY(-50%);
}

.digital-block__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 40px;
  margin: 0px 5%;
  color: white;
  font-size: 40px;
  border: 1px solid white;
  background-color: black;
  border-radius: 5px;
  box-shadow: inset 0px 0px 10px 0px red,
              1px 1px 4px 0px black;
}

.digital-block__item::after {
  content: 'хвилини';
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  color: black;
  font-size: 20px;
  transform: translateY(-100%);
  opacity: 0.7;
}

.digital-block__item:last-of-type::after {
  content: 'секунди';
  top: 100%;
  text-align: right;
  transform: translateY(0%);
}

.timer__pin {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  color: transparent;
  border-radius: 50%;
  background-color: lightgray;
  box-shadow: 1px 1px 5px 0px black;
  transform: translate(-50%, -50%);
  transition: all 380ms ease-in-out;
  overflow: hidden;
}

.timer__pin--active {
  color: black;
  transform: translate(-50%, -50%) scale(2);
  cursor: pointer;
}

.timer__pin > span {
  font-size: 26px;
}

.timer__serif {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 0px;
}

.timer__serif > .serif {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 0px;
  transform-origin: center left;
  background-color: red;
}

.serif::after {
  content: '';
  display: block;
  width: 5%;
  height: 2px;
  margin-left: 10px;
  margin-right: 10px;
  background-color: black;
  border-radius: 5px;
}

.serif--minute::after {
  width: 10%;
  height: 4px;
  background-color: red;
}

.serif__number {
  margin-left: auto;
  font-size: 20px;
}

.serif .serif__number {
  color: transparent;
}

.serif--minute .serif__number {
  color: black;
}
</style>