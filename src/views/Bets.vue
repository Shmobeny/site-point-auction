<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ListItem from '../components/ListItem.vue';
import TrashCan from '../components/TrashCan.vue';

const props = defineProps(['bets', 'betsIDs', 'trashcan', 'restoreFromTrashcan', 'removeFromTrashcan', 'removeBet', 'editBet', 'addToValue', 'timerIsActive', 'miniTimerIsActive']);
const emit = defineEmits(['addBet', 'showMiniTimer', 'hideMiniTimer']);

const inputTitle = ref(null);
const inputValue = ref(null);
const inputTitleField = ref(null);
const inputValueField = ref(null);

const queryItems = ref({});
const sortType = ref('value');

const sortedBets = computed( () => [...props.bets].sort((a, b) => sortBy(a, b, sortType.value)) );

const queryListIsNotEmpty = computed(() => Object.keys(queryItems.value).length > 0 ? true : false);
const passIsAllowed = computed(() => inputTitle.value && inputValue.value ? true : false);

onMounted(() => emit('showMiniTimer'));
onUnmounted(() => emit('hideMiniTimer'));

function add() {
  if (!passIsAllowed.value) return;

  emit('addBet', inputTitle.value, inputValue.value);

  inputTitle.value = null;
  inputValue.value = null;

  inputTitleField.value.blur();
  inputValueField.value.blur();
}

function addToQueryList(obj) {
  queryItems.value[obj.id] = {...obj};
}

function removeFromQueryList(id, force = false) {
  switch (force) {
    case true:
      delete queryItems.value[id];
      break;
    default:
      if (queryListIsNotEmpty === false) return;
      if (queryItems.value[id]) delete queryItems.value[id];
  }
}

function editItemInQueryList(id, onlyValue = false) {
  const targetIndex = props.betsIDs.indexOf(id);
  
  queryItems.value[id].value = props.bets[targetIndex].value;
  queryItems.value[id].pct = props.bets[targetIndex].pct;
  
  if (onlyValue) return;

  queryItems.value[id].title = props.bets[targetIndex].title;
}

function closeSearch() {
  queryItems.value = {};
  inputTitle.value = null;
}

function changeFocus(e) {
  switch (true) {
    case e.target === inputTitleField.value:
      if (inputValueField.value.value.length === 0) inputValueField.value.focus();
      break;
    case e.target === inputValueField.value:
      if (inputTitleField.value.value.length === 0) inputTitleField.value.focus();
      break;
  }
}

function onBeforeLeave(elem) {
  const parentPos = document.querySelector('.bets__lists-container').getBoundingClientRect();
  const elemPos = elem.getBoundingClientRect();
  
  elem.style.width = elem.offsetWidth + "px";
  elem.style.height = elem.offsetHeight + "px";
  elem.style.top = elemPos.y - parentPos.y + "px";
  elem.style.left = elemPos.x- parentPos.x + "px";
}

function navBarMobileFix() {
  document.querySelector('#navBar').style.display = 'none';
  setTimeout(() => document.querySelector('#navBar').style.display = '', 10);
}

function sortBy(a, b, type) {
  const reverse = type[0] === '-' ? true : false;

  type = type === 'default' ? 'id' :
         type === '-title' ? 'title' :
         type === '-value' ? 'value' : type;

  if (a[type] > b[type]) return reverse ? -1 : 1;
  if (a[type] == b[type]) return 0;
  if (a[type] < b[type]) return reverse ? 1 : -1;
}
</script>

<template>

  <div class="bets" :style="{ paddingTop: props.miniTimerIsActive ? '55px' : '' }">

    <form class="bets__inputs cock-ring">
      <input ref="inputTitleField" class="bets__title" v-model="inputTitle" @blur="navBarMobileFix" type="text" placeholder="Назва ставки" @keydown.enter="changeFocus">
      <input ref="inputValueField" class="bets__value" v-model="inputValue" @blur="navBarMobileFix" type="number" placeholder="₴" :min="1" @keydown.enter="changeFocus">
      <button class="bets__add" @click="add" :disabled="!passIsAllowed"></button>
    </form>

    <div class="bets__sort cock-ring">
      <label for="sort">Сортування за:</label>
      <select name="sort" id="sort" v-model="sortType" :disabled="props.bets.length < 2">
        <option value="default">примовченням</option>
        <option value="-title">назвою (А-Я)</option>
        <option value="title">назвою (Я-А)</option>
        <option value="value">сумою (більш-меньш)</option>
        <option value="-value">сумою (меньш-більш)</option>
      </select>

      <a href="https://stand-with-ukraine.pp.ua/" target="_blank">
        <img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg">
      </a>
    </div>

    <div class="bets__lists-container cock-ring">
      <ul class="bets__list">
        <TransitionGroup name="list" @before-leave="onBeforeLeave">

          <TrashCan
            :key="1"
            :trashcan="props.trashcan"
            @restoreFromTrashcan="props.restoreFromTrashcan"
            @removeFromTrashcan="props.removeFromTrashcan"
          />
          
          <ListItem
            v-for="bet in sortedBets"
            :key="bet.id"
            :bet="bet"
            :bets="props.bets"
            :query="inputTitle"
            :isSearchItem="false"
            @removeBet="props.removeBet"
            @editBet="editBet"
            @addToValue="addToValue"
            @addToQueryList="addToQueryList"
            @removeFromQueryList="removeFromQueryList"
            @editItemInQueryList="false"
          />
        </TransitionGroup>
      </ul>

      <Transition name="blured-mask">
        <div v-if="queryListIsNotEmpty" class="blured-mask" @click="closeSearch"></div>
      </Transition>

      <ul class="bets__list bets__list--search">
        <TransitionGroup name="list" @before-leave="onBeforeLeave">
          <ListItem
            v-for="bet in queryItems"
            :key="bet.id + bet.id"
            :bet="bet"
            :bets="props.bets"
            :query="inputTitle"
            :isSearchItem="true"
            @removeBet="props.removeBet"
            @editBet="editBet"
            @addToValue="addToValue"
            @addToQueryList="false"
            @removeFromQueryList="removeFromQueryList"
            @editItemInQueryList="editItemInQueryList"
          />
        </TransitionGroup>

        <Transition name="search-notice">
          <div v-if="queryListIsNotEmpty" class="bets__search-notice">
            <span>Результати автоматичного пошуку:</span>
            <button class="bets__close-search" @click="closeSearch"><span class="material-symbols-outlined">close</span></button>
          </div>
        </Transition>
      </ul>

    </div>

    <div v-if="props.bets.length === 0 && props.trashcan.length === 0" class="bets__info">
      <p v-if="!props.timerIsActive">Перед початком аукціона не забудьте запустити <router-link to="/timer" class="bets__link">таймер</router-link>.</p>
      <p>Починайте заносити замовлення ваших глядячів до списку за допомогою форми, що вище.</p>
      <p style="opacity: 0.4;">Проект знаходиться у сдаії <b>бета-тесту</b>. Підписуйтесь на канал <a href="https://www.youtube.com/@Mihagan" class="bets__link" target="_blank">Mihagan</a>а :)</p>
    </div>

    

  </div>
</template>

<style scoped>
select {
  all: unset;
}

.bets {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* max-width: 1600px; */
  height: 100%;
  margin: 0 auto;
  padding: 30px 30px 75px 30px;
  overflow-y: auto;
}

.cock-ring {
  width: 100%;
  max-width: 1600px;
  margin-left: auto !important;
  margin-right: auto !important;
}

.bets__inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  min-height: 60px;
  border-radius: 10px;
  background-color: lightgray;
  box-shadow: 10px 10px 10px 0px rgba(0, 0, 0, 0.2);
}

.bets__title {
  flex-basis: 100%;
  margin-right: 10px;
}

.bets__value {
  width: 100px;
  margin-right: 10px;
  text-align: end;
}

.bets__add {
  flex-shrink: 0;
  width: 165px;
  margin-left: auto;
  padding: 0;
  transition: all 150ms ease-in-out;
}

.bets__add::before {
  content: 'Додати лот';
}

.bets__add:disabled,
.bets__add-value:disabled {
  color: grey;
  background-color: lightgray;
  box-shadow: inset 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
}

.bets__add:not(:disabled):hover,
.bets__add-value:hover {
  color: white;
  background-color: rgb(150, 0, 150);
}

.bets__sort {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 20px 0 10px 0;
  font-size: 16px;
}

.bets__sort > label,
.bets__sort > select {
  box-sizing: border-box;
  height: 28px;
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
}

.bets__sort > select {
  font-weight: bold;
  cursor: pointer;
}

.bets__sort > select:disabled {
  color: lightgray;
  cursor: not-allowed;
}

.bets__sort > select:not(:disabled):hover {
  background-color: white;
}

.bets__sort > a {
  flex-grow: 1;
}

.bets__sort > a > img {
  display: block;
  margin-left: auto;
  margin-right: 10px;
}

.bets__lists-container {
  position: relative;
}

.blured-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1;
}

.bets__list {
  display: flex;
  flex-direction: column-reverse;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bets__list--search {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0;
  z-index: 2;
}

.bets__search-notice {
  display: flex;
  align-items: center;
  height: 34px;
  margin: 10px 0;
  padding: 0 10px;
  color: black;
  font-size: 16px;
  background: rgb(211,211,211);
  background: linear-gradient(45deg, rgba(211,211,211,1) 0%, rgba(255,255,255,0) 100%);
}

.bets__close-search {
  width: 45px;
  height: 45px;
  margin: 0;
  margin-left: auto;
  padding: 0;
  padding-top: 5px;
  border-radius: 50%;
}

.bets__close-search:hover {
  color: white;
  background-color: rgb(150, 0, 150);
}

.bets__close-search > span {
  font-size: 26px;
}

.bets__item {
  display: flex;
  height: 100%;
  width: 100%;
}

.bets__overall {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-right: 10px;
  padding: 5px 10px;
  font-size: 20px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
}

.bets__add-value {
  flex-shrink: 0;
  width: 33px;
  margin-right: 10px;
  font-size: 30px;
  border-radius: 50%;
}

.bets__remove:hover {
  color: white;
  background-color: rgb(228, 0, 0);
}

.bets__edit:hover {
  color: white;
  background-color: rgb(0, 0, 150);
}

.bets__info {
  margin: auto 0;
  color: rgba(0, 0, 0, 0.8);
  font-size: 20px;
  text-align: center;
}

.bets__link {
  color: rgb(187, 121, 0);
  font-weight: bold;
  text-decoration: none;
  transition: all 150ms ease-in-out;
}

.bets__link:hover {
  color: black;
  background-color: rgb(187, 121, 0);
}

input {
  height: 34px;
  padding: 5px 10px;
  font-size: 20px;
  border-radius: 5px;
  background-color: white;
  box-shadow: inset 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
}

input:disabled {
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: unset;
}

button {
  height: 32px;
  margin-right: 10px;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.search-notice-enter-active,
.search-notice-leave-active,
.blured-mask-enter-active,
.blured-mask-leave-active {
  transition: opacity 380ms ease-in-out;
}

.search-notice-enter-from,
.search-notice-leave-to,
.blured-mask-enter-from,
.blured-mask-leave-to {
  opacity: 0;
}

.blured-mask-leave-to {
  transition-delay: 300ms;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 380ms ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.list-leave-active {
  position: absolute;
}

@media screen and (max-width: 650px) {
  .bets {
    padding: 5px 5px 75px 5px;
  }
}

@media screen and (max-width: 600px) {
  .bets__add {
    width: 32px;
    font-size: 28px;
    border-radius: 50%;
  }

  .bets__add::before {
    content: '+';
  }
}

@media screen and (max-width: 540px) {

  .bets__sort > label,
  .bets__sort > select {
    flex: 1 1 35%;
  }

  .bets__sort > a > img {
    margin: 10px auto 0 auto;
  }
}

@media screen and (max-width: 460px) {
  .bets__title {
    min-width: 100px;
  }
}

@media screen and (max-width: 375px) {

.bets__sort > label,
.bets__sort > select {
  flex: 1 1 100%;
}

.bets__sort > select {
  margin-top: 10px;
}
}
</style>