<script>
    import { slide } from 'svelte/transition';
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { emitBetweenText } from '$lib/index.js';
    import config from "$lib/config.js";
    import Loading from "$lib/Loading.svelte";
    import SelectSquad from "$lib/SelectSquad.svelte";

    export let address;
    export let matches;
    export let squad;
    export let withdrawList;
    export let battleHistory;
    export let challengeUsed;
    export let challengePerDay;
    export let resetChallengeHours;
    export let resetChallengeMinutes;
    export let items;
    export let loading;
    export let selected;
    export let showSelectedAtributes;
    export let selectedCollectionName;
    
    export let getMatches;
    export let loadQueue;
    export let challenge;
    export let delistBattle;
    export let claimBattleWinnings;
    export let getAttributes;
    export let chooseSquad;
    export let getEffect;

    let matchPopUp = false;
    let challengePopUp = false;
    let withDrawPopUp = false;
    let inputStake;
    let selectedChallengeTarget = "";
    let selectedChallengeId = "";
    let selectedStakeDisplay;
    let popupLoading = false;
    let error = false;
    let errorOutChallenge = false;
    let generalError = false;
    let generalErrorValue = "Error";
    let copiedBattleId = null
    // PvP-specific functions
    function checkSquad() {
        if (!squad[0].id || !squad[1].id || !squad[2].id) {
            error = true;
        }
    }

    function checkOutChallenge() {
        if (challengeUsed >= challengePerDay) {
            errorOutChallenge = true;
        }
    }

    function calculateTotalWithdrawable() {
        if (!withdrawList || withdrawList.length === 0) {
            return 0;
        }
        return withdrawList.reduce((total, item) => total + (item.value * 2), 0);
    }

    function formatTimeLeftBattle(timestamp) {
        let milliseconds = Date.now() - timestamp;
        let totalSeconds = Math.floor(milliseconds / 1000);
        let totalMinutes = Math.floor(totalSeconds / 60);
        let totalHours = Math.floor(totalMinutes / 60);
        let totalDays = Math.floor(totalHours / 24);
        let totalWeeks = Math.floor(totalDays / 7);
        
        if (totalWeeks > 0) {
            return `${totalWeeks} week${totalWeeks > 1 ? 's' : ''} ago`;
        } else if (totalDays > 0) {
            return `${totalDays} day${totalDays > 1 ? 's' : ''} ago`;
        } else if (totalHours > 0) {
            return `${totalHours} hour${totalHours > 1 ? 's' : ''} ago`;
        } else if (totalMinutes > 0) {
            return `${totalMinutes} minute${totalMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    async function copyBattleLink(battleID) {
        try {
            await navigator.clipboard.writeText(`https://marena.space/${battleID}`);
            copiedBattleId = battleID;
            setTimeout(() => {
                copiedBattleId = null;
            }, 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    }
    
    setInterval(() => {
        if(error === true) {
            setTimeout(() => { error = false }, 2000);
        }
        if(errorOutChallenge === true) {
            setTimeout(() => { errorOutChallenge = false }, 2000);
        }
        if(generalError === true) {
            setTimeout(() => { generalError = false; generalErrorValue = "Error" }, 3000);
        }
    }, 100);
    
</script>



<svelte:head>
    
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>

    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>

    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
</svelte:head>

<style>
        :global(body) {
        --primary: #00ffa3;
        --primary-dim: #059669;
        --secondary: #bbf7d0;
        --background-dark: #020402;
        --obsidian: #111111;
        --obsidian-light: #1a1a1a;
        --iron: #292524;
        --iron-dark: #1c1917;
        --silver: #cbd5e1;
    }



    .text-shadow-mint {
        text-shadow: 0 0 1vw rgba(0, 255, 163, 0.6), 0 0 2vw rgba(0, 255, 163, 0.4);
    }

    .shadow-glow-mint {
        box-shadow: 0 0 1.5vw rgba(0, 255, 163, 0.3);
    }

    .shadow-tablet-raised {
        box-shadow: 0 2vw 5vw -1vw rgba(0, 0, 0, 0.8), 0 0 0 0.1vw rgba(255, 255, 255, 0.05);
    }

    @keyframes ember {
        0% { 
            transform: translateY(100vh) scale(0); 
            opacity: 0;
        }
        50% { 
            opacity: 1;
        }
        100% { 
            transform: translateY(-10vh) scale(1); 
            opacity: 0;
        }
    }

    /* Font Awesome icon override for swords */
    :global(.fa-swords::before) {
        content: "\2694"; /* Unicode for crossed swords if fa-swords doesn't exist */
    }


    :global(.hide-scrollbar::-webkit-scrollbar) {
        width: 0.3vw;
    }
    :global(.hide-scrollbar::-webkit-scrollbar-track) {
        background: #000;
    }
    :global(.hide-scrollbar::-webkit-scrollbar-thumb) {
        background: #059669;
        border-radius: 0.15vw;
    }
    :global(.hide-scrollbar::-webkit-scrollbar-thumb:hover) {
        background: #00ffa3;
        box-shadow: 0 0 0.5vw #00ffa3;
    }
    
    .text-shadow-mint {
        text-shadow: 0 0 0.5vw rgba(0, 255, 163, 0.6), 0 0 1vw rgba(0, 255, 163, 0.4);
    }
    
    .text-shadow-fire {
        text-shadow: 0 0 0.25vw rgba(0,0,0,0.8);
    }
    
    .crystal-btn {
        background: radial-gradient(circle at 30% 30%, rgba(200, 255, 230, 0.8) 0%, transparent 20%), linear-gradient(135deg, #00ffa3 0%, #064e3b 100%);
        border: 0.05vw solid #bbf7d0;
    }
    
    .obsidian-texture {
        background: url('https://www.transparenttextures.com/patterns/black-scales.png'), linear-gradient(to bottom, #1a1a1a, #0a0a0a);
    }
    
    .glow-border-run {
        animation: glow-pulse 2s ease-in-out infinite;
    }
    
    .glow-border-run-red {
        animation: glow-pulse-red 2s ease-in-out infinite;
    }
    
    @keyframes glow-pulse {
        0%, 100% {
            box-shadow: 0 0 0.5vw rgba(0, 255, 163, 0.3);
        }
        50% {
            box-shadow: 0 0 1vw rgba(0, 255, 163, 0.6);
        }
    }
    
    @keyframes glow-pulse-red {
        0%, 100% {
            box-shadow: 0 0 0.5vw rgba(239, 68, 68, 0.4);
        }
        50% {
            box-shadow: 0 0 1vw rgba(239, 68, 68, 0.7);
        }
    }
</style>

<div class="flex justify-center gap-[4vw] mt-[1vw] z-10 pl-[1vw] mt-[6vw] min-h-[31vw] max-h-[31vw] " in:fade={{ duration: 300 }}>
    <div class="h-full min-h-[31vw] min-w-[40vw] flex flex-col relative rounded-lg border border-[#00ffa3]/20 obsidian-texture shadow-[0_0_0.75vw_rgba(0,255,163,0.15),inset_0_0_1vw_rgba(0,0,0,0.8)] overflow-hidden">
        <div class="absolute inset-0 bg-black/40 z-0"></div>
        
        <div class="relative z-10 p-[1vw] flex justify-between items-center border-b border-white/5 bg-black/20 shrink-0">
            <div class="absolute top-0 left-0 w-[1.5vw] h-[1.5vw] border-t-[0.1vw] border-l-[0.1vw] border-[#00ffa3]/60 rounded-tl-sm"></div>
            <div class="absolute top-0 right-0 w-[1.5vw] h-[1.5vw] border-t-[0.1vw] border-r-[0.1vw] border-[#00ffa3]/60 rounded-tr-sm"></div>
            
            <span class="font-['Cinzel_Decorative'] text-[#00ffa3] tracking-[0.2vw] text-[1vw] drop-shadow-sm">
                <i class="fa-solid fa-scroll mr-[0.4vw] text-[0.8vw] opacity-70"></i>Arena Matches
            </span>

            <button class="text-stone-600 hover:text-[#00ffa3] transition-colors hover:rotate-180 duration-700" on:click={getMatches}>
                <i class="fa-solid fa-arrows-rotate text-[1.2vw]"></i>
            </button>
        </div>
        
        <div class="relative z-10 flex-grow flex flex-col overflow-hidden">
            <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWxGpi_jER3ZYLx83p0IOoPeYVfX3Qjt3aYsMQ8vs_Uxs0A-nMPPYyJmHqk1uZwacsf9u54D6qrnvVQJVLtpamesV4WtGD_gZr8QvYscKNMKXZLI0D0T7rojYE6n5NFU_CmFhWxPXPVgTK_yg0lLJvTJiD8Zh2O0y7dCE_6wdssBhgfURASl5uVdKHBRpCoMg7RWZ0tz3AqD6zl6g93Si05nPlAAqSAhtH4Nf_frxReOXbD8dKjnLln-pEu_Ff6XEed9ddupD6dxo0'); background-size: cover; background-position: center;"></div>
            
            <div class="flex-1 overflow-y-auto p-[0.8vw] space-y-[0.5vw] hide-scrollbar z-10 min-h-[25vw] max-h-[25vw]">
                {#if matches.length > 0}
                    {#each matches.filter(match => address !== match.daddress) as match, index}
                        <div class="group flex items-center justify-between p-[0.8vw] bg-black/40 border border-stone-800 rounded-lg hover:border-[#00ffa3]/50 hover:bg-stone-900/60 transition-all duration-300">
                            <div class="flex items-center space-x-[0.8vw]">
                                <div class="w-[2vw] h-[2vw] rounded bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500 group-hover:text-[#00ffa3] group-hover:border-[#00ffa3]/30 transition-colors">
                                    <i class="fa-solid fa-user-ninja text-[1vw]"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-stone-300 font-mono text-[0.8vw] group-hover:text-white transition-colors">{emitBetweenText(match.daddress, 10)}</span>
                                    <span class="text-[0.5vw] text-stone-600 uppercase tracking-[0.15vw] font-bold">Defender</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-[1.2vw]">
                                <div class="flex items-center text-[#059669] bg-black/30 px-[0.6vw] py-[0.3vw] rounded border border-white/5">
                                    <img class="h-[0.8vw] inline mr-[0.2vw]" alt="currency" src="/icons/token.png"/>
                                    <span class="font-mono font-bold text-[#cbd5e1] text-[0.8vw]">{match.value}</span>
                                </div>
                                <button on:click={() => {
                                    selectedChallengeTarget = match.daddress;
                                    selectedChallengeId = match.battleID;
                                    selectedStakeDisplay = match.value;
                                    challengePopUp = true;
                                }} class="bg-[#00ffa3] text-black font-bold text-[0.7vw] px-[1.2vw] py-[0.5vw] rounded shadow-[0_0_0.75vw_rgba(0,255,163,0.2)] hover:bg-white hover:shadow-[0_0_1.25vw_rgba(0,255,163,0.5)] transition-all tracking-wider font-['Cinzel_Decorative'] transform hover:scale-105">
                                    FIGHT
                                </button>
                            </div>
                        </div>
                    {/each}
                    
                    {#if matches.filter(match => address === match.daddress).length > 0}
                        <div class="p-[0.8vw] bg-gradient-to-t from-black via-stone-950 to-stone-900/90 border-t border-stone-800 shadow-[0_-0.25vw_1vw_rgba(0,0,0,0.7)] rounded-lg mt-[0.5vw]">
                            {#each matches.filter(match => address === match.daddress) as match, index}
                                <div class="flex items-center justify-between p-[0.8vw] bg-stone-900/50 border border-stone-700/50 rounded-lg relative overflow-hidden group mb-[0.5vw] last:mb-0">
                                    <div class="absolute left-0 top-0 bottom-0 w-[0.1vw] bg-stone-500 group-hover:bg-[#00ffa3] transition-colors duration-500"></div>
                                    <div class="absolute inset-0 bg-[#00ffa3]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none"></div>
                                    
                                    <div class="flex items-center space-x-[0.8vw] pl-[0.4vw] relative z-10">
                                        <div class="w-[2vw] h-[2vw] rounded bg-stone-800 border border-stone-600 flex items-center justify-center text-stone-400">
                                            <i class="fa-solid fa-user-shield text-[1vw]"></i>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-white font-mono text-[0.8vw] tracking-wide">Mine</span>
                                            <div class="flex items-center mt-[0.1vw]">
                                                <span class="w-[0.3vw] h-[0.3vw] rounded-full bg-[#00ffa3] animate-pulse mr-[0.3vw]"></span>
                                                <span class="text-[0.5vw] text-[#00ffa3] uppercase tracking-[0.15vw] font-bold">Waiting for opponent...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-[1.2vw] relative z-10">
                                        <div class="flex items-center text-stone-400 group-hover:text-stone-300 transition-colors">
                                            <img class="h-[0.8vw] inline mr-[0.2vw]" alt="currency" src="/icons/token.png"/>
                                            <span class="font-mono font-bold text-[#cbd5e1] text-[0.8vw]">{match.value}</span>
                                        </div>
                                        <button class="border border-red-900/60 text-red-500 hover:text-red-400 hover:border-red-500 bg-red-950/20 font-bold text-[0.7vw] px-[1.2vw] py-[0.5vw] rounded transition-all tracking-wider font-['Cinzel_Decorative'] hover:shadow-[0_0_0.5vw_rgba(239,68,68,0.2)]"
                                        on:click={() => delistBattle(address, match.battleID)}>
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {:else}
                    <div class="flex items-center justify-center h-full">
                        <span class="text-[1vw] text-stone-400 font-['Cinzel']">
                            There are no defenders now, let's create a match
                        </span>
                    </div>
                {/if}
            </div>
        </div>
        
        <div class="absolute bottom-0 left-0 w-full h-[0.1vw] bg-gradient-to-r from-transparent via-[#00ffa3]/50 to-transparent"></div>
    </div>
    
    <div class="flex flex-col space-y-[2vw] min-w-[30vw]">
        <div class="text-left space-y-[0.4vw] relative pl-[1.2vw] border-l-[0.2vw] border-[#00ffa3]/50">
            <h1 class="text-[3.5vw] font-['Cinzel_Decorative'] font-black text-white text-shadow-mint tracking-tighter uppercase leading-none">
                PVP <span class="text-[#059669]">MODE</span>
            </h1>
            <p class="font-['Lato'] text-stone-400 text-[1vw] italic mt-[0.4vw]">
                Solo 1v1, winner take staked <span class="text-[#00ffa3] font-bold drop-shadow-[0_0_0.4vw_rgba(0,255,163,0.8)]">${config.nativeCurrency.name}</span> from loser
            </p>
        </div>
        
        <div class="bg-[#1c1917] border border-stone-700 rounded-lg px-[1.2vw] py-[1vw] shadow-lg flex items-center w-full relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffa3]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div class="z-10 w-full flex items-center justify-between">
                <div class="flex items-center space-x-[0.8vw]">
                    <div class="w-[2vw] h-[2vw] rounded bg-stone-900 border border-stone-800 flex items-center justify-center">
                        <i class="fa-solid fa-fire-burner text-stone-500 text-[1vw]"></i>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[0.5vw] uppercase tracking-[0.12vw] text-stone-500 font-bold leading-none mb-[0.2vw]">Challenged</span>
                        <span class="font-mono text-[#00ffa3] text-[1.2vw] font-bold leading-none">{challengeUsed}<span class="text-stone-600 text-[1vw]">/</span>{challengePerDay}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end border-l border-stone-800 pl-[0.8vw]">
                    <span class="text-[0.5vw] text-stone-600 font-['Lato'] uppercase tracking-wider mb-[0.2vw]">Reset Timer</span>
                    <span class="text-[0.8vw] text-stone-300 font-mono font-bold tracking-wide">{resetChallengeHours}h:{resetChallengeMinutes}m</span>
                </div>
            </div>
        </div>
        
        <div class="relative w-full group h-[6vw] flex justify-center items-center">
            <div class="absolute inset-0 bg-[#292524] border-[0.1vw] border-stone-600 rounded-xl transform scale-105 shadow-[inset_0_0.05vw_0_rgba(255,255,255,0.1),0_0.25vw_0.5vw_rgba(0,0,0,0.9)]"></div>
            <button class="relative w-full h-full crystal-btn rounded-lg shadow-[0_0_1.5vw_rgba(0,255,163,0.6),inset_0_0.1vw_0.25vw_rgba(255,255,255,0.4),inset_0_-0.1vw_0.25vw_rgba(0,0,0,0.4)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center overflow-hidden z-10 group-hover:shadow-[0_0_2.5vw_rgba(0,255,163,0.4)] glow-border-run"
            on:click={() => { matchPopUp = true }}>
                <div class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
                <div class="flex items-center justify-center w-full px-[2vw] relative z-20">
                    <div class="flex flex-col items-center">
                        <span class="font-['Cinzel_Decorative'] text-[1.5vw] text-white tracking-[0.06vw] font-black text-shadow-fire">CREATE A MATCH</span>
                        <div class="flex items-center space-x-[0.4vw] mt-[0.2vw] opacity-80">
                            <span class="h-[0.05vw] w-[1.6vw] bg-emerald-900/50"></span>
                            <i class="fa-solid fa-diamond text-[0.5vw] text-emerald-900"></i>
                            <span class="h-[0.05vw] w-[1.6vw] bg-emerald-900/50"></span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
        
        <div class="relative mt-[0.8vw]">
            <div class="flex justify-between items-end mb-[0.4vw] px-[0.2vw] border-b border-stone-800 pb-[0.4vw]">
                <span class="text-stone-400 font-['Cinzel_Decorative'] text-[0.8vw] tracking-wide flex items-center">
                    <i class="fa-solid fa-scroll mr-[0.4vw] text-[#00ffa3]/70 text-[0.7vw]"></i>
                    Your recent battle history <span class="text-gray-300 text-[0.6vw] ml-[0.3vw]">(30days)</span>
                </span>
                <button class="text-[0.6vw] border border-stone-700 text-stone-400 hover:border-[#00ffa3] hover:text-[#00ffa3] px-[0.8vw] py-[0.3vw] rounded bg-black/40 transition-all uppercase font-bold tracking-wider hover:shadow-[0_0_0.75vw_rgba(0,255,163,0.3)] flex items-center gap-[0.3vw] relative"
                on:click={() => { withDrawPopUp = true }}>
                    <span>Withdraw rewards</span>
                    {#if withdrawList?.length > 0}
                        <div class="flex items-center justify-center bg-red-600 w-[0.8vw] h-[0.8vw] rounded-full text-[0.4vw] glow-border-run-red"></div>
                    {/if}
                </button>
            </div>
            
            <div class="bg-stone-900/60 backdrop-blur-sm border border-stone-800 p-[0.4vw] h-[9.6vw] overflow-y-auto rounded-lg hide-scrollbar relative shadow-[inset_0_0_0.5vw_rgba(0,0,0,0.5)]">
                {#if battleHistory.length > 0}
                    {#each battleHistory as battle}
                        <div class="flex items-center justify-between text-[0.7vw] py-[0.6vw] border-b border-stone-800/50 font-['Lato'] group hover:bg-white/5 px-[0.6vw] rounded transition-colors mb-[0.2vw]">
                            <div class="flex items-center space-x-[0.6vw]">
                                <div class="w-[1.6vw] h-[1.6vw] rounded bg-stone-800 flex items-center justify-center border border-stone-700 group-hover:border-[#00ffa3]/50 transition-colors">
                                    {#if (battle.winner === 1 && battle.caddress == address) || (battle.winner === 2 && battle.daddress == address)}
                                        <i class="fa-solid fa-trophy text-[#00ffa3] text-[0.8vw]"></i>
                                    {:else if (battle.winner === 2 && battle.caddress == address) || (battle.winner === 1 && battle.daddress == address)}
                                        <i class="fa-solid fa-skull-crossbones text-stone-500 text-[0.8vw]"></i>
                                    {:else if battle.winner === -1}
                                        <i class="fa-solid fa-handshake text-stone-400 text-[0.8vw]"></i>
                                    {/if}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-stone-500 text-[0.5vw] uppercase font-bold">
                                        {#if battle?.timestamp}
                                            {formatTimeLeftBattle(battle.timestamp)}
                                        {:else}
                                            ...
                                        {/if}
                                    </span>
                                    <div class="flex items-center mt-[0.2vw]">
                                        {#if (battle.caddress == address)}
                                            <span class="text-stone-400 font-mono text-[0.65vw]">
                                                You challenge <span class="text-[#00ffa3] font-bold">{emitBetweenText(battle.daddress, 10)}</span>
                                            </span>
                                        {:else if (battle.daddress == address)}
                                            <span class="text-stone-400 font-mono text-[0.65vw]">
                                                You defend <span class="text-[#00ffa3] font-bold">{emitBetweenText(battle.caddress, 10)}</span>
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                            <div class="text-right flex flex-col items-end">
                                {#if (battle.winner === 1 && battle.caddress == address) || (battle.winner === 2 && battle.daddress == address)}
                                    <span class="text-[#00ffa3] font-mono font-bold block text-shadow-mint mb-[0.2vw] flex items-center gap-[0.2vw]">
                                        <span>+ {battle.stake}</span>
                                        <img class="h-[0.8vw]" alt="currency" src="/icons/token.png"/>
                                    </span>
                                {:else if (battle.winner === 2 && battle.caddress == address) || (battle.winner === 1 && battle.daddress == address)}
                                    <span class="text-stone-500 font-mono font-bold block mb-[0.2vw] flex items-center gap-[0.2vw]">
                                        <span>- {battle.stake}</span>
                                        <img class="h-[0.8vw]" alt="currency" src="/icons/token.png"/>
                                    </span>
                                {:else if battle.winner === -1}
                                    <span class="text-white font-mono font-bold block mb-[0.2vw] flex items-center gap-[0.2vw]">
                                        <span>0</span>
                                        <img class="h-[0.8vw]" alt="currency" src="/icons/token.png"/>
                                    </span>
                                {/if}
                                <div class="flex space-x-[0.4vw]">
                                    <button class="bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-600 text-[0.55vw] text-stone-300 px-[0.4vw] py-[0.1vw] rounded shadow-md hover:border-[#00ffa3]/50 hover:text-white transition-all uppercase tracking-wider font-bold hover:shadow-[0_0_0.75vw_rgba(0,255,163,0.3)]"
                                    on:click={goto(`/${battle.battleID}`)}>WATCH</button>
                                    <button class="bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-600 text-[0.55vw] text-stone-300 px-[0.4vw] py-[0.1vw] rounded shadow-md hover:border-[#00ffa3]/50 hover:text-white transition-all uppercase tracking-wider font-bold hover:shadow-[0_0_0.75vw_rgba(0,255,163,0.3)]"
                                    on:click={() => copyBattleLink(battle.battleID)}>{copiedBattleId === battle.battleID ? 'Copied' : 'Share'}</button>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else if battleHistory.length === 0}
                    <div class="flex flex-col items-center justify-center text-[0.8vw] text-stone-400 font-['Cinzel'] h-full">
                        Looks like you haven't had any PvP battles yet
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

{#if matchPopUp}
    <div class="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
        <div class="fixed inset-0 pointer-events-none z-0" style="background: radial-gradient(circle at center, rgba(0,255,163,0.05) 0%, rgba(0,0,0,0.95) 80%);"></div>
        
        <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[10%]" style="background: #00ffa3; filter: blur(0.1vw); animation: ember 8s linear infinite;"></div>
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[20%]" style="background: rgba(0,255,163,0.6); filter: blur(0.1vw); animation: ember 12s linear infinite; animation-delay: 2s;"></div>
            <div class="absolute w-[0.4vw] h-[0.4vw] rounded-full left-[60%]" style="background: rgba(0,255,163,0.4); filter: blur(0.2vw); animation: ember 10s linear infinite; animation-delay: 4s;"></div>
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[85%]" style="background: rgba(0,255,163,0.8); filter: blur(0.1vw); animation: ember 9s linear infinite; animation-delay: 1s;"></div>
        </div>

        <div class="relative z-20 w-full max-w-[86vw] mx-auto">
            <div class="relative rounded-xl overflow-hidden" style="background: url('https://www.transparenttextures.com/patterns/black-scales.png'), linear-gradient(to bottom, #1a1a1a, #0a0a0a); border: 0.1vw solid rgba(0, 255, 163, 0.2); box-shadow: 0 1.2vw 3vw -0.6vw rgba(0, 0, 0, 0.8), 0 0 0 0.06vw rgba(255, 255, 255, 0.05);">
                <div class="px-[2vw] py-[1.2vw] flex justify-between items-center relative" style="border-bottom: 0.1vw solid rgba(0, 255, 163, 0.2); background: rgba(0, 0, 0, 0.4);">
                    <div class="absolute inset-x-0 bottom-0 h-[0.06vw]" style="background: linear-gradient(to right, transparent, rgba(0, 255, 163, 0.5), transparent);"></div>
                    <div>
                        <h1 class="text-[1.2vw] text-white font-bold tracking-wider leading-none" >
                            Choose your <span style="color: #00ffa3; text-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.6), 0 0 1.2vw rgba(0, 255, 163, 0.4);">NFT</span>
                        </h1>
                        <p class="text-[0.75vw] mt-[0.3vw]" style="color: #78716c; font-family: 'Lato', sans-serif;">You can choose duplicated NFTs for your match</p>
                    </div>
                    <button class="transition-colors transform hover:rotate-90 duration-300" style="color: #9ca3af;" on:click={() => { matchPopUp = false }}>
                        <i class="fa-solid fa-xmark text-[2vw] hover:text-[#00ffa3]"></i>
                    </button>
                </div>

                <div class="p-[2vw]">
                    <SelectSquad 
                        {items}
                        {loading}
                        bind:squad
                        bind:selected
                        bind:showSelectedAtributes
                        {selectedCollectionName}
                        {chooseSquad}
                        {getAttributes}
                        {getEffect}
                    />

                    <div class="flex flex-col items-center gap-[1.5vw] mt-[2vw]">
                        <div class="flex items-center gap-[1vw] px-[2vw] py-[0.4vw] rounded-md w-fit justify-center" style="background: rgba(0, 0, 0, 0.6); border: 0.1vw solid #292929; box-shadow: inset 0 0 1.2vw rgba(0,0,0,0.8);">
                            <span class="font-bold text-[1vw]" style="color: #d1d5db; cursive;">Stake :</span>
                            <input 
                                bind:value={inputStake} 
                                type="number" 
                                max="100" 
                                min="0" 
                                class="w-[8vw] text-center text-white font-mono py-[0.3vw] px-[0.5vw] outline-none transition-all text-[1vw] rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                style="background: #292524; border: 0.1vw solid #44403c;"
                                placeholder="0"
                                on:input={(e) => {
                                    if (parseFloat(e.target.value) > 100) {
                                        inputStake = "100";
                                    }
                                }}
                                on:focus={(e) => {e.target.style.borderColor = '#00ffa3'; e.target.style.boxShadow = '0 0 0 0.1vw rgba(0,255,163,0.5)';}}
                                on:blur={(e) => {e.target.style.borderColor = '#44403c'; e.target.style.boxShadow = 'none';}}
                            />
                            <span class="font-bold text-[1vw]" style="color: #d1d5db, cursive;">${config.nativeCurrency.name}</span>
                        </div>
                        
                        <p class="text-[0.65vw] text-center -mt-[1vw]" style="color: #57534e; font-family: 'Lato', sans-serif;">In this phase, the maximum stake per match is 100 $MNT</p>

                        <button 
                            on:click={() => {
                                checkSquad();
                                if (!error) {
                                    loadQueue(squad, address, inputStake);
                                }
                            }} 
                            class="w-full max-w-[50vw] group relative px-[2vw] py-[0.6vw] bg-transparent overflow-hidden rounded-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div class="absolute inset-0 rounded-md" style="border: 0.1vw solid #00ffa3; box-shadow: 0 0 0.9vw rgba(0, 255, 163, 0.3);"></div>
                            <div class="absolute inset-0 bg-[#00ffa3]/10 group-hover:bg-[#00ffa3]/20 transition-colors"></div>
                            <div class="relative flex items-center justify-center gap-[1vw]">
                                <i class="fa-solid fa-swords text-[1.5vw]" style="color: #00ffa3; filter: drop-shadow(0 0.2vw 0.4vw rgba(0,0,0,0.8));"></i>
                                <span class="font-bold text-[1.1vw] text-white tracking-[0.1em] uppercase group-hover:text-[#00ffa3] transition-colors" style="font-family: 'Cinzel Decorative', cursive;">Create a Match</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if challengePopUp}
    <div class="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
        <div class="fixed inset-0 pointer-events-none z-0" style="background: radial-gradient(circle at center, rgba(0,255,163,0.05) 0%, rgba(0,0,0,0.95) 80%);"></div>
        
        <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[10%]" style="background: #00ffa3; filter: blur(0.1vw); animation: ember 8s linear infinite;"></div>
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[20%]" style="background: rgba(0,255,163,0.6); filter: blur(0.1vw); animation: ember 12s linear infinite; animation-delay: 2s;"></div>
            <div class="absolute w-[0.4vw] h-[0.4vw] rounded-full left-[60%]" style="background: rgba(0,255,163,0.4); filter: blur(0.2vw); animation: ember 10s linear infinite; animation-delay: 4s;"></div>
            <div class="absolute w-[0.3vw] h-[0.3vw] rounded-full left-[85%]" style="background: rgba(0,255,163,0.8); filter: blur(0.1vw); animation: ember 9s linear infinite; animation-delay: 1s;"></div>
        </div>

        <div class="relative z-20 w-full max-w-[86vw] mx-auto">
            <div class="relative rounded-xl overflow-hidden" style="background: url('https://www.transparenttextures.com/patterns/black-scales.png'), linear-gradient(to bottom, #1a1a1a, #0a0a0a); border: 0.1vw solid rgba(0, 255, 163, 0.2); box-shadow: 0 1.2vw 3vw -0.6vw rgba(0, 0, 0, 0.8), 0 0 0 0.06vw rgba(255, 255, 255, 0.05);">
                <div class="px-[2vw] py-[1.2vw] flex justify-between items-center relative" style="border-bottom: 0.1vw solid rgba(0, 255, 163, 0.2); background: rgba(0, 0, 0, 0.4);">
                    <div class="absolute inset-x-0 bottom-0 h-[0.06vw]" style="background: linear-gradient(to right, transparent, rgba(0, 255, 163, 0.5), transparent);"></div>
                    <div>
                        <h1 class="text-[1.2vw] text-white font-bold tracking-wider leading-none" >
                            Choose your <span style="color: #00ffa3; text-shadow: 0 0 0.6vw rgba(0, 255, 163, 0.6), 0 0 1.2vw rgba(0, 255, 163, 0.4);">NFT</span>
                        </h1>
                        <p class="text-[0.75vw] mt-[0.3vw]" style="color: #78716c; font-family: 'Lato', sans-serif;">You can choose duplicated NFTs for your match</p>
                    </div>
                    <button class="transition-colors transform hover:rotate-90 duration-300" style="color: #9ca3af;" on:click={()=>{ challengePopUp = false; selectedChallengeTarget = ""; selectedChallengeId=""; selectedStakeDisplay = "";}}>
                        <i class="fa-solid fa-xmark text-[2vw] hover:text-[#00ffa3]"></i>
                    </button>
                </div>

                <div class="p-[2vw]">
                    <SelectSquad 
                        {items}
                        {loading}
                        bind:squad
                        bind:selected
                        bind:showSelectedAtributes
                        {selectedCollectionName}
                        {chooseSquad}
                        {getAttributes}
                        {getEffect}
                    />

                    <div class="flex flex-col items-center gap-[1.5vw] mt-[2vw]">
                        <div class="flex gap-[1vw] items-center">
                            <div class="flex items-center gap-[0.6vw] px-[1.5vw] py-[0.4vw] rounded-md" style="background: rgba(0, 0, 0, 0.6); border: 0.1vw solid #292929; box-shadow: inset 0 0 1.2vw rgba(0,0,0,0.8);">
                                <i class="fa-solid fa-swords text-[1.2vw]" style="color: #00ffa3;"></i>
                                <span class="text-[1vw]" style="color: #d1d5db;">Challenge</span>
                                <span class="text-[1vw] font-bold" style="color: #00ffa3;">{emitBetweenText(selectedChallengeTarget,10)}</span>
                            </div>
                            
                            <div class="flex items-center gap-[0.6vw] px-[1.5vw] py-[0.4vw] rounded-md" style="background: rgba(0, 0, 0, 0.6); border: 0.1vw solid #292929; box-shadow: inset 0 0 1.2vw rgba(0,0,0,0.8);">
                                <span class="text-[1vw]" style="color: #d1d5db;">Stake :</span>
                                <span class="text-[1vw] font-bold" style="color: #00ffa3;">{selectedStakeDisplay} {config.nativeCurrency.name}</span>
                            </div>
                        </div>

                        <button 
                            on:click={() => {
                                checkSquad();
                                checkOutChallenge();
                                if (!error&&!errorOutChallenge) {
                                    challenge(squad, address, selectedChallengeTarget, selectedChallengeId);
                                }
                            }} 
                            class="w-full max-w-[50vw] group relative px-[2vw] py-[0.6vw] bg-transparent overflow-hidden rounded-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div class="absolute inset-0 rounded-md" style="border: 0.1vw solid #00ffa3; box-shadow: 0 0 0.9vw rgba(0, 255, 163, 0.3);"></div>
                            <div class="absolute inset-0 bg-[#00ffa3]/10 group-hover:bg-[#00ffa3]/20 transition-colors"></div>
                            <div class="relative flex items-center justify-center gap-[1vw]">
                                <i class="fa-solid fa-swords text-[1.5vw]" style="color: #00ffa3; filter: drop-shadow(0 0.2vw 0.4vw rgba(0,0,0,0.8));"></i>
                                <span class="font-bold text-[1.1vw] text-white tracking-[0.1em] uppercase group-hover:text-[#00ffa3] transition-colors" style="font-family: 'Cinzel Decorative', cursive;">Challenge</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}


{#if withDrawPopUp}
    <div class="hidden md:flex fixed justify-center font-semibold  flex-col inset-0 bg-black bg-opacity-70 z-50"> 
        <div class="relative flex flex-col justify-start min-h-[20vw] pb-[3vw] w-[45vw] bg-arenaDark rounded-md items-center self-center border-[0.2vw] border-arenaLight">
            <button class="absolute self-end right-[0.5vw]" on:click={()=>{ withDrawPopUp = false}}>
                <img class=" h-[2.5vw] inline-block " alt="close icon" src="/game/ui/close.svg"/>
            </button>   
            <span class="text-[2vw] text-button mt-[2vw]">
                Withdraw Rewards
            </span>
            <span class="font-normal mb-[0.3vw] border rounded-md px-[1vw]">
                Total withdrawable: <span class="text-button">{calculateTotalWithdrawable(withdrawList)} {config.nativeCurrency.name}</span> 
            </span>
            <span class="font-normal italic text-[0.8vw]">
                Platform Fee is 1%
            </span>
            {#if withdrawList?.length >0}
            <div class="flex flex-col justify-start text-[0.9vw] font-normal gap-[0.2vw] min-h-[10vw] max-h-[10vw] rounded-md p-[1vw] mx-[1vw] overflow-y-scroll bg-black">
                {#each withdrawList as withdrawItem} 
                    <div class="flex items-center">
                        {#if address === withdrawItem.caddress}
                            <div class="flex text-[#81F328] mr-[1vw]">
                                Challenge Success
                            </div>
                            <span class="">
                                You challenged <span class="text-button">{emitBetweenText(withdrawItem.daddress, 10)}</span>
                            </span>
                        {:else if address === withdrawItem.daddress}
                            <div class="text-[#81F328] mr-[1vw]">
                                Defend Success
                            </div>
                            <span class="">
                                You defended <span class="text-button">{emitBetweenText(withdrawItem.caddress, 10)}</span>
                            </span>
                        {/if}
                        <div class="flex gap-[0.2vw] items-center ml-[2vw]">
                            <span class=" font-semibold text-white">{withdrawItem.value*2}</span>
                            <img class="h-[1vw]" alt="currency" src="/icons/token.png"/>
                        </div>
                        <button class="mx-[1vw] px-[1vw] rounded-md bg-button hover:bg-black hover:border-buttonHover hover:border" on:click={()=>claimBattleWinnings(address, withdrawItem.battleID)}>
                            Withdraw
                        </button>

                    </div>
                {/each}
            </div>
            {:else}
                <span class="mt-[2vw] text-[1.1vw] font-normal">
                    Looks like you don't have any winning matches to claim stake
                </span>   
            {/if}

        </div>
    </div>
{/if}

{#if error}
    <div class="absolute text-[2vw] bottom-0 right-[20vw] mb-[3vw] bg-red-500 px-[1vw] py-[0.5vw] rounded-md z-50" 
         in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
        You have to choose squad before battle
    </div>
{/if}

{#if errorOutChallenge}
    <div class="absolute text-[2vw] bottom-0 right-[20vw] mb-[3vw] bg-red-500 px-[1vw] py-[0.5vw] rounded-md z-50" 
         in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
        You have used all your challenge attempts for today.
    </div>
{/if}

{#if generalError}
    <div class="absolute text-[1.5vw] bottom-0 right-[20vw] mb-[3vw] bg-red-500 px-[1vw] py-[0.5vw] rounded-md z-50" 
         in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
        {generalErrorValue}
    </div>
{/if}

{#if popupLoading}
    <div class="z-50">
        <Loading/>
    </div>
{/if}