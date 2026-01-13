<script>
    import { fade, slide } from 'svelte/transition';
    import { musicManager, musicEnabled} from '$lib/music';
    //props
    export let navigation;
    import { trackButtonClick, resetEvents, onboardingEvents } from '$lib/onboarding/onboardingEvents.js';
    import { goto } from '$app/navigation';

</script>

<div class="absolute font-geo flex flex-col bg-black w-full h-full justify-center items-center justify-center font-semibold inset-0 font-geo" 
    in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
    <div class="relative flex w-full h-full overflow-hidden ">
        <!--Background-->
        <img class="absolute object-cover w-full mt-[-7vw]" src="/game/hall/hall.webp" draggable="false"/>
        <button data-onboard="pvp-button" class="absolute flex h-[26vw] left-[38vw] top-[2vw] shrinkHover1" 
        on:click={()=>{
            navigation = "pvpMode"; navigation = navigation; trackButtonClick('pvp-button')}}>
            <div class="strongGlow rounded-full left-[14vw] top-[9vw] absolute h-[1vw] w-[1vw] mt-[1.2vw] z-[0]"></div>
            <img class=" object-cover h-full w-full z-[0] " src="/game/hall/pvpMode.webp" draggable="false"/>
            <span class="text-game-hall absolute w-[20vw] right-[5vw] top-[4vw] text-[2.5vw] z-[0]">
                PVP MODE
            </span>
        </button>
        <button data-onboard="training-button" 
        class="absolute flex h-[14vw] left-[10vw] bottom-[6vw] shrinkHover1"
            on:click={()=>{
                navigation = "trainingRoom";
                navigation = navigation
                trackButtonClick('training-button');
                }}>
            <div class=" rounded-full left-[14vw] top-[9vw] absolute h-[1vw] w-[1vw] mt-[1.2vw] z-[0]"></div>
            <img class="object-cover h-full w-full z-[0]" src="/game/hall/trainingMode.webp" draggable="false" />
            <span class="absolute text-game-hall inset-0 w-[20vw] top-[-1vw] text-[2.5vw] z-[0]">Training</span>

        </button>
        <button class="absolute flex h-[18vw] right-[8vw] bottom-[6vw] shrinkHover1"
          on:click={()=>{
                    goto("./importnft")
                }}>
            <img class="object-cover h-full w-full" src="/game/hall/botMode.webp" draggable="false"/>
            <span class="absolute text-game-hall inset-0 w-[20vw] top-[1vw] text-[2vw]">Import your NFT</span>
        </button>
    </div>
</div>