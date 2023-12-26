<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps(['bet', 'bets', 'query', 'isSearchItem']);
const emit = defineEmits(['removeBet', 'editBet', 'addToValue', 'addToQueryList', 'removeFromQueryList', 'editItemInQueryList']);

const inputTitleElem = ref(null);
const inputOverallElem = ref(null);
const additionalValue = ref(null);
const inputAdditionalElem = ref(null);
const editModeIsOn = ref(false);

const addBtnIsActive = computed(() => additionalValue.value ? true : false);

let searchThrottle = null;

watch(() => props.query, () => {
  if (props.isSearchItem) return;

  clearTimeout(searchThrottle);

  const result = props.query ? props.query.length > 0 ? props.bet.title.includes(props.query.toLowerCase()) : false : false;
  
  switch (result) {
    case true:
      searchThrottle = setTimeout(() => emit('addToQueryList', {...props.bet}), 300);
      break;
    default:
      searchThrottle = setTimeout(() => emit('removeFromQueryList', props.bet.id), 300);
  }
});

function addToValue() {
  emit('addToValue', props.bet.id, additionalValue.value);
  if (props.isSearchItem) emit('editItemInQueryList', props.bet.id, true);
  inputAdditionalElem.value.blur();
  additionalValue.value = null;
}

function edit() {
  const isConfirmState = editModeIsOn.value;

  editModeIsOn.value = !editModeIsOn.value;

  if (!isConfirmState) return;

  emit('editBet', props.bet.id, inputTitleElem.value.value, inputOverallElem.value.value);
  if (props.isSearchItem) emit('editItemInQueryList', props.bet.id);
}

function remove() {
  emit('removeBet', props.bet.id);
  if (props.isSearchItem) emit('removeFromQueryList', props.bet.id, true);
}

function navBarMobileFix() {
  document.querySelector('#navBar').style.display = 'none';
  setTimeout(() => document.querySelector('#navBar').style.display = '', 10);
}
</script>

<template>
  <li class="item">
    <input ref="inputTitleElem" class="item__title" :style="{ borderColor: props.bet.color }" type="text" :value="bet.title" :disabled="!editModeIsOn" @keydown.enter="edit" @blur="navBarMobileFix">
    <input ref="inputOverallElem" class="item__overall" @blur="navBarMobileFix" :type="editModeIsOn ? 'number' : 'text'" :value="editModeIsOn ? bet.value : bet.value + '₴'" :disabled="!editModeIsOn" @keydown.enter="edit">
    <div class="item__pct">{{ bet.pct }}%</div>
    <button class="item__add-value" :disabled="!addBtnIsActive || editModeIsOn" @click="addToValue">+</button>
    <input ref="inputAdditionalElem" class="item__value" v-model="additionalValue" type="number" placeholder="₴" :disabled="editModeIsOn" @keydown.enter="addToValue" @blur="navBarMobileFix">
    <button :class="editModeIsOn ? 'item__edit item__edit--active' : 'item__edit'" @click="edit">{{ editModeIsOn ? 'Завершити' : 'Редагувати' }}</button>
    <button class="item__remove" @click="remove">Видалити</button>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  width: 100%;
  /* height: 34px; */
  margin: 10px 0px;
  border-radius: 5px;
}

.item__title {
  flex-basis: 100%;
  margin-right: 10px;
  border-left: 4px solid black;
  text-transform: uppercase;
}

.item__overall {
  flex: 0 0 100px;
  width: 100px;
  margin-right: 10px;
}

.item__pct {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 100px;
  height: 34px;
  margin-right: 10px;
  padding: 5px 10px;
  font-size: 20px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
}

.item__add-value {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  margin-right: 10px;
  padding: 0;
  font-size: 28px;
  border-radius: 50%;
}

.item__add-value:disabled {
  color: grey;
  background-color: lightgray;
  box-shadow: inset 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
}

.item__add-value:not(:disabled):hover {
  color: white;
  background-color: rgb(150, 0, 150);
}

.item__value {
  width: 100px;
  margin-right: 10px;
  text-align: end;
}

.item__remove:hover {
  color: white;
  background-color: rgb(228, 0, 0);
}

.item__edit--active {
  color: white;
  background-color: rgb(0, 0, 150);
  animation-name: pulse;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.item__edit:hover {
  color: white;
  background-color: rgb(0, 0, 150);
}

input {
  height: 34px;
  padding: 5px 10px;
  font-size: 20px;
  border-radius: 5px;
  background-color: white;
  box-shadow: inset 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
  transition: all 150ms ease-in-out;
  z-index: 1;
}

input:disabled {
  color: black;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 1;
  box-shadow: unset;
}

button {
  height: 32px;
  margin-right: 10px;
  border-radius: 5px;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.5);
  transition: all 150ms ease-in-out;
  cursor: pointer;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  25% {
    transform: scale(1.1);
  }

  50% {
    transform: scale(1);
  }

  75% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

@media screen and (max-width: 890px) {
  .item__title {
    min-width: 150px;
  }
}

@media screen and (max-width: 765px) {
  .item {
    flex-wrap: wrap;
  }

  .item__title {
    margin-bottom: 5px;
  }

  .item__value {
    flex-grow: 1;
  }
}

@media screen and (max-width: 574px) {
  .item__remove,
  .item__edit {
    flex: 1 1 39%;
    margin-top: 5px;
  }
}

@media screen and (max-width: 400px) {
  .item__overall {
    flex: 1 1 60%;
    margin-bottom: 5px;
  }

  .item__value {
    flex-basis: 50%;
  }
}

@media screen and (max-width: 326px) {
  .item__overall {
    flex-basis: 50%;
  }
}
</style>