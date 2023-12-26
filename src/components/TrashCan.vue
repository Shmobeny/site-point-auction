<script setup>
import { ref } from 'vue';

const props = defineProps(['trashcan']);
const emit = defineEmits(['restoreFromTrashcan', 'removeFromTrashcan']);

const showTrashcanItems = ref(true);
const movingElems = ref([]);

function all(type) {
  if (showTrashcanItems.value === false) return;
  
  toggleTrashcanItems();
  if (type === 'restore') emit('restoreFromTrashcan', 'all');

  setTimeout(() => {
    toggleTrashcanItems();
    if (type === 'remove') emit('removeFromTrashcan', 'all');
  }, 380);
}

function toggleTrashcanItems() {
  showTrashcanItems.value = !showTrashcanItems.value;
}

function onBeforeLeave(elem) {

  const elems = elem.parentElement.children;
  let elemIndex = null;

  for (let i = 0; i < elems.length; i++) {
    if (elems[i] === elem) elemIndex = i + 1;
  }

  for (let i = elemIndex; i < elems.length; i++) {
    movingElems.value.push(elems[i]);
    elems[i].style.transform = 'translateY(-53px)';
    elems[i].style.transitionDuration = '380ms';
  }
}

function onAfterLeave() {
  for (let elem of movingElems.value) {
    elem.style.transform = '';
    elem.style.transitionDuration = '0ms';
    
    setTimeout(() => elem.style.transitionDuration = '', 1);
  }
}

</script>

<template>
  <div class="trashcan-wrapper">
    <Transition name="trashcan">
      <div v-if="props.trashcan.length > 0">
        <div class="trashcan">
          <h3 class="trashcan__title">Смітник</h3>
          <button class="trashcan__button trashcan__button--restore" @click="all('restore')"><span class="material-symbols-outlined">restore_from_trash</span></button>
          <button class="trashcan__button trashcan__button--clear" @click="all('remove')"><span class="material-symbols-outlined">delete_forever</span></button>
          <button class="trashcan__button trashcan__button--toggle" :class="showTrashcanItems ? '' : 'trashcan__button--toggle-reverse'" @click="toggleTrashcanItems"><span class="material-symbols-outlined">expand_less</span></button>
        </div>

        <div class="trashcan__items-container">
          <Transition name="items-container">
            <ul v-if="showTrashcanItems" class="trashcan__items-wrapper">
              <TransitionGroup name="trashcan-items" @before-leave="onBeforeLeave" @after-leave="onAfterLeave">
                <li
                  v-for="item in props.trashcan"
                  :key="item.id"
                  class="trashcan__item"
                >
                  <span class="trashcan__item-title" :style="{ borderLeftColor: item.color }">{{ item.title }}</span>
                  <span class="trashcan__item-value">{{ item.value }}₴</span>
                  <button class="trashcan__button trashcan__button--restore trashcan__button--no-info" @click="$emit('restoreFromTrashcan', item)"><span class="material-symbols-outlined">restore_from_trash</span></button>
                  <button class="trashcan__button trashcan__button--clear trashcan__button--no-info" @click="$emit('removeFromTrashcan', item.id)"><span class="material-symbols-outlined">delete_forever</span></button>
                </li>
              </TransitionGroup>
            </ul>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
  
</template>

<style scoped>
.trashcan-wrapper {
  position: relative;
  margin: 20px 0;
  opacity: 1;
  transition: opacity 380ms ease-in-out;
}

.trashcan-wrapper--hidden {
  opacity: 0;
}

.trashcan {
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid darkgrey;
}

.trashcan__title {
  margin: 0;
  padding: 5px 10px;
  font-size: 16px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
}

.trashcan__button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-left: 15px;
  padding: 0;
  border-radius: 50%;
  box-shadow: 1px 1px 4px 0px black;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.trashcan__button::before {
  content: '123';
  position: absolute;
  top: 0;
  left: 50%;
  display: block;
  color: black;
  font-weight: bold;
  transform: translate(-50%, -125%);
  opacity: 0;
  transition: all 150ms ease-in-out;
}

.trashcan__button:hover {
  transform: scale(1.2);
}

.trashcan__button:not(.trashcan__button--no-info):hover::before {
  opacity: 1;
}

.trashcan__button > span {
  font-size: 18px;
}

.trashcan__button--restore {
  color: rgb(0, 0, 150);
}

.trashcan__button--restore::before {
  content: 'відновити';
}

.trashcan__button--restore:hover {
  color: white;
  background-color: rgb(0, 0, 150);
}

.trashcan__button--clear {
  color: rgb(228, 0, 0);
}

.trashcan__button--clear::before {
  content: 'очистити';
}

.trashcan__button--clear:hover {
  color: white;
  background-color: rgb(228, 0, 0);
}

.trashcan__button--toggle > span {
  transition: transform 380ms ease-in-out;
}

.trashcan__button--toggle::before {
  content: 'згорнути';
}

.trashcan__button--toggle-reverse > span {
  transform: rotate(180deg);
}

.trashcan__button--toggle-reverse::before {
  content: 'розгорнути';
}

.trashcan__button--toggle:hover {
  color: white;
  background-color: rgb(150, 0, 150);
}

.trashcan__button--toggle > span {
  font-size: 24px;
}

.trashcan__items-container {
  overflow: hidden;
}

.trashcan__items-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.trashcan__item {
  position: relative;
  display: flex;
  align-items: center;
  margin: 10px 0px;
  font-size: 20px;
  text-transform: uppercase;
  transition: all 150ms ease-in-out;
  opacity: 0.5;
}

.trashcan__item:hover {
  opacity: 1;
}

.trashcan__item > button {
  opacity: 0.3;
}

.trashcan__item:hover > button {
  opacity: 1;
}

.trashcan__item-title,
.trashcan__item-value {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
}

.trashcan__item-title {
  border-left: 4px solid red;
}

.trashcan__item-value {
  margin: 0;
}

.trashcan-enter-active,
.trashcan-leave-active {
  transition: opacity 380ms ease-in-out;
}

.trashcan-enter-from,
.trashcan-leave-to {
  opacity: 0;
}

.items-container-enter-active,
.items-container-leave-active {
  transition: transform 380ms ease-in-out;
}

.items-container-enter-from,
.items-container-leave-to {
  transform: translateY(-100%);
}

.trashcan-items-move {
  transition: unset;
}

.trashcan-items-enter-active,
.trashcan-items-leave-active {
  transition: all 380ms ease-in-out;
}

.trashcan-items-enter-from,
.trashcan-items-leave-to {
  opacity: 0 !important;
  transform: scale(0);
}
</style>