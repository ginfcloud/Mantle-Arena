<script>
    import { copyToClipboard, getAddressColor} from "$lib/index.js";
    import { disconnectWallet } from '$lib/wallet.js';
    import { emitBetweenText } from '$lib/index.js';

    export let address = "";
    export let withdrawList = [];
    export let onWithdrawClick = () => {};

    let copySuccess = false;

    async function handleCopy(text) {
        const success = await copyToClipboard(text);
        if (success) {
            copySuccess = true;
            setTimeout(() => { copySuccess = false; }, 2000);
        }
    }

    function handleDisconnect() {
        disconnectWallet();
    }


    function calculateTotalWithdrawable() {
        if (!withdrawList || withdrawList.length === 0) {
            return 0;
        }
        return withdrawList.reduce((total, item) => total + (item.value * 2), 0);
    }
</script>

<div class="absolute flex items-center bg-arenaDark w-[18vw] m-[0.2vw] gap-[0.8vw] pl-[1vw] pr-[2vw] py-[0.4vw] z-10 right-[0vw] rounded-full border border-arenaMedium">
    <div 
        class="w-[3vw] h-[3vw] rounded-full flex-shrink-0"
        style="background: {getAddressColor(address)}"
    ></div>
    
    <div class="flex flex-col gap-[0.1vw] min-w-0 flex-1">
        <div class="flex w-full justify-between items-center gap-[0.3vw]">
            <span class="text-[1.1vw] text-white truncate">
                {emitBetweenText(address, 10)}
            </span>
            <div class="flex gap-[0.5vw]">
                <button 
                    class="flex items-center justify-center w-[1.2vw] h-[1.2vw] hover:bg-arenaLight rounded"
                    on:click={() => handleCopy(address)}
                >
                    {#if copySuccess}
                        <svg class="w-[1.2vw] h-[1.2vw] text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                    {:else}
                        <svg class="w-[1.2vw] h-[1.2vw] text-arenaLight hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    {/if}
                </button>
                
                <button 
                    class="flex items-center justify-center w-[1.2vw] h-[1.2vw] hover:bg-red-600 rounded"
                    on:click={handleDisconnect}
                >
                    <svg class="w-[1.2vw] h-[1.2vw] text-arenaLight hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                </button>
            </div>
        </div>
        
        <button class="flex justify-between items-center text-[0.8vw] text-arenaLight hover:text-buttonHover" on:click={onWithdrawClick}>
            <span>Withdrawable</span>
            <div class="flex items-center gap-[0.2vw]">
                <span class="text-button">{calculateTotalWithdrawable()}</span>
                <img class="h-[0.8vw]" alt="currency" src="/icons/token.png"/>
            </div>
        </button>
        
    </div>
</div>