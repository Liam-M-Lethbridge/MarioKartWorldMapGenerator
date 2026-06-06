<script setup lang="ts">
import { coords, colours } from './data/mapData';
import { ref, onMounted, computed } from 'vue';
import { animate, onScroll } from 'animejs';
import {
  getMaps,
  generateMapRequest,
  generateSetRequest,
  resetHistoryRequest
} from './api/APICalls';
import MKMap from './assets/map.vue';
import questionBlock from './assets/questionBlock.vue';
import emptyBlock from './assets/emptyBlock.vue';

interface MapData {
  map_name: string;
  since_last_played: number;
}

// for choosing the number of maps to generate
const mapOptions = [1, 3, 4, 5, 6, 8, 12, 16, 32];

var mapIndex = 0;

const mapCount = ref(1)
let lastWheelTime = 0;

function handleWheel(event: WheelEvent) {
  event.preventDefault();

  const now = Date.now();

  if (now - lastWheelTime < 300) {
    return;
  }

  lastWheelTime = now;

  if (event.deltaY > 0) {
    mapIndex = Math.min(8, mapIndex + 1);
  } else {
    mapIndex = Math.max(0, mapIndex - 1);
  }
  mapCount.value = mapOptions[mapIndex];
  positionedRects.value = calculateRectPositions()
}

// for generating the number of rectangles
const svgSize = ref(800);

const center = computed(() => ({
  x: svgSize.value / 2,
  y: svgSize.value / 2,
}));

const radius = computed(() => svgSize.value * 0.4);

function calculateRectPositions() {
  const n = mapCount.value;

  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;

    return {
      id: i,
      x: center.value.x + radius.value * Math.cos(angle)*1.3,
      y: center.value.y + radius.value * Math.sin(angle),
      angle
    };
  });
}

const positionedRects = computed(() => calculateRectPositions());

// for API calls
const maps = ref<MapData[]>([]);
const current_maps = ref<string[]>([]);
const history = ref<string[]>([]);

async function getProbs() {
  try {
    maps.value = await getMaps();
  } catch (err) {
    console.error(err);
  }
}

async function generateMap() {
  try {
    const map = await generateMapRequest();

    current_maps.value = [map];
    history.value.push(map);

    await getProbs();
  } catch (err) {
    console.error(err);
  }
}

async function generateSet() {

  try {
    const generatedMaps = await generateSetRequest(mapCount.value);

    current_maps.value = generatedMaps;

    history.value.push(...generatedMaps);

    await getProbs();
  } catch (err) {
    console.error(err);
  }
}

async function resetHistory() {
  try {
    await resetHistoryRequest();

    history.value = [];
    current_maps.value = [];

    await getProbs();
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => {
  await getProbs();
  writeHistory();
})

function writeHistory(){
  for(let i = 29; i>=0; i--){
    maps.value.forEach(element => {
      if(element["since_last_played"] == i){
        history.value.push(element["map_name"]);
      }
    });
  }
}


</script>

<template>
  <div class="content">
    <MKMap @click="generateSet()"  @wheel="handleWheel" class="map"/>
      
    <svg class="map-overlay" viewBox="0 0 480 480">
      <line
        v-for="i in current_maps.length - 1"
        :key="`line-${i}`"
        :x1="coords[current_maps[i - 1]][0]"
        :y1="coords[current_maps[i - 1]][1]"
        :x2="coords[current_maps[i]][0]"
        :y2="coords[current_maps[i]][1]"
        stroke="black"
      />

      <g v-for="map in current_maps" :key="map">
        <circle
          r="8"
          :cx="coords[map][0]"
          :cy="coords[map][1]"
          fill="transparent"
          :stroke="colours[map]"
          stroke-width="3"
        />
        <circle
          r="3"
          :cx="coords[map][0]"
          :cy="coords[map][1]"
          :fill="colours[map]"
        />
      </g>
    </svg>
    <svg
  class="overlay" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
  <g v-for="rect in positionedRects" :key="rect.id" class="rect">
    <!-- <rect
      :x="rect.x - 75"
      :y="rect.y - 20"
      width="150"
      height="40"
      rx="4"
      fill="white"
      stroke="black"
    /> -->
    <questionBlock class="block"
      v-if="rect.id >= current_maps.length" 
      :x="rect.x - 75"
      :y="rect.y - 20"/>
    <emptyBlock class="block"
      v-if="rect.id < current_maps.length" 
      :x="rect.x - 75"
      :y="rect.y - 20"/>

    <text class="map-name" v-if="rect.id < current_maps.length"
      :x="rect.x"
      :y="rect.y"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="16"
    >
      {{ current_maps[rect.id] }}
    </text>
  </g>
</svg>
  </div>
  
</template>

<style scoped>

@font-face {
  font-family: ITBrush-Flare;
  src: url('./assets/ITBrushflareDEMO-Italic.otf');
}

.block{
  border-radius: 8px;
  border: #4d4d4d solid 3px;
}
.rect{
  background-color: black;
  height: 20px;
  width: 40px;
}
.map-name{
  font-family: ITBrush-Flare;
  fill: #f0c711;
}
.map-overlay {
  position: absolute;
  pointer-events: none;
  width: min(70vw, 70vh);
  height: min(70vw, 70vh);
}
.overlay {
  position: absolute;
  pointer-events: none;
  /* inset: 0; */
  width: min(100vw, 130vh);
  height: min(100vw, 100vh);
}
.map{
  width: min(70vw, 70vh);
  height: min(70vw, 70vh);
}
.map-count {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;

  padding: 0.5rem 1rem;
  border-radius: 8px;

  background: white;
  font-size: 2rem;
  font-weight: bold;
}

.content{
  display: flex;
  width: 100vw;
  min-height: 100vh;
  height: fit-content;
  background-color: #ffffff;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background:
        linear-gradient(
            to bottom,
            rgba(255,255,255,0) 0%,
            rgba(0,0,0,0.7) 100%
        ),
        repeating-conic-gradient(
            #7f7f7f 0% 25%,
            #4d4d4d 25% 50%,
            #7f7f7f 50% 75%,
            #4d4d4d 75% 100%
        );

    background-size: 100% 100%, 10vh 10vh;
  position: relative;
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}


</style>
