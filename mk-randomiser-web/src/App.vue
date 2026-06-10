<script setup lang="ts">
import { coords, colours } from './data/mapData';
import { ref, onMounted, computed, nextTick } from 'vue';
import { animate, onScroll, stagger } from 'animejs';
import {
  getMaps,
  generateSetRequest,
  resetHistoryRequest,
  getCooldownRequest,
  writeCooldownRequest
} from './api/APICalls';
import MKMap from './components/map.vue';
import questionBlock from './components/questionBlock.vue';
import emptyBlock from './components/emptyBlock.vue';
import cog from './components/cog.vue';
import { animateCog } from './components/cog.vue';
import blurScreen from './components/blurScreen.vue';
import { animateBlur } from './components/blurScreen.vue';

interface MapData {
  map_name: string;
  since_last_played: number;
}

var settingsMenu = ref(false); // boolean keeps track of if the settings menu is open or closed

const rectEls = ref<SVGGElement[]>([]) // array of the rectangles

const mapOptions = [1, 3, 4, 5, 6, 8, 12, 16, 32]; // for choosing the number of maps to generate
var mapIndex = 0; // for indexing mapOptions
const mapCount = ref(1) // the numper of maps to generate
let lastWheelTime = 0;

const svgSize = ref(800); // size of the map names svg
const center = computed(() => ({
  x: svgSize.value / 2,
  y: svgSize.value / 2,
})); // center of the map names svg
const radius = computed(() => svgSize.value * 0.4); // radius of the map names SVG

const positionedRects = ref([]); // the positions of the .rect elements

const maps = ref<MapData[]>([]); // the object containing all of the maps
const currentMaps = ref<string[]>([]); // the object containing the names of the maps generated
const history = ref<string[]>([]); // the object containing the names of the last 30 maps generated

const cooldown = ref(6); 
const editingCooldown = ref(false)

let lastClickTime = 0; // last time the map was clicked

// function toggles the settings menu. When menu is closed, the cooldown counter is updated according to the user's choice
function toggleSettingsMenu(){
  const menu = document.querySelector('.settings-menu');
  const width = menu.offsetWidth;
  animate(menu, {
    x: [{
      to: settingsMenu.value ? 0 : -width,
      ease: 'outExpo',
      duration: 400
    }]
  });

  // if the settings menu is being closed and the cooldown value has been edited we update it
  if (settingsMenu.value && editingCooldown.value){
    writeCooldown()
    editingCooldown.value=false
  }
  settingsMenu.value = !settingsMenu.value;
}

// Function used to set the .rect elements
function setRectRef(el: SVGGElement | null, id: number) {
  if (el) rectEls.value[id] = el
}

// Function used to increment or decrement the number of maps using scroll element.
function handleWheel(event: WheelEvent) {
  event.preventDefault();

  const now = Date.now();

  if (now - lastWheelTime < 300) {
    return;
  }

  lastWheelTime = now;

  if (event.deltaY > 0) {
    mapIndex = Math.min(7, mapIndex + 1);
  } else {
    mapIndex = Math.max(0, mapIndex - 1);
  }
  mapCount.value = mapOptions[mapIndex];
  positionedRects.value = calculateRectPositions()
  animate(".rect", {
  width: [{ to: '+=10px', ease: 'outExpo', duration: 100 },
    { to: '-=10px', ease: 'outExpo', duration: 100 }
  ],
})
}

// Function calculates the positions of the .rect elements in the map name SVG
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

// Function replaces the value in maps with the current map probability data
async function getProbs() {
  try {
    maps.value = await getMaps();
  } catch (err) {
    console.error(err);
  }
}

// Function edits the cooldown value
function editCooldown(value: number){
  cooldown.value = Math.min(Math.max(cooldown.value + value, 0), 30)
}

// Function sends the edited cooldown value to the server and receives the update map information
async function writeCooldown(){
  maps.value = await writeCooldownRequest(cooldown.value)
}

// Function requests the cooldown value from the server
async function getCooldown() {
  try {
    cooldown.value = await getCooldownRequest();
  } catch (err) {
    console.error(err);
  }
}

// Function generates a new set of maps
async function generateSet() {
  const now = Date.now();

  if (now - lastClickTime < 600) {
    return;
  }

  lastClickTime = now;
  try {
    const generatedMaps = await generateSetRequest(mapCount.value);

    currentMaps.value = generatedMaps;

    history.value.push(...generatedMaps);

    await getProbs();
  } catch (err) {
    console.error(err);
  }
  animate(".rect", {
    y: [
      {to:"-=10px", ease: "outExpo", duration: 100},
      {to:"+=10px", ease: "outExpo", duration: 100}
    ],
    delay:stagger(150)
  })
}

// Function resets the history to empty
async function resetHistory() {
  try {
    await resetHistoryRequest();

    history.value = [];
    currentMaps.value = [];

    await getProbs();
  } catch (err) {
    console.error(err);
  }
}

// function writes the history using the current maps
function writeHistory(){
  for(let i = 29; i>=0; i--){
    maps.value.forEach(element => {
      if(element["since_last_played"] == i){
        history.value.push(element["map_name"]);
      }
    });
  }
}


onMounted(async () => {
  await getProbs();
  await getCooldown();
  positionedRects.value = calculateRectPositions()
  writeHistory();
})


</script>

<template>
  <div class="background">
    <div class="content">
      <blurScreen/>
      <MKMap @click="generateSet()"  @wheel="handleWheel" class="map"/>
        
      <svg class="map-overlay" viewBox="0 0 480 480">
        <line
          v-for="i in Math.max(currentMaps.length - 1, 0)"
          :key="`line-${i}`"
          :x1="coords[currentMaps[i - 1]][0]"
          :y1="coords[currentMaps[i - 1]][1]"
          :x2="coords[currentMaps[i]][0]"
          :y2="coords[currentMaps[i]][1]"
          stroke="black"
        />

        <g v-for="map in currentMaps" :key="map">
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
      <svg class="overlay" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
        <g v-for="rect in positionedRects" :key="rect.id" class="rect" :ref="el => setRectRef(el, rect.id)">
          <questionBlock class="block"
            v-if="rect.id >= currentMaps.length" 
            :x="rect.x - 75"
            :y="rect.y - 20"/>
          <emptyBlock class="block"
            v-if="rect.id < currentMaps.length" 
            :x="rect.x - 75"
            :y="rect.y - 20"/>

          <text class="map-name" v-if="rect.id < currentMaps.length"
            :x="rect.x"
            :y="rect.y"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="16"
          >
            {{ currentMaps[rect.id] }}
          </text>
        </g>
      </svg>
      
    </div>
    <blurScreen/>

    <div v-if="settingsMenu" @click="toggleSettingsMenu(); animateCog(settingsMenu); animateBlur(settingsMenu)" style="width: 100vw; height: 100vh; position: absolute;"></div>
      <div class="settings-menu">
        <g class="settings-block">
            <emptyBlock class="settings-text" @click="resetHistory();">          
              <text 
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-size="4"
                  x="19.84375"
                  y="5.291666">
                Clear history
            </text></emptyBlock>

        </g>
        <g class="settings-block">
          <emptyBlock class="settings-text">          
            <text v-if="editingCooldown==false" @click="editingCooldown=true"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="4"
                x="19.84375"
                y="5.291666">
                Edit cooldown 
            </text>

            <circle cx="6" cy="5" r="4" fill="#FFFFFF00" @click="editCooldown(-1)"></circle>
            <polygon points="3,5 8,8 8,2" v-if="editingCooldown==true" @click="editCooldown(-1)"></polygon>
            <circle cx="34" cy="5" r="4" fill="#FFFFFF00" @click="editCooldown(-1)"></circle>            
            <polygon points="37,5 32,8 32,2" v-if="editingCooldown==true" @click="editCooldown(1)"></polygon>

            <text v-if="editingCooldown==true"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-size="4"
                  x="19.84375"
                  y="5.291666">
                {{cooldown}} 
            </text>
            
          </emptyBlock>

        </g>

      </div>
        <cog @click="toggleSettingsMenu(); animateCog(settingsMenu); animateBlur(settingsMenu)"/>

  </div>
</template>

<style scoped>

@font-face {
  font-family: ITBrush-Flare;
  src: url('./assets/ITBrushflareDEMO-Italic.otf');
}

.settings-menu{
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width:fit-content;
  background-color: #4d4d4d;
  left: 100vw;
  height: 100vh;
}

.settings-block{
  padding: 20px;
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
  height: 98%;
  aspect-ratio: 1;
}

.overlay {
  position: absolute;
  pointer-events: none;
  /* inset: 0; */
  aspect-ratio: 1.3;
  height: 140%;
  }

.map{
  height: 100%;
  aspect-ratio: 1;
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

.settings-text{
  font-family: ITBrush-Flare;
  fill: #f0c711;
}

.settings-text:hover{
  fill:#fad948
}

.content{
  display: flex;   
  position: relative;
  max-width: min(50vw, 70vh);
  aspect-ratio: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.background{
  display: flex;   
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  width: 100vw;
  height: 100vh;
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
    background-size: 100% 100%, 20vh 20vh;
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
