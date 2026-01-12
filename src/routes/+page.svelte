<script>
    import { slide } from 'svelte/transition';
    import { fade } from 'svelte/transition';
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
    import { emitBetweenText, getAddressColor } from '$lib/index.js';
    import { erc721ABI, erc721Bytecode, contractAddress,contractAbi  } from "$lib/contract.config.js";
    import { ethers } from "ethers";
    import config  from "$lib/config.js";
    import { walletState, connectWallet, checkExistingConnection, disconnectWallet } from '$lib/wallet.js';
    import { getNFTListForWallet, saveNFTListForWallet } from '$lib/localWalletStorage.js';
    import PvPMode from './PvPMode.svelte';
    import TrainingRoom from './TrainingRoom.svelte';
    import QuickMint from './QuickMint.svelte';
    import PvpOnboard from './PvpOnboard.svelte';
    import TutorialPopUp from './TutorialPopUp.svelte';
    import Hall from './Hall.svelte';
    import LoadingGame from '$lib/LoadingGame.svelte';
    import OnboardingManager from '$lib/onboarding/OnboardingManager.svelte';
    import UserInfo from '$lib/components/UserInfo.svelte';
    import { onboardingStore, startOnboarding , getUserOnboardingStatus , closeOnboarding, currentStep, resetOnboarding, setUserAddress} from '$lib/onboarding/onboardingStore.js';
    import { trackButtonClick, resetEvents, onboardingEvents } from '$lib/onboarding/onboardingEvents.js';
    import { musicManager, musicEnabled} from '$lib/music';

    $: if ($page?.url?.pathname) {
        musicManager.setMusicForPage($page.url.pathname);
    }
    
    export const skillData = writable([]);
    let showNotifications1 = true;
    let showNotifications2 = false;
    let showNotifications3 = false;
    import './styles.css';
    import Loading from "$lib/Loading.svelte";
    let isLogin = false;
    let connectToMetamask;
    let navigation = "hall";
    let matchPopUp = false;
    let challengePopUp = false;
    let chainChoose = false;

    let showSelectedAtributes =[];
    let selected = {};
    let selectedAtributes = {};


    let challengeHistory = [];
    let defendHistory =[];
    let battleHistory = [];
    
    let challengePerDay = "";
    let challengeUsed ="";

    let isShowMintFree = true;
    let isShowQuickMint = false;
    let isShowOnboardPvP = false

    let inputStake;

    let withdrawList =[];
    //


    //pvp squad
    let squad = [{},{},{}];
    function chooseSquad(){
        if(!squad[0].id)
        {   squad[0].collection = selected.collection; 
            squad[0].id = selected.id;
            squad = squad;
            
        }
        else if(!squad[1].id)
        {   squad[1].collection = selected.collection; 
            squad[1].id = selected.id;
            squad = squad;
        }
        else if(!squad[2].id)
        {
            squad[2].collection = selected.collection; 
            squad[2].id = selected.id;
            squad = squad;
        }
    }

    let y;
    let selectedCollectionName;


    

    // Example of using the data
    let effect = '';
    function getEffect(collections, attribute) {
    let currentSkillData = [];
    
    // Get the current value from the store
        const unsubscribe = skillData.subscribe(value => {
            currentSkillData = value || [];
        });
        unsubscribe(); // Unsubscribe immediately after getting the value
        
        const item = Array.isArray(currentSkillData) 
            ? currentSkillData.find(item => item.collections === collections && item.attribute === attribute)
            : null;
            
        effect = item ? item.desc : 'Effect not found, please re-generate skills for this NFT';
        return effect;
    }


    let address = ""; 
    let playerProfile;
    let userAddress;
    //Copy
    let textToCopy = address;

    let nftList = [];
    let currentItem = 0;
    let items = [];
    let done = false;
    let popupLoading = false;
    let loading = true;
    let allLoading = true;
    

    let matches = [];

    let withDrawPopUp = false;
    let isShowTutorialPopUp = false;
    
    let provider;
    let signer;
    let prizePoolContract;

    let unsubWallet;

    //Onboard
    $: gameState = {
        navigation,
        nftList,
        squad
    };

    onMount(async () => {
        //subcribe to wallet state
        unsubWallet = walletState.subscribe(state => {
            provider = state.provider;
            signer = state.signer;
            userAddress = state.address;
            address = userAddress;
            isLogin = state.isConnected;
        });

        //set onboard useradress
        if (userAddress) {
            setUserAddress(userAddress);
        };

        await checkExistingConnection();
        //////////////////////////
        prizePoolContract = new ethers.Contract(contractAddress, contractAbi, signer);
        
        ////////////////////////// CHECK NFT IN LOCAL LIST + COMBINED ON-CHAIN VERFITICATION + LOAD NFT ///////////////////////////////////////////
        (async () => {
            // Get nfts that user owns
            try {
                await (async function() {
                    try {
                        const localNFTList = getNFTListForWallet(userAddress);
                        const requests = [];
                        // Check if user is still the owner
                        for (const nft of localNFTList) {
                            requests.push((async () => {
                                const { owner } = await getNFTOwner(nft.collectionAddress, nft.id);
                                
                                if (owner !== userAddress) {
                                    return;
                                }

                                nftList.push(nft);
                                nftList = nftList;
                            })());
                        }

                        await Promise.all(requests);
                        saveNFTListForWallet(userAddress, nftList);
                    } catch (e) {
                        console.log(e);
                    }
    
                })();
            } catch (e) {}

        const excludedAddresses = [
            "",
            ""
        ];
        ///////// Filter NFT that being excluded ////////////////////////////////
        nftList = nftList.filter(nft => !excludedAddresses.includes(nft.collectionAddress));
        
        //update onboard tracking props
        gameState.nftList = nftList;
        gameState ={...gameState}
        loadNFTs(nftList);

           
        })();

        async function loadNFTs() {
            loading = true;
            
            const nfts = [];

            for (let index = currentItem; index < currentItem + 100; index++) {
                const id = nftList[index];

                nfts.push(id);
            }

            try {
                const curatedNFTs = nfts.filter(id => typeof id !== "undefined" && id !== null);

                if (curatedNFTs.length !== nfts.length) { done = true; }

                const nftInfos = (await getNFTsInfo(curatedNFTs, [ "metadata", "offers", "owner" ])).nftInfos;

                const newNfts = nftInfos.map(nft => ({ ...nft, id: nft.id }));

                items = [ ...items, ...newNfts ];

            } catch (e) {
                console.log(e);

                done = true;
                loading = false;
            }
            loading = false;
            currentItem += 100;
        }

        if (!done && !loading) {
            loadNFTs(nftList);
        }
        await initProfile();
        await Promise.all([
            getMatches(),
            getPlayerProfile(),
            getAllBattleHistory(),
            getWithdrawList(address),
            fetchSkillData(),
            getAllStages()
        ]);

        // Start onboarding if needed
        allLoading= false;



        gameState.navigation = navigation;
        gameState = {...gameState};
        // Check user's onboarding status from localStorage
        const userStatus = getUserOnboardingStatus(userAddress);
        console.log(userStatus, "userStatususerStatus")
        if (userStatus === 'not-started' || userStatus === 'active') {
            // User hasn't finished onboarding, start it
            resetEvents();
            startOnboarding('newUser');
        } else if (userStatus === 'finished') {
            // User completed onboarding, do nothing
            //console.log('User has completed onboarding');
        } else {
            // Not found or error, reset and start fresh
            console.log('Onboarding data not found or corrupted, resetting...');
            resetEvents();
            resetOnboarding('newUser');
        }

        
    });

    onDestroy(() => {
        //destroy unsub wallet
    });

    connectToMetamask = async function() {
        const result = await connectWallet();
        if (result.success) {
            location.reload();// Reload to ensure reset state of other components
        }
    }

    async function apiCall(method, params = {}) {
        try {
        const response = await fetch(config.rpcUrl, {
            method: 'POST',
            body: JSON.stringify({
            method,
            params: { ...params}
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Failed to ${method}`);
        const responseData = await response.json();
        if (!responseData.success) throw new Error(responseData.error?.message || `Failed to ${method}`);
        if (Array.isArray(responseData.payload.data) && responseData.payload.data.length >= 2) {
            const [responseType, responsePayload] = responseData.payload.data;
            if (responseType === 'error') throw new Error(responsePayload || 'Server error');
            if (responseType === 'success') return { success: true, data: responsePayload };
        }
        throw new Error('Invalid response format');
        } catch (error) {
            console.error(`${method} API call failed:`, error);
            throw error;
        }
    }

    async function getAllStages() {
        try {
            const result = await apiCall('getAllStages');
            botStages = result.data || [];
            botStages = [...botStages];
        } catch (error) {
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


    async function getNFTsInfo(nfts, exclude) {
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getNFTsInfo",
                params: {
                    nfts,
                    exclude
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const responseBody = await response.json();
            selectedCollectionName = responseBody.payload.nftInfos[0].collectionName;
            selectedCollectionName = selectedCollectionName
            return responseBody.payload;
           
        } else {
            const responseBody = await response.json();

            if (responseBody.error && responseBody.error.message) {
                throw new Error(responseBody.error.message);
            }
        }
    }

    async function getAttributes(nfts) {
        const attributeList = (await getNFTsInfo(nfts, ["owner", "listingDetails", "offers"]))
            .nftInfos
            .map(nft => {
                //Check if NFT has missing attributes
                if (!nft?.metadata) {
                    throw new Error(`NFT is not existed`);
                }
                // Return a default BasicAttack skill for NFTs that have no attributes
                if (!nft?.metadata?.attributes?.length) {
                    return ["BasicAttack"];
                }

                const attributes = nft.metadata.attributes;
                return attributes.map(attribute => attribute["value"]);
            });
        return attributeList; 
    }

    async function fetchSkillData() {
        try {
            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "getAllSkillData",
                    params: {}
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            
            if (!response.ok) {
                const responseBody = await response.json();
                throw new Error(responseBody.error?.message || "Failed to get skill data");
            }

            const responseBody = await response.json();
            
            if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
                
                if (Array.isArray(responseBody)) {
                    const data = responseBody;
                    skillData.set(data);
                    return data;
                }
                
                if (responseBody.data && Array.isArray(responseBody.data)) {
                    skillData.set(responseBody.data);
                    return responseBody.data;
                }
                
                if (responseBody.payload && Array.isArray(responseBody.payload)) {
                    skillData.set(responseBody.payload);
                    return responseBody.payload;
                }
                
                if (responseBody.result && Array.isArray(responseBody.result)) {
                    skillData.set(responseBody.result);
                    return responseBody.result;
                }
                
                throw new Error("Invalid response format from server");
            }
            
            const responseData = responseBody.payload.data;
            

            if (Array.isArray(responseData)) {
                if (responseData[0] === "skillData" && Array.isArray(responseData[1])) {
                    skillData.set(responseData[1]);
                    return responseData[1];
                } else {
                    skillData.set(responseData);
                    return responseData;
                }
            }
            
            console.error("Unexpected response format:", responseData);
            throw new Error("Unrecognized data format");
            
        } catch (error) {
            console.error("Error fetching skill data:", error);
            throw error;
        }
    }
   
    async function getMatches() {
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getAllMatch",
                params: {}
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const responseBody = await response.json();
            if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
                console.error("Invalid response format:", responseBody);
                throw new Error("Invalid response format from server");
            }
        
            matches = responseBody.payload.data[1];
        } else {
            const responseBody = await response.json();

            if (responseBody.error && responseBody.error.message) {
                throw new Error(responseBody.error.message);
            }
        }
    }; 

    async function loadQueue(nfts, address, value) {
        popupLoading = true;
        if (!nfts?.length) {
            popupLoading = false;
            return;
            
        }
        
        const floatValue = parseFloat(value);
        if (isNaN(floatValue) || floatValue <= 0) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Deposit value must be greater than 0";
            return;
        }

        // Add max stake validation
        if (floatValue > 0.1) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "In this phase, the maximum stake per match allowed is 0.1 $ETH";
            return;
        }

        const filteredNfts = nfts.map(nft => ({ collectionAddress: nft.collection, id: nft.id }));
        const attributeList = await getAttributes(filteredNfts);
        const finalNfts = [];
        for (let i = 0; i < attributeList.length; i++) {
            finalNfts.push({
                collection: nfts[i].collection,
                id: parseInt(nfts[i].id),
                attributes: attributeList[i]
            });
        }
        
        const initialResponse = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "loadQueue",
                params: {
                    daddress: address,
                    value: floatValue,
                    matchBody: {
                        nfts: finalNfts
                    }
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!initialResponse.ok) {
            const responseBody = await initialResponse.json();
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Failed to initialize battle";
            throw new Error(responseBody.error?.message || "Failed to initialize battle");
            return;
        }
        const responseBody = await initialResponse.json();

        if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Invalid response format from server";
            throw new Error("Invalid response format from server");
        }

        const responseData = responseBody.payload.data;
        if (responseData[0] === "error") {
            popupLoading = false;
            generalError = true;
            generalErrorValue = responseData[1];
            throw new Error(responseData[1]);
        }
        
        if (responseData[0] !== "pendingBattle") {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Unexpected response";
            throw new Error(`Unexpected response from server: ${responseData[0]}`);
        }
        
        const { battleID, value: confirmedValue } = responseData[1];

        try {
            const valueToUse = parseFloat(confirmedValue.toString());
            
            const valueInWei = ethers.utils.parseEther(valueToUse.toString());
            
            const tx = await prizePoolContract.create(battleID, { value: valueInWei });
            
            await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "confirmDefenderDeposit",
                    params: {
                        battleID: battleID,
                        txHash: tx.hash
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            try {
                const receipt = await tx.wait();
                if (receipt.status !== 1) {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = ("Transaction failed with status: " + receipt.status);
                    throw new Error("Transaction failed with status: " + receipt.status);
                }
            } catch (error) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = ("Transaction failed: " + (error.message || "Unknown error"));
                console.error("Transaction failed:", error);
                throw new Error("Transaction failed: " + (error.message || "Unknown error"));
            }
            
            const finalResponse = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "finalizeDefenderDeposit",
                    params: {
                        battleID: battleID
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!finalResponse.ok) {
                const responseBody = await finalResponse.json();
                popupLoading = false;
                generalError = true;
                generalErrorValue = "Failed to finalize battle creation";
                throw new Error(responseBody.error?.message || "Failed to finalize battle creation");
            }
            popupLoading = false;
            location.reload();
            
        } catch (error) {
            popupLoading = false;
            throw error;
        }
    }

    async function challenge(nfts, caddress, daddress, battleID) {
        checkSquad();
        if (!nfts?.length) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Invalid NFTs input";
            throw new Error("Invalid NFTs input");
        }
        popupLoading = true;

        const filteredNfts = nfts.map(nft => ({ collectionAddress: nft.collection, id: nft.id }));
        const attributeList = await getAttributes(filteredNfts);
        
        const finalNfts = [];
        for (let i = 0; i < attributeList.length; i++) {
            finalNfts.push({
                collection: nfts[i].collection,
                id: parseInt(nfts[i].id),
                attributes: attributeList[i]
            });
        }
        
        const initialResponse = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "match",
                params: {
                    battleID, 
                    caddress,
                    daddress,
                    matchBody: {
                        nfts: finalNfts
                    }
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!initialResponse.ok) {
            const responseBody = await initialResponse.json();
            popupLoading = false;
            generalError = true;
            generalErrorValue = responseBody.error?.message;
            throw new Error(responseBody.error?.message || "Failed to initialize challenge");
        }

        const responseBody = await initialResponse.json();
        if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Invalid response format from server";
            throw new Error("Invalid response format from server");
        }
        const responseData = responseBody.payload.data;

        if (responseData[0] === "error") {
            popupLoading = false;
            generalError = true;
            generalErrorValue = responseData[1];
            throw new Error(responseData[1]);
        }

        if (responseData[0] === "tie") {
            goto("./battle");
            return;
        }
        
        if (responseData[0] !== "challengeWithDeposit") {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Unexpected response from server";
            throw new Error("Unexpected response from server");
        }
        
        const battleInfo = responseData[1];
        const secureToken = battleInfo.secureToken;
        
        try {
            
            const valueToUse = parseFloat(battleInfo.value.toString());
            const valueInWei = ethers.utils.parseEther(valueToUse.toString());
            const tx = await prizePoolContract.join(battleInfo.battleID, { value: valueInWei });

            // Notify server about the transaction hash
            await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "confirmChallengerDeposit",
                    params: {
                        battleID: battleInfo.battleID,
                        txHash: tx.hash,
                        caddress: caddress,
                        secureToken: secureToken
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            // Wait for transaction confirmation
            try {
                const receipt = await tx.wait();
                if (receipt.status !== 1) {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = ("Transaction failed with status: " + receipt.status);
                    throw new Error("Transaction failed with status: " + receipt.status);
                }

                // Transaction confirmed successfully - signal to server
                await fetch(config.rpcUrl, {
                    method: "POST",
                    body: JSON.stringify({
                        method: "signalTransactionDone",
                        params: {
                            battleID: battleInfo.battleID,
                            txHash: tx.hash,
                            caddress: caddress,
                            secureToken: secureToken
                        }
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                popupLoading = false;
                goto("./battle");


            } catch (error) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = ("Transaction failed: " + (error.message || "Unknown error"));
                console.error("Transaction failed:", error);
                throw new Error("Transaction failed: " + (error.message || "Unknown error"));
            }
        } catch (error) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = ("Error challenging battle:", error);
            console.error("Error challenging battle:", error);
            throw error;
        }
    }

    async function getWithdrawList(address) {
        try {
            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "withdrawList",
                    params: {
                        address: address
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const responseBody = await response.json();
                throw new Error(responseBody.error?.message || "Failed to get withdraw list");
            }

            const responseBody = await response.json();
            
            // Access the nested response data
            if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
                throw new Error("Invalid response format from server");
            }
            
            const responseData = responseBody.payload.data;
            
            // responseData should be ["withdrawList", claimableBattles]
            if (responseData[0] !== "withdrawList") {
                throw new Error(`Unexpected response from server: ${responseData[0]}`);
            }
            
            withdrawList = [...responseData[1]];
            return responseData[1];
            
        } catch (error) {
            console.error("Error getting withdraw list:", error);
            throw error;
        }
    }

    async function claimBattleWinnings(address, battleID) {
        try {
            popupLoading = true;
            const currentNonce = await prizePoolContract.nonce();
            const claimResponse = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "claim",
                    params: {
                        address: address,
                        battleID: battleID
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!claimResponse.ok) {
                const responseBody = await claimResponse.json();
                popupLoading = false;
                generalError = true;
                generalErrorValue = (responseBody.error?.message || "Failed to initiate claim");
                throw new Error(responseBody.error?.message || "Failed to initiate claim");
            }

            const responseBody = await claimResponse.json();
            
            if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = "Invalid response format from server";
                throw new Error("Invalid response format from server");
            }
            const responseData = responseBody.payload.data;
            if (responseData[0] !== "claimSignature") {
                popupLoading = false;
                generalError = true;
                generalErrorValue = "Invalid response format from server";
                throw new Error(`Unexpected response from server: ${responseData[0]}`);
            }
            
            const { signature } = responseData[1];
            
            const tx = await prizePoolContract.claim(
                battleID,
                signature.r,
                signature.s,
                signature.v,
                {
                    gasLimit: 120000, 
                }
            );
            await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "confirmClaimTx",
                    params: {
                        battleID: battleID,
                        address: address,
                        txHash: tx.hash
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            try {
                const receipt = await tx.wait();
                if (receipt.status !== 1) {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = ("Transaction failed with status: " + receipt.status);
                    throw new Error("Transaction failed with status: " + receipt.status);
                }
            } catch (error) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = ("Transaction failed: " + (error.message || "Unknown error"));

                throw new Error("Transaction failed: " + (error.message || "Unknown error"));
            }
            
            const finalResponse = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "finalizeClaimTx",
                    params: {
                        battleID: battleID
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!finalResponse.ok) {
                const responseBody = await finalResponse.json();
                popupLoading = false;
                generalError = true;
                generalErrorValue = (responseBody.error?.message || "Failed to finalize claim");
                throw new Error(responseBody.error?.message || "Failed to finalize claim");
            }
            
            popupLoading = false;
            await getWithdrawList(address);
            return true;
        } catch (error) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = ("Error claiming battle winnings:", error);
            console.error("Error claiming battle winnings:", error);
            throw error;
        }
    }

    async function delistBattle(address, battleID) {
        popupLoading = true;
        try {
            const tx = await prizePoolContract.delist(battleID);
            
            await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "confirmDelistTx",
                    params: {
                        battleID: battleID,
                        address: address,
                        txHash: tx.hash
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            try {
                const receipt = await tx.wait();
                if (receipt.status !== 1) {
                    popupLoading = false;
                    generalError = true;
                    generalErrorValue = ("Transaction failed with status: " + receipt.status);
                    throw new Error("Transaction failed with status: " + receipt.status);
                }
            } catch (error) {
                popupLoading = false;
                generalError = true;
                generalErrorValue = ("Transaction failed: " + (error.message || "Unknown error"));
                console.error("Transaction failed:", error);
                throw new Error("Transaction failed: " + (error.message || "Unknown error"));
            }
            
            const finalResponse = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "finalizeDelistTx",
                    params: {
                        battleID: battleID
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!finalResponse.ok) {
                const responseBody = await finalResponse.json();
                popupLoading = false;
                generalError = true;
                generalErrorValue = (responseBody.error?.message || "Failed to finalize delist");
                throw new Error(responseBody.error?.message || "Failed to finalize delist");
            }
            
            popupLoading = false;
            location.reload();
            return true;
        } catch (error) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = ("Error delisting battle:", error);
            console.error("Error delisting battle:", error);
            throw error;
        }
    }

    
    async function initProfile() {
        try {
                const response = await fetch(config.rpcUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        method: "initProfile",
                        params: {
                        address: userAddress
                        }
                    })
                });

                if (response.ok) {
                    const responseBody = await response.json();
                    return responseBody.payload.data[1];
                } else {
                    const responseBody = await response.json();
                    if (responseBody.error && responseBody.error.message) {
                        throw new Error(responseBody.error.message);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch battle history:', error);
                throw error;
            }
    }
    async function getPlayerProfile() {
        try {
            const response = await fetch(config.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "getPlayerProfile",
                    params: {
                        address: userAddress
                    }
                })
            });

            if (response.ok) {
                const responseBody = await response.json();
                const playerProfile = responseBody.payload.data[1];
                
                challengePerDay = playerProfile.challengePerDay;
                challengeUsed = playerProfile.challengeUsed;
                
                return playerProfile;
            } else {
                const responseBody = await response.json();
                if (responseBody.error && responseBody.error.message) {
                    throw new Error(responseBody.error.message);
                }
            }
        } catch (error) {
            console.error('Failed to fetch player profile:', error);
            throw error;
        }
    }

    async function getAllBattleHistory() {
        try {
            const response = await fetch(config.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    method: "getAllBattleHistory",
                    params: {
                        address: userAddress
                    }
                })
            });

            if (response.ok) {
                const responseBody = await response.json();
                // The response structure is now different
                const allBattles = responseBody.payload.data[1]; // This is now an array of battles
                /*
                // Separate into challenge and defend history based on who was the challenger/defender
                challengeHistory = allBattles.filter(battle => 
                    battle.caddress.toLowerCase() === userAddress.toLowerCase()
                );
                
                defendHistory = allBattles.filter(battle => 
                    battle.daddress.toLowerCase() === userAddress.toLowerCase() && 
                    battle.caddress.toLowerCase() !== userAddress.toLowerCase()
                );
                */
                // Combine all battles
                battleHistory = allBattles;
                return allBattles;
            } else {
                const responseBody = await response.json();
                if (responseBody.error && responseBody.error.message) {
                    throw new Error(responseBody.error.message);
                }
            }
        } catch (error) {
            console.error('Failed to fetch battle history:', error);
            throw error;
        }
    }
    
    ////////////////////// Training  ////////////////////////////////
    let botStages = [];
    let stageNavigation = 0;
    async function joinTrainingRoom(nfts, address) {
        checkSquad();
        if (!nfts?.length) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Invalid NFTs input";
            throw new Error("Invalid NFTs input");
        }
        popupLoading = true;
        const filteredNfts = nfts.map(nft => ({ collectionAddress: nft.collection, id: nft.id }));
        const attributeList = await getAttributes(filteredNfts);
        
        const finalNfts = [];
        for (let i = 0; i < attributeList.length; i++) {
            finalNfts.push({
                collection: nfts[i].collection,
                id: parseInt(nfts[i].id),
                attributes: attributeList[i]
            });
        }
        
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "joinTrainingRoom",
                params: {
                    address: address,
                    playerTeam: finalNfts,
                    stage:stageNavigation
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const responseBody = await response.json();
            popupLoading = false;
            generalError = true;
            generalErrorValue = responseBody.error?.message || "Failed to start training battle";
            throw new Error(responseBody.error?.message || "Failed to start training battle");
        }

        const responseBody = await response.json();
        if (!responseBody.success || !responseBody.payload || !responseBody.payload.data) {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Invalid response format from server";
            throw new Error("Invalid response format from server");
        }
        
        const responseData = responseBody.payload.data;

        if (responseData[0] === "error") {
            popupLoading = false;
            generalError = true;
            generalErrorValue = responseData[1];
            throw new Error(responseData[1]);
        }
        
        if (responseData[0] === "trainingBattleResult") {
            popupLoading = false;
            goto("./trainingRoomBattle");
        } else {
            popupLoading = false;
            generalError = true;
            generalErrorValue = "Unexpected response from server";
            throw new Error("Unexpected response from server");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////



    let error = false;
    let errorOutChallenge;

    let generalError = false;
    let generalErrorValue = "Error";

    function checkSquad() {
        if (!squad[0].id || !squad[1].id || !squad[2].id) {
            error = true;
        }
    }

    setInterval(()=>{
        if(error === true){
            setTimeout(()=>{error = false}, 2000)
        }
        if(errorOutChallenge === true){
            setTimeout(()=>{errorOutChallenge = false}, 2000)
        }
        if(generalError === true){
            setTimeout(()=>{generalError = false; generalErrorValue = "Error" }, 3000)
        }
    }, 100);

    
    let loadingItems2 = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];;

    let totalSeconds, totalMinutes , totalHours, totalDays;
    let deadline = 1735650000000;
    let deadline2 = 1735650000000;

    let totalHours2

    function formatTimeLeftBattle(timestamp) {
        let milliseconds = Date.now() - timestamp;
        totalSeconds = Math.floor(milliseconds / 1000);
        totalMinutes = Math.floor(totalSeconds / 60);
        totalHours = Math.floor(totalMinutes / 60);
        totalDays = Math.floor(totalHours / 24);

        totalSeconds = totalSeconds % 60;
        totalMinutes =  totalMinutes % 60;
        totalHours2 =  totalHours % 24;
        if(totalDays < 1){
            totalDays =  0;
        } else {totalDays = totalDays}

        return `${totalDays > 0 ? totalDays + 'd ' : ''}${totalHours > 0 ? totalHours + 'h ' : ''}${totalMinutes}m`;
    }

    function formatTimeLeft(milliseconds) {
        totalSeconds = Math.floor(milliseconds / 1000);
        totalMinutes = Math.floor(totalSeconds / 60);
        totalHours = Math.floor(totalMinutes / 60);
        totalDays = Math.floor(totalHours / 24);

        totalSeconds = totalSeconds % 60;
        totalMinutes =  totalMinutes % 60;
        totalHours =  totalHours % 24;
        if(totalDays < 1){
            totalDays =  0;
        } else {totalDays = totalDays}
    }

    let dateNow;
    let resetChallengeHours = 0;
    let resetChallengeMinutes = 0;

    setInterval(() => {
        dateNow = Date.now();
        formatTimeLeft(deadline - dateNow);
        formatTimeLeftBattle(deadline2 - dateNow);
        getTimeUntilReset(); 
    }, 1000);

    function getTimeUntilReset() {
        const now = new Date();
        const targetHour = 14; 
        
        let targetDate = new Date();
        targetDate.setUTCHours(targetHour, 0, 0, 0);
        
        if (now.getUTCHours() >= targetHour) {
            targetDate.setUTCDate(targetDate.getUTCDate() + 1);
        }
        
        const diff = targetDate.getTime() - now.getTime();
        
        resetChallengeHours = Math.floor(diff / (1000 * 60 * 60));
        resetChallengeMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    }

    let searchTerm = '';
    let filters = {
        damage: false,
        res: false,
        heal: false,
        maxHp: false,
        stun:false
    };
    function toggleFilter(name) {
        filters[name] = !filters[name];
        filters = filters; 
    }
    $: filteredSkills = Array.isArray($skillData) 
    ? $skillData.filter(skill => {
        const searchMatch = !searchTerm || 
            skill.collections.toLowerCase().includes(searchTerm.toLowerCase());

        const damageMatch = !filters.damage || skill.dmg !== 0;
        const resMatch = !filters.res || skill.resChange !== 0;
        const healMatch = !filters.heal || skill.heal !== 0;
        const maxHpMatch = !filters.maxHp || skill.hpChange !== 0;
        const stunMatch = !filters.stun || skill.stunChance !== 0;
        return searchMatch && damageMatch && resMatch && healMatch && maxHpMatch &&stunMatch;
    }) 
    : [];

    function calculateTotalWithdrawable() {
        if (!withdrawList || withdrawList.length === 0) {
            return 0;
        }
        
        return withdrawList.reduce((total, item) => total + (item.value * 2), 0);
    }
</script>





 <!--Mobile notice--->
 <div class=" relative sm:hidden flex flex-col w-full min-h-screen font-Hoves bg-black text-white px-4">
    <div class="flex flex-col z-10 text-button text-xl font-semibold mx-auto my-auto gap-[5px]">
        <span class="font-bold">
            MOBILE UNSUPPORTED
        </span>
        <span>
            Game is curently not supporting mobile devices. Please use PC to access this.
        </span> 
    </div>

    <!-- animation-->
    <div class="containerLeaf">
        <div class="sakura"><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span><span></span><span></span><span></span>
        </div>
    </div>
</div>


<OnboardingManager {gameState} {allLoading} />







