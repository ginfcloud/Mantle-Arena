<script>
    import { slide } from 'svelte/transition';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import config from "$lib/config.js";

    // Props
    export let items = [];
    export let loading = false;
    export let squad = [{}, {}, {}];
    export let selected = {};
    export let showSelectedAtributes = [];
    export let selectedCollectionName = "";
    
    // Functions
    export let chooseSquad = () => {};
    export let getAttributes = async () => [];
    export let getEffect = () => "";

    // Loading items for skeleton
    let loadingItems1 = [{}, {}, {}, {}, {}];

    $: if (squad) {
        squad = squad;
    }
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
</svelte:head>

<style>
    ::-webkit-scrollbar { width: 0.4vw; }
    ::-webkit-scrollbar-track { background: #000; }
    ::-webkit-scrollbar-thumb { background: #059669; border-radius: 0.2vw; }
    ::-webkit-scrollbar-thumb:hover { background: #00ffa3; box-shadow: 0 0 0.6vw #00ffa3; }
    .loading {
        background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 0.5vw;
    }
    @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>

<div class="grid grid-cols-10 gap-[2vw] w-full" style="font-family: 'Cinzel', serif;">
    <div class="col-span-6 flex flex-col gap-[0.5vw]">
        <div data-onboard="choose-squad" class="flex flex-col border rounded-md overflow-hidden" style="border-color: rgba(0, 255, 163, 0.2);">
            <div class="flex flex-wrap rounded-md justify-start min-h-[16vw] max-h-[16vw] overflow-y-scroll bg-black/40 gap-[0.5vw] p-[1vw]" style="box-shadow: inset 0 0 1.2vw rgba(0, 0, 0, 0.9);">
                {#if items.length > 0 && !loading}
                    <div class="flex flex-wrap gap-[0.5vw] justify-start items-start">
                        {#each items as item}  
                            <button 
                                on:click={async () => {
                                    selected.id = item.id;
                                    selected.collection = item.collection;
                                    chooseSquad();
                                    const attributeResult = await getAttributes([{ collectionAddress: selected.collection, id: selected.id }]);
                                    showSelectedAtributes = attributeResult[0];
                                }} 
                                class="relative group overflow-hidden rounded-md cursor-pointer"
                                style="border: 0.15vw solid #00ffa3; box-shadow: 0 0 0.9vw rgba(0, 255, 163, 0.3);"
                            >
                                <img 
                                    alt="NFT" 
                                    class="bg-black w-[5vw] h-[5vw] object-cover transition-transform duration-500 group-hover:scale-110" 
                                    src={`${config.rpcUrl}/cdn/nft/${item.collection}/${item.id}/200/200`}
                                    onerror="this.onerror=null; this.src='/game/noImage.svg';"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#00ffa3]/20 to-transparent opacity-50"></div>
                                <div class="absolute top-[0.3vw] right-[0.3vw] w-[0.5vw] h-[0.5vw] rounded-full" style="background: #00ffa3; box-shadow: 0 0 0.3vw #00ffa3;"></div>
                            </button>
                        {/each}
                    </div>                          
                {:else if loading}
                    {#each loadingItems1 as loadItem} <div class="loading w-[5vw] h-[5vw]"></div> {/each}
                {:else if items.length === 0}
                    <div class="flex flex-col text-white m-auto items-center">
                        <span style="color: #cbd5e1;">Looks like you don't have any NFTs to battle with</span>
                        <button 
                            class="mt-[1vw] px-[2vw] py-[0.7vw] rounded-md text-white text-[0.8vw] relative overflow-hidden group"
                            style="border: 0.15vw solid #00ffa3; box-shadow: 0 0 0.9vw rgba(0, 255, 163, 0.3);"
                            on:click={() => {goto("./importnft")}}
                        >
                            <div class="absolute inset-0 bg-[#00ffa3]/10 group-hover:bg-[#00ffa3]/20 transition-colors"></div>
                            <span class="relative font-bold tracking-wide" style="font-family: 'Cinzel', serif;">Import & Generate skills for your NFT</span>
                        </button>
                    </div>
                {/if}
            </div>

            <div class="flex items-center py-[0.8vw] px-[1vw] gap-[2vw] bg-black/20" style="border-top: 0.1vw solid #292929;" >
                <span class="text-[1.3vw] font-bold text-white tracking-wide" style="font-family: 'Cinzel Decorative', cursive;">My Squad</span>
                <div class="flex gap-[1.5vw]">
                    {#if squad[0].id}
                        <button class="relative overflow-hidden rounded-md" style="border: 0.1vw solid rgba(0, 255, 163, 0.5); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);" on:click={() => {squad[0] = {}; squad = squad}} in:fade={{ duration: 300 }}>
                            <div class="hover:opacity-70 opacity-0 flex absolute bg-black justify-center items-center w-[5vw] h-[5vw] z-10 transition-opacity">
                                <i class="fa-solid fa-xmark text-[2vw]" style="color: #00ffa3;"></i>
                            </div>
                            <img class="bg-black w-[5vw] h-[5vw] object-cover" src={`${config.rpcUrl}/cdn/nft/${squad[0].collection}/${squad[0].id}/200/200`} onerror="this.onerror=null; this.src='/game/noImage.svg';"/>
                        </button>
                    {:else}
                        <div class="w-[5vw] h-[5vw] rounded-md border-[0.15vw] border-dashed flex items-center justify-center cursor-pointer transition-colors hover:bg-[#00ffa3]/10" style="border-color: #00ffa3; color: #00ffa3; background: rgba(0, 255, 163, 0.05); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);"><i class="fa-solid fa-question text-[2vw]"></i></div>
                    {/if}
                    {#if squad[1].id}
                        <button class="relative overflow-hidden rounded-md" style="border: 0.1vw solid rgba(0, 255, 163, 0.5); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);" on:click={() => {squad[1] = {}; squad = squad}} in:fade={{ duration: 300 }}>
                            <div class="hover:opacity-70 opacity-0 flex absolute bg-black justify-center items-center w-[5vw] h-[5vw] z-10 transition-opacity">
                                <i class="fa-solid fa-xmark text-[2vw]" style="color: #00ffa3;"></i>
                            </div>
                            <img class="bg-black w-[5vw] h-[5vw] object-cover" src={`${config.rpcUrl}/cdn/nft/${squad[1].collection}/${squad[1].id}/200/200`} onerror="this.onerror=null; this.src='/game/noImage.svg';"/>
                        </button>
                    {:else}
                        <div class="w-[5vw] h-[5vw] rounded-md border-[0.15vw] border-dashed flex items-center justify-center cursor-pointer transition-colors hover:bg-[#00ffa3]/10" style="border-color: #00ffa3; color: #00ffa3; background: rgba(0, 255, 163, 0.05); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);"><i class="fa-solid fa-question text-[2vw]"></i></div>
                    {/if}
                    {#if squad[2].id}
                        <button class="relative overflow-hidden rounded-md" style="border: 0.1vw solid rgba(0, 255, 163, 0.5); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);" on:click={() => {squad[2] = {}; squad = squad}} in:fade={{ duration: 300 }}>
                            <div class="hover:opacity-70 opacity-0 flex absolute bg-black justify-center items-center w-[5vw] h-[5vw] z-10 transition-opacity">
                                <i class="fa-solid fa-xmark text-[2vw]" style="color: #00ffa3;"></i>
                            </div>
                            <img class="bg-black w-[5vw] h-[5vw] object-cover" src={`${config.rpcUrl}/cdn/nft/${squad[2].collection}/${squad[2].id}/200/200`} onerror="this.onerror=null; this.src='/game/noImage.svg';"/>
                        </button>
                    {:else}
                        <div class="w-[5vw] h-[5vw] rounded-md border-[0.15vw] border-dashed flex items-center justify-center cursor-pointer transition-colors hover:bg-[#00ffa3]/10" style="border-color: #00ffa3; color: #00ffa3; background: rgba(0, 255, 163, 0.05); box-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.2);"><i class="fa-solid fa-question text-[2vw]"></i></div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <div class="col-span-4 flex flex-col justify-end">
        {#if selected.id}
            <div class="flex flex-col rounded-xl overflow-hidden relative group" style="background: url('https://www.transparenttextures.com/patterns/black-scales.png'), linear-gradient(to bottom, #1a1a1a, #0a0a0a); border: 0.1vw solid rgba(0, 255, 163, 0.2); box-shadow: 0 1.2vw 3vw -0.6vw rgba(0, 0, 0, 0.8), 0 0 0 0.06vw rgba(255, 255, 255, 0.05);" in:slide={{ duration: 300 }}>
                <div class="absolute -top-[6vw] -right-[6vw] w-[24vw] h-[24vw] rounded-full pointer-events-none z-0" style="background: rgba(0, 255, 163, 0.1); filter: blur(3vw);"></div>
                <div class="p-[1.5vw] flex flex-col items-center relative z-10 pb-[1vw]">
                    <div class="relative w-[8vw] h-[8vw] mb-[1vw]">
                        <div class="absolute -inset-[0.3vw] border rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style="border-color: rgba(0, 255, 163, 0.3);"></div>
                        <div class="absolute -inset-[0.3vw] rounded-md opacity-50" style="background: rgba(0, 255, 163, 0.2); filter: blur(0.8vw);"></div>
                        <div class="relative w-full h-full rounded-md overflow-hidden bg-black" style="border: 0.1vw solid rgba(0, 255, 163, 0.5); box-shadow: 0 0 0.9vw rgba(0, 255, 163, 0.3);">
                            <img alt="Selected NFT" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={`${config.rpcUrl}/cdn/nft/${selected.collection}/${selected.id}/200/200`} onerror="this.onerror=null; this.src='/game/noImage.svg';"/>
                        </div>
                        <div class="absolute -top-[0.06vw] -left-[0.06vw] w-[1.8vw] h-[1.8vw]" style="border-top: 0.15vw solid #00ffa3; border-left: 0.15vw solid #00ffa3;"></div>
                        <div class="absolute -top-[0.06vw] -right-[0.06vw] w-[1.8vw] h-[1.8vw]" style="border-top: 0.15vw solid #00ffa3; border-right: 0.15vw solid #00ffa3;"></div>
                        <div class="absolute -bottom-[0.06vw] -left-[0.06vw] w-[1.8vw] h-[1.8vw]" style="border-bottom: 0.15vw solid #00ffa3; border-left: 0.15vw solid #00ffa3;"></div>
                        <div class="absolute -bottom-[0.06vw] -right-[0.06vw] w-[1.8vw] h-[1.8vw]" style="border-bottom: 0.15vw solid #00ffa3; border-right: 0.15vw solid #00ffa3;"></div>
                    </div>
                    <div class="text-center">
                        <div class="text-[0.6vw] tracking-[0.2em] uppercase mb-[0.3vw]" style="color: #00ffa3; font-family: 'Lato', sans-serif;">{selectedCollectionName}</div>
                        <h2 class="text-[1vw] text-white font-bold tracking-widest leading-none" style="font-family: 'Cinzel Decorative', cursive; filter: drop-shadow(0 0.3vw 0.6vw rgba(0,0,0,0.5));">#{selected.id}</h2>
                    </div>
                </div>
                <div class="relative w-full flex items-center justify-center my-[0.3vw] z-10 px-[1.5vw]">
                    <div class="h-[0.06vw] flex-1" style="background: linear-gradient(to right, transparent, rgba(0, 255, 163, 0.3), transparent);"></div>
                    <div class="mx-[0.9vw] px-[0.9vw] py-[0.3vw] rounded backdrop-blur-sm" style="border: 0.06vw solid rgba(0, 255, 163, 0.2); background: rgba(0, 0, 0, 0.4);">
                        <span class="text-[0.6vw] font-bold tracking-[0.15em] uppercase" style="color: #00ffa3; font-family: 'Cinzel Decorative', cursive; text-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.6), 0 0 1.2vw rgba(0, 255, 163, 0.4);">Generated Skill</span>
                    </div>
                    <div class="h-[0.06vw] flex-1" style="background: linear-gradient(to right, transparent, rgba(0, 255, 163, 0.3), transparent);"></div>
                </div>
                <div class="overflow-y-auto px-[1.5vw] py-[0.8vw] space-y-[0.8vw] relative z-10 max-h-[10vw]">
                    {#each showSelectedAtributes as showSelectedAtribute}
                        <div class="bg-black/40 rounded-md p-[0.8vw] transition-colors hover:border-[rgba(0,255,163,0.4)]" style="border: 0.06vw solid #292929;">
                            <div class="flex justify-between items-center mb-[0.3vw]">
                                <h4 class="text-white font-bold text-[0.75vw] uppercase tracking-wider transition-colors hover:text-[#00ffa3]" style="font-family: 'Cinzel', serif;">{showSelectedAtribute}</h4>
                                <div class="flex items-center gap-[0.5vw] px-[0.5vw] py-[0.2vw] rounded-sm" style="background: rgba(28, 25, 23, 0.8); border: 0.06vw solid #292929;">
                                    <span class="text-[0.5vw] font-bold uppercase" style="color: #78716c; font-family: 'Lato', sans-serif;">Activation Rate</span>
                                    <span class="text-[0.65vw] font-mono font-bold" style="color: #00ffa3;">{(100/showSelectedAtributes.length).toFixed(2)}%</span>
                                </div>
                            </div>
                            <p class="text-[0.7vw] leading-relaxed italic" style="color: #9ca3af; font-family: 'Lato', sans-serif;">"{getEffect(selected.collection, showSelectedAtribute)}"</p>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>