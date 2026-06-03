<script setup lang="ts">
import { ref, onMounted } from 'vue';
const maps = ref([]);
let current_maps = ref([])
let history = ref([]);

const coords = {
  "Acorn Heights":[240,80],
  "Airship Fortress":[60,170],
  "Boo Cinema":[305,105],
  "Bowser's Castle":[125,115],
  "Cheep Cheep Falls":[305,255],
  "Choco Mountain":[180,255],
  "Crown City":[175,340],
  "Dandelion Depths":[295,185],
  "Desert Hills":[55,330],
  "Dino Dino Jungle":[315,410],
  "DK Pass":[355,220],
  "DK Spaceport":[185,400],
  "Dry Bones Burnout":[180,110],
  "Faraway Oasis":[295,330],
  "Great ? Block Ruins":[375,380],
  "Koopa Troopa Beach":[235,380],
  "Mario Bros. Circuit":[105,295],
  "Mario Circuit":[240,150],
  "Moo Moo Meadows":[240,215],
  "Peach Beach":[420,330],
  "Peach Stadium":[240,285],
  "Rainbow Road":[240,340],
  "Salty Salty Speedway":[360,295],
  "Shy Guy Bazaar":[55,250],
  "Sky-High Sundae":[415,185],
  "Starview Peak":[360,135],
  "Toad's Factory":[180,180],
  "Wario Stadium":[120,220],
  "Wario's Galleon":[420,270],
  "Whistlestop Summit":[110,380]
}
const colours = {
  "Acorn Heights":"#a4c837",
  "Airship Fortress":"#efa02f",
  "Boo Cinema":"#3e7cb7",
  "Bowser's Castle":"#d6fa19",
  "Cheep Cheep Falls":"#FFFFFF",
  "Choco Mountain":"#d6fa19",
  "Crown City":"#FFFFFF",
  "Dandelion Depths":"#ee1c25",
  "Desert Hills":"#d6fa19",
  "Dino Dino Jungle":"#ee1c25",
  "DK Pass":"#55cdfd",
  "DK Spaceport":"#ee1c25",
  "Dry Bones Burnout":"#d6fa19",
  "Faraway Oasis":"#FFFFFF",
  "Great ? Block Ruins":"#d6fa19",
  "Koopa Troopa Beach":"#d6fa19",
  "Mario Bros. Circuit":"#ee1c25",
  "Mario Circuit":"#a4c837",
  "Moo Moo Meadows":"#FFFFFF",
  "Peach Beach":"#d6fa19",
  "Peach Stadium":"#55cdfd",
  "Rainbow Road":"#d6fa19",
  "Salty Salty Speedway":"#ee1c25",
  "Shy Guy Bazaar":"#ee1c25",
  "Sky-High Sundae":"#d6fa19",
  "Starview Peak":"#55cdfd",
  "Toad's Factory":"#ee1c25",
  "Wario Stadium":"#d6fa19",
  "Wario's Galleon":"#55cdfd",
  "Whistlestop Summit":"#ee1c25"
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

async function getProbs(){
  try {
    const response = await fetch('http://localhost:3000/api/maps');

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);

    }
    maps.value = await response.json();
  } catch (err) {
    console.error("Fetch failed:", err)
  }
}
async function generateSet() {
  const num = document.getElementsByTagName("select")[0].value;
  try{
    const response = await fetch('http://localhost:3000/api/generate_set', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mapNum: num })
    });
    current_maps.value =  JSON.parse(await response.text())
    current_maps.value.forEach( (map) => {
      history.value.push(map);
    })
    getProbs();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

  } catch (err) {
    console.error("Fetch failed:", err)
  }
}
async function generateMap(){
  try{
    const response = await fetch('http://localhost:3000/api/generate_map');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const ob = await response.text();
    current_maps.value = [ob.substring(1, ob.length-1)];
    history.value.push(current_maps.value[0]);
    getProbs();
    return response;
  } catch (err) {
    console.error("Fetch failed:", err)
  }
  
}

async function resetHistory(){
  try{
    const response = await fetch('http://localhost:3000/api/reset_history')

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    getProbs();
  } catch (err) {
    console.error("Fetch failed");
  }
  history.value = [];
  current_maps.value = [];
}

const selected_tab = ref("Map generator");


</script>

<template>
  <div class="container">
    <div class="bar">
      <div class="tab" @click="selected_tab = 'Map generator';"> Map generator </div>
      <!-- <div class="tab" @click="selected_tab = 'Set generator';"> Set generator </div> -->
      <div class="tab" @click="selected_tab = 'Probabilities';"> Probabilities </div>
      <div class="tab" @click="selected_tab = 'History';"> History </div>
    </div>
    <div>
      <div class="content" v-if="selected_tab=='Map generator'">
          <button @click="generateMap()">Generate map</button>
          <button @click="generateSet()">Generate set</button>
          <select name="number of maps" id="n_maps" def>
            <option v-for="i in [3,4,5,6,8,10,12,16,20,30]">{{i}}</option>
          </select>
          <!-- <div class="map_box"> -->
            <div class="map">
              <div v-if="current_maps.length == 1" class="map_names">{{ current_maps[0] }}</div>
              <svg v-for="map in current_maps" height="480" width="480" style="position: absolute;">
                <circle r="8" :cx="coords[map][0]" :cy="coords[map][1]" fill="#00000000" :stroke="colours[map]" stroke-width="3"/>
                <circle r="3" :cx="coords[map][0]" :cy="coords[map][1]" :fill="colours[map]"/>
              </svg>
              <svg v-for="i in current_maps.length-1" :key="i" height="480" width="480" style="position: absolute;">
                <line :x1="coords[current_maps[i-1]][0]" :y1="coords[current_maps[i-1]][1]" :x2="coords[current_maps[i]][0]" :y2="coords[current_maps[i]][1]" stroke="black" />
              </svg>
            </div>
        </div>
      <div class="content" v-if="selected_tab=='Set generator'">
          set generator
      </div>

      <div class="tablecontent" v-if="selected_tab=='Probabilities'">
        <div class="column">
          <div v-for="element in maps" class="cell">
            <div>{{element["map_name"]}}</div>
          </div>
        </div>
        <div class="column">
          <div v-for="element in maps" class="cell">
            <div>{{element["prob"]}}</div>
          </div>
        </div>  
        <div class="column">
          <div v-for="element in maps" class="cell">
            <div>{{element["since_last_played"]}}</div>
          </div>
        </div>
      </div>

      <div class="content" v-if="selected_tab=='History'">
          <button @click="resetHistory()">reset History</button>
          <div v-for="value in history">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.column{
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: #ffffdd;
  border-left: 1px solid #020202;
  border-right: 1px solid #020202;
  width: 30%;
}
.container{
    min-height: 100vh;
    height: fit-content;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.bar{
  width: 100vw;
  height: 10vh;
  background-color: #00ffff;
  padding: 0 auto 0rem;
  padding-left: 0 auto 0rem;
  display: flex;

  justify-content:space-around;
  align-items: center;

}
button{
  height: fit-content;
  padding: 4px;
}
.tab{
  border: 2px solid #000000;
  width:100%;
  height: 100%;
  align-content: center;
  text-align: center;
  
}
.tab:hover{
  background-color: #00dddd;
}
.map_names{
  position: absolute; 
  top: 0%;
  width: 100%;
  background-color: whitesmoke;
}
.map{
  display: flex;
  flex-direction: column;
  min-height: 516px;
  background:url(../src/assets/map.svg);
  aspect-ratio: 1;
  border-left: 8px solid #777777 ;
  border-bottom: 8px solid #777777 ;
  border-top: 8px solid #ee1c25 ;
  border-right: 8px solid #ee1c25 ;
  border-radius: 16px;
  margin-bottom: 5%;
  text-align: center;
  align-items: center;
  justify-content: center;
  position: relative;
}
.content{
  display: flex;
  width: 100vw;
  min-height: 90vh;
  height: fit-content;
  background-color: #ffffff;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background:
        linear-gradient(
            to bottom,
            rgba(255,255,255,0) 0%,
            rgba(0,0,0,0.7) 100%
        ),
        repeating-conic-gradient(
            #a8f5e6 0% 25%,
            #7ae8d1 25% 50%,
            #a8f5e6 50% 75%,
            #7ae8d1 75% 100%
        );

    background-size: 100% 100%, 10vh 10vh;
}
.tablecontent{
  display: flex;
  width: 100vw;
  min-height: 90vh;
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
