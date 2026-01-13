// $lib/wallet.js
import { writable } from 'svelte/store';
import { ethers } from 'ethers';
import config from './config.js';

export const walletState = writable({
    isConnected: false,
    chainId: '',
    address: '',
    provider: null,
    signer: null,
    error: null
});

export function isMetaMaskInstalled() {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
}

// Clear wallet state helper
function clearWalletState() {
    walletState.set({
        isConnected: false,
        chainId: '',
        address: '',
        provider: null,
        signer: null,
        error: null
    });
}

export async function connectWallet() {
    try {
        // Reset wallet state first
        clearWalletState();
        
        // Check if MetaMask is installed
        if (!isMetaMaskInstalled()) {
            window.open("https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank");
            throw new Error('MetaMask is not installed');
        }
        
        // Check if correct network is added
        try {
            // Try to switch to the correct network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: config.chainId }],
            });
        } catch (error) {
            // If network not added (error code 4902), add it
            if (error.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: config.chainId,
                        rpcUrls: [config.ethRpcUrl],
                        chainName: config.chainName,
                        nativeCurrency: {
                            name: config.nativeCurrency.name,
                            symbol: config.nativeCurrency.symbol,
                            decimals: 18
                        },
                        blockExplorerUrls: [config.blockExplorerUrls]
                    }]
                });
            } else {
                throw error;
            }
        }
        
        // Now request accounts after network is correct
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts'  // <-- This forces it!
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
        // Initialize provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        // Update the store
        walletState.update(state => ({
            ...state,
            isConnected: true,
            chainId: '0x' + network.chainId.toString(16),
            address,
            provider,
            signer
        }));
        
        return { success: true, address, provider, signer };
    } catch (error) {
        console.error('Wallet connection error:', error);
        walletState.update(state => ({
            ...state,
            isConnected: false,
            error: error.message
        }));
        return { success: false, error: error.message };
    }
}

export function disconnectWallet() {
    clearWalletState();
}

export async function checkExistingConnection() {
    try {
        if (!isMetaMaskInstalled()) {
            return { success: false };
        }
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_accounts'
        });
        
        // If no accounts connected
        if (!accounts || accounts.length === 0) {
            clearWalletState();
            return { success: false };
        }
        
        // Check if on correct chainId
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const currentChainId = '0x' + network.chainId.toString(16);
        

        if (currentChainId !== config.chainId) {
            clearWalletState();
            return { success: false };
       
        }
        
        // Get current active wallet
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Initialize provider, signer, address and update walletstate
        walletState.update(state => ({
            ...state,
            isConnected: true,
            chainId: currentChainId,
            address,
            provider,
            signer
        }));
        
        
        return { success: true, address, provider, signer };
    } catch (error) {
        console.error('Error checking existing connection:', error);
        clearWalletState();
        return { success: false, error: error.message };
    }
}

// Set up event listeners
if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {

            // Account changed - reconnect with new wallet
            clearWalletState();
            location.reload();
    
    });
    
    window.ethereum.on('chainChanged', () => {
        // Chain changed - reload page
        clearWalletState();
    });
    
    window.ethereum.on('disconnect', () => {
        clearWalletState();
    });
}