<script setup>
import { computed } from 'vue';

const props = defineProps(['timeInSec', 'isPaused', 'isFinished']);
const emit = defineEmits(['addTime', 'removeTime', 'startTimer', 'resetTimer'])

const fullMinutes = computed(() => Math.floor(props.timeInSec / 60));
const fullSeconds = computed(() =>  Math.floor(props.timeInSec - fullMinutes.value * 60));
</script>

<template>
  <div class="mini-timer">
    <div v-if="props.isFinished && props.timeInSec === 0" class="mini-timer__body mini-timer__body--finished">
      <div class="mini-timer__item">час вичерпано</div>
    </div>
    
    <div
      v-else
      class="mini-timer__body"
      :class="props.isPaused ? 'mini-timer__body--paused' : ''"
    >
      <div class="mini-timer__item">{{ fullMinutes > 9 ? fullMinutes : "0" + fullMinutes}}</div>
      <div class="mini-timer__item">:</div>
      <div class="mini-timer__item">{{ fullSeconds > 9 ? fullSeconds : "0" + fullSeconds }}</div>
    </div>

    <div class="mini-timer__btns-container">
      <button class="mini-timer__btn" @click="$emit('resetTimer')">
        <span v-if="props.isFinished" class="material-symbols-outlined">close</span>
        <span v-else class="material-symbols-outlined">stop</span>
      </button>
      <button
        :class="props.isPaused || (props.isFinished && props.timeInSec > 0) ? 'mini-timer__btn mini-timer__btn--paused' : 'mini-timer__btn'"
        :disabled="props.isFinished && props.timeInSec === 0"
        @click="$emit('startTimer')"
      >
        <span v-if="props.isPaused || (props.isFinished && props.timeInSec > 0)" class="material-symbols-outlined">play_arrow</span>
        <span v-else class="material-symbols-outlined">pause</span>
      </button>
      <!-- <button class="mini-timer__btn" @click="$emit('removeTime', 60, true)">-</button> -->
      <button class="mini-timer__btn" @click="$emit('addTime', 60, true)">+</button>
    </div>

  </div>
</template>

<style scoped>
.mini-timer {
  position: absolute;
  width: 100%;
  height: 50px;
  z-index: 9999;
}

.mini-timer__body {
  display: flex;
  justify-content: center;
  width: 150px;
  height: 100%;
  margin: 0 auto;
  padding-bottom: 5px;
  color: red;
  background-color: black;
  border-radius: 0% 0% 20px 20px;
  box-shadow: 1px 1px 4px 0px black;
  transition: color 150ms ease-in-out;
  overflow: hidden;
}

.mini-timer__body--paused {
  color: rgba(255, 0, 0, 0.3);
}

.mini-timer__body--finished {
  color: white;
}

.mini-timer__item {
  display: flex;
  align-items: center;
  font-size: 40px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 2px 2px 6px red;
}

.mini-timer__body--finished > .mini-timer__item {
  font-size: 18px;
}

.mini-timer__btns-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 30px;
  margin: 0 auto;
  transform: translateY(-15px);
  overflow: hidden;
}

.mini-timer__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: 0 4px;
  padding: 0;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 50%;
  background-color: black;
  box-shadow: 1px 1px 4px 0px black;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.mini-timer__btn:disabled {
  color: black;
  transform: translateY(-130%);
}

.mini-timer__btn:not(:disabled):hover {
  transform: scale(1.3);
  box-shadow: 0px 0px 4px 0px red;
}

.mini-timer__btn--paused {
  color: red;
  box-shadow: 0px 0px 4px 0px red;
  transform: scale(1.2);
}

.mini-timer__btn > span {
  font-size: inherit;
}
</style>