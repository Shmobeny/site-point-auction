<script setup>
import { computed } from 'vue';

const props = defineProps(['range']);

const vectorTramsform = computed(() => `translateY(-50%) rotate(${props.range.min}deg)`);
</script>

<template>
  <div class="vector" :style="{ transform: vectorTramsform }"></div>
</template>

<style scoped>
.vector {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 50%;
  height: 4px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0px -1px 10px 0px black,
              0px 1px 10px 0px black;
  transform-origin: left center;
  transform: translateY(-50%);
  transition: all 380ms linear;
  z-index: 1003;
}
</style>