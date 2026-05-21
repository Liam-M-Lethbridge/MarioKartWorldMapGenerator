<script setup lang="ts">
import { ref, onMounted } from 'vue';
const maps = ref([]);
let current_map = ref("")

onMounted(async () => {
  getProbs();
})

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

async function generateMap(){
  try{
    const response = await fetch('http://localhost:3000/api/generate_map')
    current_map.value = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
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
}

const selected_tab = ref("Map generator");


</script>

<template>
  <div class="container">
    <div class="bar">
      <div class="tab" @click="selected_tab = 'Map generator';"> Map generator </div>
      <div class="tab" @click="selected_tab = 'Set generator';"> Set generator </div>
      <div class="tab" @click="selected_tab = 'Probabilities';"> Probabilities </div>
      <div class="tab" @click="selected_tab = 'History';"> History </div>
    </div>
    <div>
      <div class="content" v-if="selected_tab=='Map generator'">
          <button @click="generateMap()">Generate map</button>
          <div class="map" v-if="current_map.length >0">{{ current_map }}</div>
      </div>

      <div class="content" v-if="selected_tab=='Set generator'">
          set generator
      </div>

      <div class="content" v-if="selected_tab=='Probabilities'">
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

.content{
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
