
<script>
    import { fade,slide } from 'svelte/transition'; 
    import { goto } from '$app/navigation';
    import { emitBetweenText } from '$lib/index.js';
    import { erc721ABI, erc721Bytecode } from "$lib/contract.config.js";
    import Loading from "$lib/Loading.svelte";
    import { onMount } from 'svelte';
    import { ethers } from "ethers";
    import config from "$lib/config.js";
    import { addNFTToWallet} from '$lib/localWalletStorage.js';
    import { walletState, connectWallet, checkExistingConnection, disconnectWallet } from '$lib/wallet.js';



    let provider;
    let signer;
    let isLogin = false;
    let unsubWallet;

    let loading = true;
    let popupLoading = false;
    let isImportSuccess = false;

    let userAddress;
    let address;

    let nftList = [];
    let isExisted = false;


    let attributes = [];
    let tokenURI = "";
    let metadata = {};
    let owner, lister, collectionName ;
    let resultSkills = [];
 


    let inputNftContract = '';
    let inputId = '';
    let subMitNftContract = '';
    let subMitNftId = '';

    function throwFrontError(error){

        errorMessage =  error;
        let errorTimeout = setTimeout(()=>{errorMessage = ""}, 2000)
    }

    async function getNFTInfo(collectionAddress, id) {
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getNFTInfo",
                params: {
                    address:collectionAddress,
                    id:id,
                    exclude: ["offers" ]
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const responseBody = await response.json();

            const getResult = responseBody.payload;
            tokenURI = getResult.tokenURI,
            collectionName = getResult.collectionName;
            metadata = getResult.metadata, 
            owner = getResult.owner,
            lister = getResult.lister;
            owner = owner;
            lister = lister;
        } else {

            const responseBody = await response.json();

            if (responseBody.error && responseBody.error.message) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = responseBody.error.message;
                throw new Error(responseBody.error.message);
            }
        }
	}

    async function generateNFTSkill(collectionAddress, attributes, tokenId, userAddress) {
        try {    
            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "generateNFTSkill",
                    params: {
                        collectionAddress,
                        attributes: attributes,
                        tokenId: tokenId,    
                        userAddress: userAddress 
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            console.log(userAddress, "userAddress")
            console.log(collectionAddress, attributes, tokenId, userAddress)
            if (response.ok) {
                const responseBody = await response.json();
                
                // Check if the response data indicates an error
                if (responseBody.payload && responseBody.payload.data && responseBody.payload.data[0] === "error") {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = responseBody.payload.data[1]; // The error message
                    throw new Error(responseBody.payload.data[1]);
                }
                
                resultSkills = responseBody.payload.data[1];
                return responseBody.payload;
            } else {
                const responseBody = await response.json();
                if (responseBody.error && responseBody.error.message) {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = responseBody.error.message;
                    throw new Error(responseBody.error.message);
                }
                popupLoading = false;
                generalError = true;
                generalErrorValue = "Unknown error occurred";
                throw new Error("Unknown error occurred");
            }
        } catch (error) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = error.message || error; // Use error.message for cleaner display
            throw error;
        }
    }

    async function getNFTOwner(address, id) {
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getNFTInfo",
                params: {
                    address,
                    id,
                    exclude: [ "metadata", "collectionName", "offers" ]
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const responseBody = await response.json();
            return responseBody.payload;
        } else {
            const responseBody = await response.json();

            if (responseBody.error && responseBody.error.message) {
                throw new Error(responseBody.error.message);
            }
        }
    }

    async function addNFTToLocalList(collectionAddress, id) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            const { owner, lister } = await getNFTOwner(collectionAddress, id);
            addNFTToWallet(userAddress, { collectionAddress, id });
    }

    async function importAndGenerateNFT(collectionAddress, id){
        //Correct typo
        collectionAddress = collectionAddress.split(" ").join("")
        id = id.split(" ").join("")

        console.log(collectionAddress)        
        //Reset
        isExisted = false;
        subMitNftContract= "";
        subMitNftId= "";
        subMitNftContract = subMitNftContract;
        subMitNftId = subMitNftId;
        attributes = [];
        attributes = attributes;
        resultSkills = [];
        resultSkills = resultSkills;
        isOwnerError = false;
        isImportSuccess = false;
        //
        popupLoading = true;
        await getNFTInfo(collectionAddress, id);
        if (!collectionName) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Collection does not exist";
            subMitNftContract = "";
            subMitNftContract= subMitNftContract;
            subMitNftId = "";
            subMitNftId = subMitNftId;
            return; 
        }
        if (!tokenURI) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Can not find tokenURI of this NFT";
            subMitNftContract = "";
            subMitNftContract= subMitNftContract;
            subMitNftId = "";
            subMitNftId = subMitNftId;
            return; 
        }

        if (!owner)
        {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "This NFT does not exist";
            subMitNftContract = "";
            subMitNftContract= subMitNftContract;
            subMitNftId = "";
            subMitNftId = subMitNftId;
            return; 
        }

        
        subMitNftContract = inputNftContract;
        subMitNftContract = subMitNftContract; //For reactive
        subMitNftId= inputId;
        subMitNftId= subMitNftId;  //For reactive
        
        if (!metadata?.attributes || metadata?.attributes.length === 0) {
            //  create a default skill
            attributes = [{
                attribute: "Default",
                value: "BasicAttack"
            }];
            attributes = attributes; // For reactivity in Svelte
        } else {
            if (Array.isArray(metadata.attributes)) {
                for (const attribute of metadata.attributes) {
                    attributes.push({ attribute: attribute["trait_type"], value: attribute["value"] });
                }
            }
        }
        attributes = attributes;
        await generateNFTSkill(subMitNftContract, attributes,subMitNftId,userAddress);
        isExisted = true;



        if (!resultSkills || resultSkills?.length === 0) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "This NFT has no traits, you may want to use another NFTs";
            return; 
        }
        
        addNFTToLocalList(subMitNftContract, subMitNftId);
        isImportSuccess = true;
        popupLoading = false;
    
    }

    let generalError = false;
    let generalErrorValue = "Error";
    let isOwnerError = false;

    setInterval(()=>{
        if(generalError === true){
            setTimeout(()=>{generalError = false; generalErrorValue = "Error" }, 2000)
        }
    }, 100);

    onMount(async () => {
        //subcribe to wallet state
        unsubWallet = walletState.subscribe(state => {
            provider = state.provider;
            signer = state.signer;
            userAddress = state.address;
            address = userAddress;
            isLogin = state.isConnected;
        });


        (async () => {
            // Get nfts that user owns
            try {
                await (async function() {
                    // Get the nft list in local storage
                    try {
                        const localNFTList = JSON.parse(localStorage.nftList || "[]");
                        const requests = [];

                        // Check if user is still the owner
                        for (const nft of localNFTList) {
                            requests.push((async () => {
                                const { owner, lister } = await getNFTOwner(nft.collectionAddress, nft.id);

                                if (owner !== userAddress && lister !== userAddress) {
                                    return;
                                }

                                nftList.push(nft);
                            })());
                        }

                        await Promise.all(requests);
                        localStorage.nftList = JSON.stringify(nftList);
                    } catch (e) {
                        console.log("b", e);
                    }
                })();
            } catch (e) {}


        })();



    })

</script>



<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
</svelte:head>

<style>
    /* Scrollbar Styling */
    :global(::-webkit-scrollbar) {
        width: 0.3vw;
    }
    :global(::-webkit-scrollbar-track) {
        background: #000;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #059669;
        border-radius: 0.15vw;
    }
    :global(::-webkit-scrollbar-thumb:hover) {
        background: #00ffa3;
        box-shadow: 0 0 0.5vw #00ffa3;
    }
    
    /* Custom Text Shadow */
    .text-shadow-mint {
        text-shadow: 0 0 0.5vw rgba(0, 255, 163, 0.6), 0 0 1vw rgba(0, 255, 163, 0.4);
    }
    
    /* Background Patterns */
    .bg-forge {
        background: linear-gradient(to bottom, rgba(5, 5, 5, 0.9), rgba(0, 10, 5, 0.95)), 
                    url('https://images.unsplash.com/photo-1516916753474-1847f9328575?q=80&w=2670&auto=format&fit=crop');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .bg-obsidian-texture {
        background: url('https://www.transparenttextures.com/patterns/black-scales.png'), 
                    linear-gradient(to bottom, #1a1a1a, #0a0a0a);
    }
    
    /* Animations */
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-0.5vw); }
    }
    
    @keyframes ember {
        0% { transform: translateY(100vh) scale(0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-10vh) scale(1); opacity: 0; }
    }
    
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
    
    .animate-pulse-slow {
        animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    /* Ember particles */
    .ember-particle {
        position: absolute;
        width: 0.05vw;
        height: 0.05vw;
        background: #00ffa3;
        border-radius: 50%;
        filter: blur(0.05vw);
        animation: ember 8s linear infinite;
    }
    
    .ember-particle:nth-child(1) { left: 10%; animation-duration: 8s; }
    .ember-particle:nth-child(2) { left: 20%; animation-duration: 12s; animation-delay: 2s; opacity: 0.6; }
    .ember-particle:nth-child(3) { left: 60%; animation-duration: 10s; animation-delay: 4s; opacity: 0.4; width: 0.075vw; height: 0.075vw; }
    .ember-particle:nth-child(4) { left: 85%; animation-duration: 9s; animation-delay: 1s; opacity: 0.8; }
    
    /* Glow effects */
    .shadow-glow-mint {
        box-shadow: 0 0 0.75vw rgba(0, 255, 163, 0.3);
    }
    
    .shadow-obsidian-glow {
        box-shadow: 0 0 1vw rgba(0, 255, 163, 0.1), inset 0 0 1.5vw rgba(0, 0, 0, 0.9);
    }
    
    .shadow-card-glow {
        box-shadow: 0 0 1vw rgba(0, 255, 163, 0.35);
    }
    
    /* Gradient backgrounds */
    .bg-gradient-primary {
        background: linear-gradient(to right, #059669, #00ffa3, #059669);
    }
    
    /* Hover shine effect */
    .hover-shine::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transform: translateX(-100%);
        transition: transform 0.7s ease-in-out;
    }
    
    .hover-shine:hover::after {
        transform: translateX(100%);
    }
</style>

<div class="relative flex flex-col w-full h-screen bg-[#020402] text-[#cbd5e1] bg-forge overflow-hidden">
    <div class="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(0,255,163,0.05)_0%,_rgba(0,0,0,0.95)_80%)] z-0"></div>
    
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div class="ember-particle"></div>
        <div class="ember-particle"></div>
        <div class="ember-particle"></div>
        <div class="ember-particle"></div>
    </div>
    
    <div class="relative w-[90vw] h-[50vw] max-w-[90vw] m-auto flex items-center justify-center z-10">
        <div class="flex gap-[2vw] w-full h-full">
            <div class="w-[35vw] flex flex-col justify-center">
                <div class="relative bg-obsidian-texture border border-[#00ffa3]/30 rounded-[0.6vw] p-[2vw] shadow-obsidian-glow overflow-hidden group">
                    <div class="absolute inset-0 border border-[#00ffa3]/20 rounded-[0.6vw] pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[0.05vw] bg-gradient-to-r from-transparent via-[#00ffa3] to-transparent opacity-50"></div>
                    <div class="absolute bottom-0 left-0 w-full h-[0.05vw] bg-gradient-to-r from-transparent via-[#00ffa3] to-transparent opacity-50"></div>
                    
                    <div class="relative z-10">
                        <button 
                            class="flex items-center text-[#78716c] hover:text-[#00ffa3] transition-colors mb-[2vw] group/back"
                            on:click={()=>{goto("./")}}
                        >
                            <i class="fa-solid fa-arrow-left text-[0.9vw] mr-[0.5vw] transform group-hover/back:-translate-x-[0.25vw] transition-transform"></i>
                            <span class="font-['Cinzel_Decorative'] tracking-[0.15em] font-bold text-[0.8vw]">BACK</span>
                        </button>
                        
                        <h1 class="font-['Cinzel_Decorative'] text-[1.8vw] text-white font-bold mb-[0.25vw] tracking-wider uppercase leading-snug">
                            Import Any<br/>
                            <span class="text-[#00ffa3] text-shadow-mint">Existing NFTs</span>
                        </h1>
                        
                        <!-- Block Explorer Link -->
                        <button 
                            class="block text-[#78716c] hover:text-[#00ffa3]/80 text-[0.9vw] underline mb-[2vw] font-['Lato'] transition-colors"
                            on:click={()=>{window.open(`${config.blockExplorerUrls}/address/${address}?tab=token_transfers&type=URC-721#asset-nfts`, "_blank")}}
                        >
                            View your NFTs you own on block explorer
                        </button>
                        
                        <!-- Form Inputs -->
                        <div class="space-y-[1.5vw]">
                            <div>
                                <input 
                                    type="text"
                                    bind:value={inputNftContract}
                                    placeholder="Enter your NFT contract"
                                    class="w-full bg-[#050505] border border-[#292524] rounded-[0.25vw] px-[1vw] py-[1vw] text-[#cbd5e1] text-[0.9vw] placeholder-[#44403c] focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3]/50 outline-none transition-all shadow-inner"
                                />
                            </div>
                            
                            <div>
                                <input 
                                    type="text"
                                    bind:value={inputId}
                                    placeholder="NFT ID"
                                    class="w-full bg-[#050505] border border-[#292524] rounded-[0.25vw] px-[1vw] py-[1vw] text-[#cbd5e1] text-[0.9vw] placeholder-[#44403c] focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3]/50 outline-none transition-all shadow-inner"
                                />
                            </div>
                            
                            <!-- Import Button -->
                            <button 
                                on:click={importAndGenerateNFT(inputNftContract,inputId)}
                                class="relative w-full mt-[1.5vw] bg-gradient-primary text-black font-['Cinzel_Decorative'] font-black text-[0.9vw] py-[1vw] rounded-[0.25vw] shadow-glow-mint hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.15em] overflow-hidden group/btn animate-pulse-slow hover-shine"
                            >
                                IMPORT NFTS
                            </button>
                            
                            <!-- Error Message -->
                            {#if isOwnerError}
                                <div class="pt-[1vw] border-t border-white/5" in:slide={{ duration: 200 }}>
                                    <p class="text-[#ef4444] text-[0.65vw] font-['Lato'] mb-[0.25vw]">
                                        <i class="fa-solid fa-exclamation-circle mr-[0.25vw]"></i> You are not owner of this NFT
                                    </p>
                                    <div class="flex gap-[0.25vw] text-[#78716c] text-[0.6vw]">
                                        <span>Owner of this NFT is</span>
                                        <button 
                                            class="underline hover:text-[#00ffa3] transition-colors"
                                            on:click={()=>{window.open(`${config.blockExplorerUrls}/address/${owner}`, "_blank")}}
                                        >
                                            {emitBetweenText(owner, 10)}
                                        </button>
                                    </div>
                                </div>
                            {/if}
                            
                            <!-- Success Message -->
                            {#if isImportSuccess}
                                <div class="pt-[1vw] border-t border-white/5" in:slide={{ duration: 200 }}>
                                    <p class="text-[#00ffa3] text-[0.65vw] font-['Lato'] mb-[0.25vw]">
                                        <i class="fa-solid fa-check-circle mr-[0.25vw]"></i> Import Successful
                                    </p>
                                    <p class="text-[#78716c] text-[0.6vw] font-['Lato']">
                                        You can now use this NFT to battle
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="w-[55vw] max-h-screen flex flex-col items-center justify-center relative">
                {#if collectionName && isExisted}
                    <div class="relative w-[20vw] bg-[#1c1917] rounded-[1.2vw] p-[0.75vw] shadow-2xl border border-[#292524] animate-float group transition-transform duration-500 hover:scale-[1.01]" in:slide={{ duration: 300 }}>
                        <div class="absolute -inset-[1vw] bg-[#00ffa3]/20 blur-[2vw] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0"></div>
                        
                        <div class="relative z-10 bg-[#151515] rounded-[1vw] overflow-hidden border-[0.2vw] border-[#2a2a2a] shadow-inner flex flex-col min-h-[40vw]">
                            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none"></div>
                            
                            <div class="relative px-[1.25vw] py-[1vw] flex justify-between items-center bg-gradient-to-b from-[#252525] to-[#151515] border-b border-[#333]">
                                <h3 class="font-['Cinzel_Decorative'] text-[1.2vw] text-[#00ffa3] font-bold tracking-wider drop-shadow-md">
                                    <i class="fa-solid fa-dragon mr-[0.5vw] text-[0.8vw] opacity-70"></i>{collectionName}
                                </h3>
                                <div class="flex items-center gap-[0.5vw]">
                                    <span class="w-[0.4vw] h-[0.4vw] rounded-full bg-[#00ffa3] shadow-[0_0_0.25vw_rgba(0,255,163,0.8)] animate-pulse"></span>
                                    <span class="font-mono text-[#78716c] font-bold text-[0.7vw]">#{inputId}</span>
                                </div>
                            </div>
                            
                            <!-- NFT Image -->
                            <div class="p-[1.25vw] pb-[0.5vw]">
                                <div class="relative aspect-square w-full rounded-[0.5vw] border-[0.15vw] border-[#00ffa3] shadow-card-glow overflow-hidden group/image">
                                    <img 
                                        alt="NFT"
                                        class="w-full h-full object-cover transform group-hover/image:scale-110 transition-transform duration-700"
                                        src={`${config.rpcUrl}/cdn/nft/${subMitNftContract}/${subMitNftId}/800/800`}
                                        onerror="this.onerror=null; this.src='/game/noImage.svg';"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-tr from-[#00ffa3]/10 to-transparent opacity-30 pointer-events-none"></div>
                                    
                                    <!-- Corner Accents -->
                                    <div class="absolute top-0 left-0 w-[2vw] h-[2vw] border-t-[0.15vw] border-l-[0.15vw] border-[#00ffa3] z-20"></div>
                                    <div class="absolute bottom-0 right-0 w-[2vw] h-[2vw] border-b-[0.15vw] border-r-[0.15vw] border-[#00ffa3] z-20"></div>
                                    <div class="absolute top-0 right-0 w-[2vw] h-[2vw] border-t-[0.15vw] border-r-[0.15vw] border-[#00ffa3] z-20"></div>
                                    <div class="absolute bottom-0 left-0 w-[2vw] h-[2vw] border-b-[0.15vw] border-l-[0.15vw] border-[#00ffa3] z-20"></div>
                                </div>
                            </div>
                            
                            <div class="relative flex-1 px-[1.25vw] pb-[1.5vw] pt-[0.5vw] overflow-hidden flex flex-col">
                                <div class="flex items-center justify-center gap-[1vw] mb-[1vw] mt-[0.5vw]">
                                    <div class="h-[0.05vw] bg-gradient-to-r from-transparent via-[#00ffa3]/30 to-transparent flex-1"></div>
                                    <span class="font-['Cinzel_Decorative'] text-[#00ffa3] text-[0.7vw] font-bold tracking-[0.15em] uppercase text-shadow-mint whitespace-nowrap">Generated Skill</span>
                                    <div class="h-[0.05vw] bg-gradient-to-r from-transparent via-[#00ffa3]/30 to-transparent flex-1"></div>
                                </div>
                                
                                <div class="bg-[#0a0a0a]/60 border border-white/5 rounded-[0.5vw] p-[0.25vw] flex-1 overflow-hidden relative">
                                    <div class="absolute top-0 left-0 w-full h-[1vw] bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none"></div>
                                    
                                    <div class="h-[11vw] overflow-y-auto pr-[0.5vw] p-[0.75vw] space-y-[1vw]">
                                        {#if attributes?.length == 0 && resultSkills?.length == 0}
                                            <div class="flex flex-col gap-[0.5vw]">
                                                <span class="text-[#00ffa3] text-[0.8vw] font-bold">
                                                    This NFT has no traits
                                                </span>
                                                <span class="text-white text-[0.65vw]">
                                                    Cannot assign skills to an NFT that has no traits (attributes).
                                                </span>
                                            </div>
                                        
                                        {:else if attributes?.length > 0 && resultSkills?.length == 0}

                                            {#each attributes as attribute}
                                                <div class="group/skill">
                                                    <div class="flex justify-between items-center mb-[0.25vw] border-b border-[#00ffa3]/20 pb-[0.25vw]">
                                                        <span class="text-[#00ffa3] font-bold text-[0.7vw] tracking-wide flex items-center gap-[0.5vw]">
                                                            <i class="fa-solid fa-bolt text-[0.5vw]"></i> {attribute.attribute}.{attribute.value}
                                                        </span>
                                                    </div>
                                                    <div class="text-[0.5vw] text-[#059669] font-mono mb-[0.25vw] uppercase tracking-wider">
                                                        Activation Rate: <span class="text-[#00ffa3]">{(100/(attributes.length)).toFixed(2)}%</span>
                                                    </div>
                                                    <p class="text-[#78716c] text-[0.6vw] leading-relaxed font-['Cinzel'] italic ml-[0.5vw]">
                                                        Loading skill
                                                    </p>
                                                </div>
                                            {/each}
                                        
                                        {:else if attributes?.length > 0 && resultSkills?.length > 0}
                                            {#if resultSkills[0].attribute == "BasicAttack"}
                                                <span class="text-[#00ffa3] font-bold text-[0.75vw] block mb-[0.5vw]">
                                                    This NFT has no traits; default skill is applied.
                                                </span>
                                            {:else}

                                            {/if}
                                            {#each resultSkills as resultSkill}
                                                <div class="group/skill">
                                                    <div class="flex justify-between items-center mb-[0.25vw] border-b border-[#00ffa3]/20 pb-[0.25vw]">
                                                        <span class="text-[#00ffa3] font-bold text-[0.8vw] tracking-wide flex items-center gap-[0.5vw]">
                                                            <i class="fa-solid fa-bolt text-[0.5vw]"></i> {resultSkill.attribute}
                                                        </span>
                                                    </div>
                                                    <div class="text-[0.7vw] text-[#059669] font-mono mb-[0.25vw] uppercase tracking-wider">
                                                        Activation Rate: <span class="text-[#00ffa3]">{(100/(resultSkills.length)).toFixed(2)}%</span>
                                                    </div>
                                                    <p class="text-white text-[0.7vw] leading-relaxed font-['Cinzel'] italic">
                                                        "{resultSkill.desc}"
                                                    </p>
                                                </div>
                                            {/each}
                                        {/if}
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        
                        <div class="absolute -top-[0.75vw] -left-[0.75vw] w-[3vw] h-[3vw] border-t-[0.15vw] border-l-[0.15vw] border-[#00ffa3]/40 rounded-tl-[0.6vw] pointer-events-none"></div>
                        <div class="absolute -top-[0.75vw] -right-[0.75vw] w-[3vw] h-[3vw] border-t-[0.15vw] border-r-[0.15vw] border-[#00ffa3]/40 rounded-tr-[0.6vw] pointer-events-none"></div>
                        <div class="absolute -bottom-[0.75vw] -left-[0.75vw] w-[3vw] h-[3vw] border-b-[0.15vw] border-l-[0.15vw] border-[#00ffa3]/40 rounded-bl-[0.6vw] pointer-events-none"></div>
                        <div class="absolute -bottom-[0.75vw] -right-[0.75vw] w-[3vw] h-[3vw] border-b-[0.15vw] border-r-[0.15vw] border-[#00ffa3]/40 rounded-br-[0.6vw] pointer-events-none"></div>
                    </div>
                {:else}
                <!-- Bottom Info Text -->
                <div class="bottom-[2vw] flex flex-col items-center text-center">
                    <span class="text-[#78716c] text-[1vw] font-['Lato']">After importing existing NFTs, you can use that NFT on battle</span>
                    <span class="text-[#78716c] text-[1vw] font-['Lato']">Skills of your NFT will be automatically AI-generated based on your NFT trait name</span>
                </div>
                {/if}
                

            </div>
        </div>
    </div>
    
    <!-- General Error Message -->
    {#if generalError}
        <div class="absolute text-[1vw] bottom-[5vw] right-[10vw] bg-[#ef4444] text-white px-[1.5vw] py-[0.75vw] rounded-[0.5vw] z-50 shadow-2xl font-['Lato'] font-bold" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <i class="fa-solid fa-exclamation-triangle mr-[0.5vw]"></i>{generalErrorValue}
        </div>
    {/if}
    
    <!-- Loading Overlay -->
    {#if popupLoading}
        <div class="z-50">
            <Loading/>
        </div>
    {/if}
</div>






