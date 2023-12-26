<script setup>
import { computed } from 'vue';

const props = defineProps(['aucType', 'bet', 'range']);

const angle = computed(() => props.aucType === 'standart' ? props.bet.pct / 100 * 360 : props.bet.pct_reverse / 100 * 360);

const partTransform = computed(() => {
  let style = {
    shape: null,
    color: props.bet.color,
    addon: {
      part_1: null,
      part_2: null,
      part_3: null,
    }
  };

  const skew = 90 - angle.value < 0 ? 0 : 90 - angle.value;

  style.shape = `rotate(${props.range.min}deg) skew(${skew}deg)`;

  // style.color = '#' + Math.floor(Math.random()*16777215).toString(16);

  style.addon.part_1 = `rotate(${angle.value - 90 + props.range.min}deg)`;
  style.addon.part_2 = `rotate(${angle.value - 180 + props.range.min}deg)`;
  style.addon.part_3 = `rotate(${angle.value - 270 + props.range.min}deg)`;

  return style;
});

const titleTransform = computed(() => `rotate(${props.range.min + angle.value / 2}deg)`);
</script>

<template>
  <div class="part" :style="{ transform: partTransform.shape, backgroundColor: partTransform.color }"></div>
  <div v-if="angle >= 90" class="part part--addon" :style="{ transform: partTransform.addon.part_1, backgroundColor: partTransform.color, boxShadow: `-1px 0px 0px 0px ${partTransform.color}` }"></div>
  <div v-if="angle >= 180" class="part part--addon" :style="{ transform: partTransform.addon.part_2, backgroundColor: partTransform.color, boxShadow: `-1px 0px 0px 0px ${partTransform.color}` }"></div>
  <div v-if="angle >= 270" class="part part--addon" :style="{ transform: partTransform.addon.part_3, backgroundColor: partTransform.color, boxShadow: `-1px 0px 0px 0px ${partTransform.color}` }"></div>
  <div class="title" :style="{ transform: titleTransform, opacity: angle < 15 ? 0 : 1 }">{{ props.bet.title }}</div>
</template>

<style scoped>
.part {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  background-color: aquamarine;
  transform-origin: top left;
  transition: all 380ms linear;
  z-index: 1001;
}

.part--addon {
  box-shadow: -1px 0px 0px 0px aquamarine;
}

.title {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  width: 50%;
  height: 0px;
  padding-left: 50px;
  color: white;
  font-size: 20px;
  text-wrap: nowrap;
  white-space:nowrap;
  text-transform: uppercase;
  text-align: center;
  text-transform: uppercase;
  background-color: red;
  text-shadow: 1px 1px 4px black;
  transform-origin: left center;
  transform: translateY(-50%);
  transition: all 380ms linear;
  z-index: 1002;
}
</style>