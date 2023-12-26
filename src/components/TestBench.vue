<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['type', 'bets', 'ranges']);
const emit = defineEmits(['close']);

const iterations = ref(10000);
const isColdStart = ref(true);
const isCalculating = ref(false);
const progress = ref(0);
const data = makeData();

const bets_fake = ref(copyBets());
const overall_fake = computed(() => getFakeOverall(bets_fake.value));
const ranges_fake = computed(() => calcFakeRanges(bets_fake.value));

function makeData() {
  const result = ref([]);
  
  for (let i = 0; i < props.bets.length; i++) {
    result.value.push({
      title: props.bets[i].title,
      ranges: props.ranges[i],
      pct: props.bets[i].pct,
      pct_fact: null,
      diff: null,
      wins: 0,
    });
  }

  return result;
}

function copyBets() {
  let result = [];

  props.bets.forEach(item => result.push({...item}));
  result.forEach((item, index) => item.id = index);

  return result;
}

async function runTest() {
  
  if (isColdStart.value) {
    isColdStart.value = false;
  } else {
    resetTest();
  }

  let currentIteration = 1;
  let chunk = 0;
  const chunkSize = 100;
  const isElimination = props.type === 'standart' ? false : true;

  isCalculating.value = true;

  for (let i = 0; i < iterations.value; i++ ) {
    if (chunk === chunkSize) {
      await slowItFor(10);
      chunk = 0;
    }

    chunk++;
    detectWinner(isElimination);
    progress.value = currentIteration / iterations.value * 100;

    switch (currentIteration === iterations.value) {
      case true:
        setTimeout(() => isCalculating.value = false, 100);
        break;
      default:
        currentIteration++;
    }
  }
}

function resetTest() {
  bets_fake.value = copyBets();

  data.value.forEach(item => {
    item.wins = 0;
    item.pct_fact = null;
    item.diff = null;
  })
}

function detectWinner(isElimination = false) {

  switch (isElimination) {
    case true:
      const spins = bets_fake.value.length - 1;
      
      for (let j = 0; j < spins; j++) {
        let angle = getRandomAngle();
        
        for (let i = 0; i < bets_fake.value.length; i++) {
          if (angle >= ranges_fake.value[i].min && angle <= ranges_fake.value[i].max) {
            bets_fake.value.splice(i, 1);
            updateFakePcts();
            break;
          }
        }
      }

      const winnerID = bets_fake.value[0].id;

      data.value[winnerID].wins = data.value[winnerID].wins + 1;
      data.value[winnerID].pct_fact = (data.value[winnerID].wins / iterations.value * 100).toFixed(3);
      data.value[winnerID].diff = (data.value[winnerID].pct_fact - data.value[winnerID].pct).toFixed(3);

      bets_fake.value = copyBets();

      break;
    default:
      let angle = getRandomAngle();
      
      for (let i = 0; i < data.value.length; i++) {
        if (angle >= data.value[i].ranges.min && angle <= data.value[i].ranges.max) {
          data.value[i].wins = data.value[i].wins + 1;
          data.value[i].pct_fact = (data.value[i].wins / iterations.value * 100).toFixed(3);
          data.value[i].diff = (data.value[i].pct_fact - data.value[i].pct).toFixed(3);
          break;
        }
      }
  }
}

function getRandomAngle() {
  const result = getRandom(0, 360);
  
  function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return result;
}

function getFakeOverall(arr) {
  let result = 0;

  arr.forEach(item => result = result + item.value);

  return result;
}

function calcFakeRanges(bets) {
  let result = [];
  
  for (let i = 0; i < bets.length; i++) {
    const pct = props.type === 'standart' ? bets[i].pct : bets[i].pct_reverse;
    const angle = pct / 100 * 360;
    const min = i === 0 ? 0 : result[i - 1].max;
    const max = min + angle;
    
    result.push({ min: min, max: max });
  }

  return result;
}

function updateFakePcts() {
  bets_fake.value.forEach(item => item.pct = (item.value / overall_fake.value * 100).toFixed(3));
  bets_fake.value.forEach(item => item.pct_reverse = ((100 - item.pct) / (bets_fake.value.length - 1)).toFixed(3));
}

async function slowItFor(ms) {
  await new Promise((res) => setTimeout(res, ms));
}
</script>

<template>
  <div class="bench__body">
    <div class="bench__interact">
      <label for="iterations">Кількість ітерацій: </label>
      <input type="number" name="iterations" id="iterations" min="1000" v-model="iterations">
      <button @click="runTest" :disabled="isCalculating">{{ isCalculating ? 'Розрахунок...' : 'Почати тестування' }}</button>
    </div>

    <p class="bench__note"><b style="color: red;">Важливо!</b> Під час тестування браузер може "повиснути" та запропонує закрити сторінку - не робіть цього, дайте алгоритму прогнати всі цикли, щоб отримати результати. Більше ітерацій – довший розрахунок, але при цьому точніші результати на виході.</p>
    
    <div class="bench__progress">
      <div class="bench__progress-snake" :style="{ width: progress + '%' }"><span>{{ isColdStart ? '' : isCalculating ? progress.toFixed() + '%' : 'Тест завершено!' }}</span></div>
    </div>

    <div class="bench__table">
      
      <div class="bench__item bench__item--head">
        <div class="bench__sub-item bench__sub-item--title">Назва лота</div>
        <div class="bench__sub-item bench__sub-item--base-chance">Єталонні шанси</div>
        <div class="bench__sub-item bench__sub-item--fact-chance">Фактичні шанси</div>
        <div class="bench__sub-item bench__sub-item--diff">Похибка</div>
        <div class="bench__sub-item bench__sub-item--wins">Кількість перемог</div>
      </div>

      <div v-for="bet in data" class="bench__item">
        <div class="bench__sub-item bench__sub-item--title">{{ bet.title }}</div>
        <div class="bench__sub-item bench__sub-item--base-chance">{{ bet.pct }}%</div>
        <div class="bench__sub-item bench__sub-item--fact-chance">{{ bet.pct_fact ? bet.pct_fact + '%' : '---' }}</div>
        <div class="bench__sub-item bench__sub-item--diff">{{ bet.diff ? bet.diff : '---' }}</div>
        <div class="bench__sub-item bench__sub-item--wins">{{ bet.wins }}</div>
      </div>
    </div>

    <p class="bench__note">
      <b style="color: orange;">Цікаво знати!</b> Розрахунок у режимі "На Вибуття" відбувається заново на кожному колі (раунді) за формулою: <b style="color: orange;">(100% - A) / Б</b>, де:<br><b style="color: orange;">А</b> - вирогідність перемоги,<br><b style="color: orange;">Б</b> - решта раундів (кількість лотів мінус 1).<br><br>
      Візмемо <b>{{ (props.bets[0].title).toUpperCase() }}</b> за приклад: (100% - {{ props.bets[0].pct }}%) / {{ props.bets.length - 1 }} = {{ ((100 - props.bets[0].pct) / (props.bets.length - 1)).toFixed(3) }}%. Тобто шанс "випасти" цього лота у конкретно цьому (у нашому випадку - першому) раунді становить {{ ((100 - props.bets[0].pct) / (props.bets.length - 1)).toFixed(3) }}%. На наступному колі відсотки будуть інші, які розраховуватимуться за формулою вище.
    </p>

    <button class="bench__close" @click="$emit('close')"><span class="material-symbols-outlined">close</span></button>
  </div>
</template>

<style scoped>
.bench__body {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10px;
  padding-top: 40px;
  color: white;
  background-color: black;
  overflow-y: auto;
}

.bench__interact {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
  margin-bottom: 20px;
}

.bench__interact > label {
  font-size: 18px;
  text-transform: uppercase;
}

.bench__interact > input {
  width: 95px;
  margin-left: 5px;
  padding: 5px 10px;
  font-size: 18px;
  font-weight: bold;
  background-color: white;
}

.bench__interact > button {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 18px;
  text-transform: uppercase;
  border: 2px solid black;
  border-radius: 5px;
  cursor: pointer;
}

.bench__interact > button:hover {
  color: white;
  border-color: white;
  background-color: black;
}

.bench__interact > button:disabled {
  color: lightgrey;
  border-color: lightgrey;
  background-color: black;
  cursor: not-allowed;
}

.bench__note {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  margin-bottom: 20px;
  color: lightgray;
  font-size: 14px;
}

.bench__progress {
  display: block;
  width: 100%;
  height: 30px;
  max-width: 1000px;
  margin: 0 auto;
  margin-bottom: 20px;
  background-color: darkblue;
}

.bench__progress-snake {
  display: block;
  width: 10%;
  height: 100%;
  color: darkblue;
  font-weight: bold;
  font-size: 28px;
  text-align: right;
  background-color: white;
  text-shadow: 1px 1px 1px white;
}

.bench__table {
  background-color: black;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  margin-bottom: 20px;
  overflow: hidden;
  overflow-x: auto;
}

.bench__item {
  display: flex;
  /* align-items: center; */
  /* justify-content: space-between; */
  text-align: center;
}

.bench__item:not(.bench__item--head):hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.bench__item--head {
  font-weight: bold;
  /* border-bottom: 1px solid; */
}

.bench__sub-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-basis: 20%;
  min-width: 80px;
  padding: 10px 5px;
  /* flex-grow: 1; */
  /* border-right: 1px solid; */
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.bench__sub-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 100%;
  width: 5px;
  height: 100%;
  background: rgb(0,0,0);
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
  transform: translateX(-100%);
}

.bench__item:not(.bench__item--head) > .bench__sub-item--title {
  justify-content: start;
  padding-left: 10px;
  text-transform: uppercase;
  text-wrap: nowrap;
  white-space:nowrap;
}

.bench__close {
  position: absolute;
  top: 0;
  left: 100%;
  margin: 0;
  padding: 0;
  font-weight: bold;
  border: 2px solid black;
  border-top: 0;
  border-right: 0;
  border-bottom-left-radius: 5px;
  transform: translateX(-100%);
  /* transition: all 150ms ease-in-out; */
  cursor: pointer;
}

.bench__close:hover {
  color: white;
  border-color: white;
  background-color: black;
}

.bench__close > span {
  display: block;
  font-size: 35px;
}

@media screen and (max-width: 534px) {
  .bench__interact > button {
    flex-basis: 100%;
    margin: 0;
    margin-top: 15px;
  }
}

@media screen and (max-width: 301px) {
  .bench__interact > input {
    flex-basis: 100%;
    margin: 0;
    margin-top: 15px;
  }
}
</style>