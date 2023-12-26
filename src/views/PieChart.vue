<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'; 
import PieChartPart from '../components/PieChartPart.vue';
import PieChartVector from '../components/PieChartVector.vue';
import TestBench from '../components/TestBench.vue';

const props = defineProps(['bets']);
const emit = defineEmits(['removeBet']);

const wheelElem = ref(null);
const pieParts = ref(null);
const settingsIsActive = ref(false);
const benchIsActive = ref(false);
const isRotating = ref(false);
const wheelPrevAngle = ref(0)
const wheelRotatedAngle = ref(0);
const spinTimer = ref(null);

const info = ref({
  active: false,
  type: null,
  item: {
    id: null,
    title: null,
    color: null,
    pct: null,
  }
});

const settings = ref(checkInLocalStorage('pieChartSettings', {
  type: 'standart',
  rpm: 10,
  time: 20000
}));

const isBlocked = computed(() => info.value.active || isRotating.value);

const settingsCSS = computed(() => settingsIsActive.value ? 'options options--active' : 'options');
const toggleBtnCSS = computed(() => settingsIsActive.value ? 'options__toggle-btn options__toggle-btn--active' : 'options__toggle-btn');
const ranges = computed(() => calcRanges(props.bets, settings.value.type));

watch(() => settings.value.type, () => localStorage.setItem('pieChartSettings', JSON.stringify(settings.value)));
watch(() => settings.value.time, () => localStorage.setItem('pieChartSettings', JSON.stringify(settings.value)));

onMounted(() => {
  if (props.bets.length < 2) showInfo('less');
});

onUnmounted(() => {
  clearTimeout(spinTimer.value);
});

onMounted(resizeWheel);
onMounted(() => window.addEventListener('resize', resizeWheel));
onUnmounted(() => window.removeEventListener('resize', resizeWheel));

function checkInLocalStorage(item, defaultValue) {
  const result = localStorage.getItem(item);
  return result ? JSON.parse(result) : defaultValue;
}

function calcRanges(bets, type) {
  let result = [];
  
  for (let i = 0; i < bets.length; i++) {
    const pct = type === 'standart' ? bets[i].pct : bets[i].pct_reverse;
    const angle = pct / 100 * 360;
    const min = i === 0 ? 0 : result[i - 1].max;
    const max = min + angle;
    
    result.push({ min: min, max: max });
  }

  return result;
}

function rotateWheel(timeInMS) {
  if (isRotating.value) return;

  isRotating.value = true;

  const angle = getRandom(1, 359);
  const transform = (angle + 360 * settings.value.rpm) * -1 + wheelRotatedAngle.value + wheelPrevAngle.value;

  wheelPrevAngle.value = angle;
  wheelRotatedAngle.value = (transform - wheelRotatedAngle.value) / settings.value.rpm > -360 ? transform - 360 : transform;
  
  pieParts.value.style.transitionDuration = timeInMS + 'ms';
  pieParts.value.style.transform = `rotate(${wheelRotatedAngle.value}deg)`;
  
  spinTimer.value = setTimeout(() => detectWinner(angle, ranges.value), timeInMS);

  function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function detectWinner(angle, dataArr) {
    isRotating.value = false;

    let result = null;
    
    for (let i = 0; i < dataArr.length; i++) {
      if (angle >= dataArr[i].min && angle <= dataArr[i].max) {
        result = i;
        break;
      }
    }

    switch (settings.value.type === 'standart') {
      case true:
        showInfo('winner', props.bets[result].id, props.bets[result].title, props.bets[result].color, props.bets[result].pct);
        break;
      default:
        if (props.bets.length === 2) {
          const targetID = result === 0 ? 1 : 0;
          showInfo('winner', props.bets[targetID].id, props.bets[targetID].title, props.bets[targetID].color, props.bets[targetID].pct);
          return;
        }
        showInfo('loser', props.bets[result].id, props.bets[result].title, props.bets[result].color, props.bets[result].pct_reverse);
    }
    
    // return props.bets[result].title;
  }
}

function showInfo(type, itemID = null, itemTitle = null, itemColor = null, itemPct = null) {
  info.value.active = true;
  info.value.type = type;
  info.value.item.id = itemID;
  info.value.item.title = itemTitle;
  info.value.item.color = itemColor;
  info.value.item.pct = itemPct;
}

function hideInfo() {
  info.value.active = false;
  info.value.type = null;
  info.value.item.id = null;
  info.value.item.title = null;
  info.value.item.color = null;
  info.value.item.pct = null;
}

function nextSpin() {
  emit('removeBet', info.value.item.id);
  hideInfo();
}

function resizeWheel() {
  wheelElem.value.style.minHeight = wheelElem.value.offsetWidth + 'px';
}

</script>

<template>
  <div class="pie-chart">

    <div v-if="!isBlocked" class="pie-chart__options" :class="settingsCSS">
      
      <h2 class="options__title">Тип аукціону</h2>
      <div class="options__item options__type">
        <input type="radio" name="piechart-type" id="type-standart" class="options__radio" value="standart" v-model="settings.type" :checked="settings.type === 'standart'">
        <label for="type-standart" class="options__label">Стандартний</label>
        <input type="radio" name="piechart-type" id="type-elimination" class="options__radio" value="elimination" v-model="settings.type" :checked="settings.type === 'elimination'">
        <label for="type-elimination" class="options__label">На вибуття</label>
      </div>

      <!-- <h2 class="options__title">Кількість обертів</h2>
      <div class="options__item options__rpm">
        <input type="radio" name="piechart-rpm" id="rpm-5" class="options__radio" :value="5" v-model="settings.rpm" :checked="settings.rpm === 5">
        <label for="rpm-5" class="options__label">5</label>
        <input type="radio" name="piechart-rpm" id="rpm-10" class="options__radio" :value="10" v-model="settings.rpm" :checked="settings.rpm === 10">
        <label for="rpm-10" class="options__label">10</label>
        <input type="radio" name="piechart-rpm" id="rpm-20" class="options__radio" :value="20" v-model="settings.rpm" :checked="settings.rpm === 20">
        <label for="rpm-20" class="options__label">20</label>
        <input type="radio" name="piechart-rpm" id="rpm-40" class="options__radio" :value="40" v-model="settings.rpm" :checked="settings.rpm === 40">
        <label for="rpm-40" class="options__label">40</label>
      </div> -->

      <!-- <h2 class="options__title">Час крутіння</h2> -->
      <h2 class="options__title">Швидкість колеса</h2>
      <div class="options__item options__time">
        <input type="radio" name="piechart-time" id="time-10" class="options__radio" :value="10000" v-model="settings.time" :checked="settings.time === 10000">
        <label for="time-10" class="options__label">Швидко</label>
        <input type="radio" name="piechart-time" id="time-20" class="options__radio" :value="20000" v-model="settings.time" :checked="settings.time === 20000">
        <label for="time-20" class="options__label">Звичайно</label>
        <input type="radio" name="piechart-time" id="time-30" class="options__radio" :value="40000" v-model="settings.time" :checked="settings.time === 40000">
        <label for="time-30" class="options__label">Повільно</label>
      </div>

      <h2 class="options__title">Тестовий стенд</h2>
      <div class="options__item options__testing">
        <button class="options__label options__label--btn" @click="benchIsActive = true">
          {{ settings.type === 'standart' ? 'Доказ роботи стандартного алгоритму' : 'Доказ роботи алгоритму "На вибуття"' }}
        </button>
      </div>

      <Transition name="bench">
        <TestBench
          v-if="benchIsActive"
          :type="settings.type"
          :bets="props.bets"
          :ranges="ranges"
          @close="benchIsActive = false"
        />
      </Transition>
    </div>

    <div ref="wheelElem" class="wheel">
      <div ref="pieParts" class="wheel__parts">
        <PieChartPart
          v-for="i in ranges.length"
          :aucType="settings.type"
          :bet="bets[i - 1]"
          :range="ranges[i - 1]"
        />
        <PieChartVector
          v-for="i in ranges.length"
          :range="ranges[i - 1]"
        />
      </div>
      
      <div :class="isBlocked ? 'wheel__pin wheel__pin--hidden' : 'wheel__pin'" @click="rotateWheel(settings.time)">
        <span class="material-symbols-outlined">sound_sampler</span>
      </div>
      
      <div class="wheel__pointer"></div>
      
      <Transition name="info">
        <div v-if="info.active" class="wheel__info">

          <h3 v-if="info.type === 'less'"><span class="material-symbols-outlined">error</span></h3>
          <h3 v-else-if="info.type === 'loser'"><span class="material-symbols-outlined">cancel</span></h3>
          <h3 v-else-if="info.type === 'winner'"><span class="material-symbols-outlined">rewarded_ads</span></h3>
          
          <p v-if="info.type === 'less'">Додайте щонайменше дві позіції до списку, щоб почати крутити колесо.</p>
          <p v-else-if="info.type === 'loser'">Вибуває: <span class="info__title-result" :style="{ backgroundColor: info.item.color }">{{ info.item.title }}</span><br><br>Шанс вибуття складав: <span style="color: red;">{{ info.item.pct }}%</span></p>
          <p v-else-if="info.type === 'winner'">Переможець: <span class="info__title-result" :style="{ backgroundColor: info.item.color }">{{ info.item.title }}</span><br><br>Шанс перемоги складав: <span style="color: lightgreen;">{{ info.item.pct }}%</span></p>
          
          <router-link v-if="info.type === 'less'" to="/bets">
            <button>До списку</button>
          </router-link>
          <button v-else-if="info.type === 'loser'" @click="nextSpin">Далі</button>
        </div>
      </Transition>
    </div>

    <Transition name="settings-btn">
      <button v-if="!isBlocked && !benchIsActive" :class="toggleBtnCSS" @click="settingsIsActive = !settingsIsActive">
        <span v-if="settingsIsActive" class="material-symbols-outlined">expand_less</span>
        <span v-else class="material-symbols-outlined">tune</span>
      </button>
    </Transition>

  </div>
</template>

<style scoped>
.pie-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow: auto;
}

.pie-chart::before {
  content: '';
  margin-top: auto;
}

.pie-chart::after {
  content: '';
  margin-bottom: auto;
}

.pie-chart__options {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10px 10px 85px 10px;
  transition: all 380ms ease-in-out;
  background-color: rgba(211, 211, 211, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: auto;
  z-index: 9998;
}

.options {
  display: flex;
  flex-direction: column;
  transform: translateY(-100%);
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.3);
}

.options::before {
  content: '';
  margin-top: auto;
}

.options::after {
  content: '';
  margin-bottom: auto;
}

.options--active {
  transform: translateY(0%);
}

.options__title {
  margin: 0;
  margin-top: 35px;
  margin-bottom: 10px;
  font-size: 18px;
  text-align: center;
  text-transform: uppercase;
}

.options__title:first-of-type {
  margin-top: 0px;
}

.options__item {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 600px;
  height: 40px;
  margin: 0 auto;
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 10px;
  box-shadow: inset 1px 1px 5px 0px rgba(0, 0, 0, 0.4);
  /* overflow: hidden; */
}

.options__type .options__label {
  flex: 0 0 50%;
}

.options__rpm .options__label {
  flex: 0 0 25%;
}

.options__time .options__label {
  flex: 1 1 100%;
}

.options__testing {
  justify-content: center;
  background-color: transparent;
  box-shadow: none;
}

.options__radio {
  position: absolute;
  top: 0;
  left: -10000%;
  transform: translate(-100%, -100%);
}

.options__label {
  display: flex;
  align-items: center;
  justify-content: center;
  /* flex: 0 0 50%; */
  font-weight: bold;
  border-radius: 10px;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0);
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.options__label--btn {
  background-color: orange;
  box-shadow: 1px 1px 5px 0px black;
}

.options__label--btn:hover {
  color: orange;
  background-color: black;
}

.options__radio:checked + .options__label {
  background-color: white;
  box-shadow: 1px 1px 5px 0px black;
}

.options__toggle-btn {
  position: fixed;
  top: 15px;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 0;
  border-radius: 50%;
  box-shadow: 1px 1px 5px 0px black;
  transition: all 480ms ease-in-out;
  cursor: pointer;
  transform: translate(-50%, 0px);
  z-index: 9998;
}

.options__toggle-btn > span {
  font-size: 35px;
}

.options__toggle-btn--active {
  top: 100%;
  transform: translate(-50%, -75px);
}

.wheel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 85px auto;
  border-radius: 50%;
  box-shadow: 1px 1px 10px 0px black;
  overflow: hidden;
}

.wheel__parts {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 1s cubic-bezier(0.135, 0.000, 0.000, 1.000);
}

.wheel__pin {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 0px 5px 0px black;
  transform: translate(-50%, -50%);
  transition: all 380ms ease-in-out;
  cursor: pointer;
  z-index: 1004;
}

.wheel__pin--hidden {
  color: white;
  transform: translate(-50%, -50%) scale(0.2);
  cursor: unset;
}

.wheel__pin:not(.wheel__pin--hidden):hover {
  transform: translate(-50%, -50%) scale(1.1) rotate(-360deg);
}

.wheel__pin > span {
  font-size: 76px;
}

.wheel__pointer {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 50px;
  height: 50px;
  background-color: white;
  box-shadow: 1px 1px 10px 0px black;
  transform: translate(-50%, -50%) rotate(45deg);
  z-index: 1004;
}

.wheel__info {
  position: absolute;
  top: 50%;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 50%;
  /* backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px); */
  box-shadow: inset 0px 0px 60px 0px white;
  transform: translateY(-50%);
  z-index: 1004;
}

.wheel__info > h3 {
  margin: 0;
}

.wheel__info > h3 > span {
  font-size: 70px;
}

.wheel__info > p {
  margin: 30px 5px;
  font-size: 20px;
}

.wheel__info button {
  padding: 10px 15px;
  font-size: 20px;
  text-transform: uppercase;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.info__title-result {
  padding: 4px 6px;
  color: white;
  text-transform: uppercase;
  border-radius: 5px;
  text-shadow: 1px 1px 4px black;
}

.info-enter-active,
.info-leave-active {
  transition: all 380ms ease-in-out;
}

.info-enter-from,
.info-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(1.5);
}

.info-enter-active {
  transition-delay: 500ms;
}

.settings-btn-enter-active,
.settings-btn-leave-active {
  transition: all 0.5s ease;
}

.settings-btn-enter-from,
.settings-btn-leave-to {
  transform: translate(-50%, 0px) scale(0);
}

.bench-enter-active,
.bench-leave-active {
  overflow: hidden;
  transition: all 380ms ease-in-out;
}

.bench-enter-from,
.bench-leave-to {
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.0);
}
</style>