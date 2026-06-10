<script lang="ts">
import { animate } from 'animejs';

// Function controls the animation for the blur overlay
export function animateBlur(value:boolean) {
    const element = document.getElementById("blur-overlay");
    if(value){
        animate(".blur-overlay", {
            opacity:{to:"1", duration:300}
        })
        element.style.pointerEvents = "auto";
    }else{
        animate(".blur-overlay", {
            opacity:{to:"0", duration:300}
        })
        element.style.pointerEvents = "none";
    }
}
</script>

<template>
    <div class="blur-overlay" id="blur-overlay"/>
</template>

<style>
.blur-overlay{
    position: absolute;
    left: 0px;
    top:0px;
    /* box-shadow: 0 10px 20px rgba(0, 0, 0, .1); */
    opacity: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(20px);
    pointer-events: none;
}
</style>