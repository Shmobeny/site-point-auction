<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import NavBar from './components/NavBar.vue';
import MiniTimer from './components/MiniTimer.vue';

const overall = ref(checkInLocalStorage('overall', 0));

const bets = ref(checkInLocalStorage('bets', [])
  // [
  //   {
  //     id: 1699442864537 + 1,
  //     title: 'doom (2016)',
  //     color: getRandomColor(),
  //     value: 200,
  //     pct: 33.33,
  //   },
  //   {
  //     id: 1699442864537 + 2,
  //     title: 'dusk',
  //     color: getRandomColor(),
  //     value: 100,
  //     pct: 16.67,
  //   },
  //   {
  //     id: 1699442864537 + 3,
  //     title: 'quake 4',
  //     color: getRandomColor(),
  //     value: 300,
  //     pct: 50,
  //   }
  // ]
);

const trashcan = ref(checkInLocalStorage('trashcan', [])
  // [
  //   {
  //     id: 1699442864537 + 4,
  //     title: 'barbie',
  //     color: getRandomColor(),
  //     value: 950,
  //   },
  //   {
  //     id: 1699442864537 + 5,
  //     title: 'Bone Town',
  //     color: getRandomColor(),
  //     value: 14,
  //   }
  // ]
);

// const betsIDs = ref([1699442864537 + 1, 1699442864537 + 2, 1699442864537 + 3]);
const betsIDs = ref(checkInLocalStorage('betsIDs', []));

// const trashcanIDs = ref([1699442864537 + 4, 1699442864537 + 5]);
const trashcanIDs = ref(checkInLocalStorage('trashcanIDs', []));

const timer = ref(checkInLocalStorage('timer', {
  active: false,
  paused: false,
  finished: false,
  showMini: false,
  id: null,
  timeInSec: 0,
  deadline: null,
}));

const miniTimerIsActive = computed(() => (timer.value.active || timer.value.finished) && timer.value.showMini);

watch(() => bets.value.length, updatePcts, { immediate: true });
watch(() => bets.value.length, updateBetsInLocalStorage);
watch(() => trashcan.value.length, updateTrashcanInLocalStorage);

watch(overall, () => {
  localStorage.setItem('overall', overall.value);
});

onMounted(() => { if (timer.value.active === true && timer.value.paused === false) runInterval() });

function addBet(title, value, color = false) {
  value = value < 1 ? 1 : value;

  overall.value += value;
  
  let newItem = {
    id: Date.now(),
    title: title.toLowerCase(),
    color: color === false ? getRandomColor() : color,
    value: value,
    pct: 0,
    pct_reverse: 0, 
  }

  bets.value.push(newItem);
  betsIDs.value.push(newItem.id);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function removeBet(id) {
  const targetIndex = findIndex(id);
  overall.value -= bets.value[targetIndex].value;
  addToTrashcan({...bets.value[targetIndex]});
  bets.value.splice(targetIndex, 1);
  betsIDs.value.splice(targetIndex, 1);
}

function editBet(id, title, value) {
  const targetIndex = findIndex(id);

  const initialTitle = bets.value[targetIndex].title;
  const initialValue = bets.value[targetIndex].value;

  if (initialTitle !== title && title.length > 0) {
    console.log("title changed");
    bets.value[targetIndex].title = title;
    updateBetsInLocalStorage();
  }

  if (initialValue !== value * 1 && value * 1 >= 1) {
    console.log("value changed");
    bets.value[targetIndex].value = value * 1;
    overall.value -= (initialValue - value * 1);
    updatePcts();
    updateBetsInLocalStorage();
  }
}

function addToValue(id, value) {
  const targetIndex = findIndex(id);
  value = bets.value[targetIndex].value + value * 1 < 0 ? bets.value[targetIndex].value * -1 + 1 : value * 1;
  bets.value[targetIndex].value += value;
  overall.value += value;
  updatePcts();
  updateBetsInLocalStorage();
}

function addToTrashcan(obj) {
  trashcan.value.push(obj);
  trashcanIDs.value.push(obj.id);
}

function restoreFromTrashcan(obj) {

  if (obj === 'all') {
    for (let item of trashcan.value) {
      overall.value += item.value;
      bets.value.push(item);
      betsIDs.value.push(item.id);
    }
    setTimeout(() => removeFromTrashcan('all'), 380);
  } else {
    overall.value += obj.value;
    bets.value.push(obj);
    betsIDs.value.push(obj.id);
    removeFromTrashcan(obj.id);
  }

}

function removeFromTrashcan(id) {
  if (id === 'all') {
    trashcan.value = [];
    trashcanIDs.value = [];
    return;
  }

  const targetIndex = findIndex(id, true);
  console.log(targetIndex);
  trashcan.value.splice(targetIndex, 1);
  trashcanIDs.value.splice(targetIndex, 1);
}

function updatePcts() {
  bets.value.forEach(item => item.pct = (item.value / overall.value * 100).toFixed(3));
  bets.value.forEach(item => item.pct_reverse = ((100 - item.pct) / (bets.value.length - 1)).toFixed(3));
  
  // updateReversePcts();
}

function updateReversePcts() {
  // let pcts = [];
  
  // bets.value.forEach((item, index) => {
  //   pcts.push({index: index, pct: item.pct * 1});
  // });

  // const pctsMinMax = [...pcts].sort((a, b) => {
  //   if (a.pct > b.pct) return 1;
  //   if (a.pct == b.pct) return 0;
  //   if (a.pct < b.pct) return -1;
  // });

  // const pctsMaxMin = [...pctsMinMax].reverse();

  // pctsMinMax.forEach((item, index) => bets.value[item.index].pct_reverse = pctsMaxMin[index].pct.toFixed(2));

  bets.value.forEach(item => item.pct_reverse = ((100 - item.pct) / (bets.value.length - 1)).toFixed(2));
}

function findIndex(id, lookInsideTrashcan = false) {
  const target = lookInsideTrashcan ? trashcanIDs.value : betsIDs.value;
  return target.indexOf(id);
}

function addTime(sec, forced = false) {
  
  if (timer.value.active && forced === false) return;
  if (timer.value.active) timer.value.deadline += sec * 1000;

  timer.value.timeInSec = timer.value.timeInSec + sec;

  updateTimerInLocalStorage();
}

function removeTime(sec) {
  if (timer.value.timeInSec === 0 || timer.value.active) return;
  const newTime = timer.value.timeInSec - sec;
  timer.value.timeInSec = newTime < 0 ? 0 : newTime;

  updateTimerInLocalStorage();
}

function startTimer() {
  if (timer.value.timeInSec === 0) return;

  if (timer.value.paused && timer.value.active) {
    timer.value.paused = false;
  } else if (!timer.value.paused && timer.value.active) {
    timer.value.paused = true;
    clearInterval(timer.value.id);
    updateTimerInLocalStorage();
    return;
  }

  timer.value.active = true;
  timer.value.finished = false;
  timer.value.deadline = Date.now() + timer.value.timeInSec * 1000;

  runInterval();
}

function runInterval() {
  timer.value.id = setInterval(() => {
    const currentTime = Date.now();
    const diffInMs = timer.value.deadline - currentTime;
    
    if (diffInMs <= 0) {
      clearInterval(timer.value.id);
      timer.value.active = false;
      timer.value.finished = true;
      timer.value.timeInSec = 0;
      updateTimerInLocalStorage();
      return;
    } 
    
    timer.value.timeInSec = diffInMs / 1000;

    updateTimerInLocalStorage();
  }, 100);
}

function showMiniTimer() {
  if (timer.value.active === false) return;
  timer.value.showMini = true;
  updateTimerInLocalStorage();
}

function hideMiniTimer() {
  if (timer.value.active === false) return;
  timer.value.showMini = false;
  updateTimerInLocalStorage();
}

function resetTimer(delay = false) {
  // if (!timer.value.active) return;

  clearInterval(timer.value.id);

  if (delay) {
    setTimeout(resetValues, delay);
  } else {
    resetValues();
  }

  function resetValues() {
    timer.value.active = false;
    timer.value.paused = false;
    timer.value.finished = false;
    timer.value.showMini = false;
    timer.value.timeInSec = 0;
    timer.value.deadline = null;

    updateTimerInLocalStorage();
  }
}

function updateBetsInLocalStorage() {
  localStorage.setItem('bets', JSON.stringify(bets.value));
  localStorage.setItem('betsIDs', JSON.stringify(betsIDs.value));
}

function updateTrashcanInLocalStorage() {
  localStorage.setItem('trashcan', JSON.stringify(trashcan.value));
  localStorage.setItem('trashcanIDs', JSON.stringify(trashcanIDs.value));
}

function updateTimerInLocalStorage() {
  localStorage.setItem('timer', JSON.stringify(timer.value));
}

function checkInLocalStorage(item, defaultValue) {
  const result = localStorage.getItem(item);
  return result ? JSON.parse(result) : defaultValue;
}
</script>

<template>
  <Transition name="mini-timer">
    <MiniTimer
      v-if="miniTimerIsActive"
      :timeInSec="timer.timeInSec"
      :isPaused="timer.paused"
      :isFinished="timer.finished"
      @addTime="addTime"
      @removeTime="removeTime"
      @startTimer="startTimer"
      @resetTimer="resetTimer"
    />
  </Transition>

  <router-view
    v-slot="{ Component, route }"
    :bets="bets"
    :betsIDs="betsIDs"
    :trashcan="trashcan"
    :removeBet="removeBet"
    :editBet="editBet"
    :addToValue="addToValue"
    :restoreFromTrashcan="restoreFromTrashcan"
    :removeFromTrashcan="removeFromTrashcan"
    :timerIsActive="timer.active"
    :timerIsPaused="timer.paused"
    :timeInSec="timer.timeInSec"
    :miniTimerIsActive="miniTimerIsActive"
    @addBet="addBet"
    @removeBet="removeBet"
    @findIndex="findIndex"
    @addTime="addTime"
    @removeTime="removeTime"
    @startTimer="startTimer"
    @resetTimer="resetTimer"
    @showMiniTimer="showMiniTimer"
    @hideMiniTimer="hideMiniTimer"
  >
    <transition :name="route.meta.transition" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  
  <NavBar />
</template>

<style scoped>
.mini-timer-enter-active,
.mini-timer-leave-active {
  transition: transform 380ms ease-in-out;
}

.mini-timer-enter-from,
.mini-timer-leave-to {
  transform: translateY(-110%);
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 200ms ease-in-out;
}

.slide-right-enter-from,
.slide-right-leave-to,
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
}

.slide-right-enter-from,
.slide-left-leave-to {
  transform: scale(1.2);
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: scale(0.0);
}
</style>