<script setup lang="ts">
import { coords, colours } from './data/mapData';
import { ref, onMounted } from 'vue';
import { animate, onScroll } from 'animejs';
import {
  getMaps,
  generateMapRequest,
  generateSetRequest,
  resetHistoryRequest
} from './api/APICalls';
import MKMap from './assets/map.vue';

interface MapData {
  map_name: string;
  since_last_played: number;
}

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
  const num = Number(
    document.getElementsByTagName('select')[0].value
  );

  try {
    const generatedMaps = await generateSetRequest(num);

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
  <div class="container">
    <div>
      <div class="content">
            <MKMap @click="generateMap()"/>
              
            <svg v-for="map in current_maps" height="480" width="480" style="position: absolute;">
                <circle r="8" :cx="coords[map][0]" :cy="coords[map][1]" fill="#00000000" :stroke="colours[map]" stroke-width="3"/>
                <circle r="3" :cx="coords[map][0]" :cy="coords[map][1]" :fill="colours[map]"/>
              </svg>
              <svg v-for="i in current_maps.length-1" :key="i" height="480" width="480" style="position: absolute;">
                <line :x1="coords[current_maps[i-1]][0]" :y1="coords[current_maps[i-1]][1]" :x2="coords[current_maps[i]][0]" :y2="coords[current_maps[i]][1]" stroke="black" />
              </svg>
        </div>
        <div class="square"></div>
    </div>
  </div>
</template>

<style scoped>

.container{
    min-height: 100vh;
    height: fit-content;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
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
}
.tablecontent{
  display: flex;
  width: 100vw;
  min-height: 100vh;
  height: fit-content;
  background-color: #ffffff;
  padding: 0 auto 0rem;
  padding-left: 0 auto 0rem;
  flex-direction: row;
  justify-content: center;

}
header {
  line-height: 1.5;
}
.cell{
  text-align: center;
  border-bottom: 1px solid #f0f0d0;
}
.logo {
  display: block;
  margin: 0 auto 2rem;
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
