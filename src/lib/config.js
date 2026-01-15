const mode = "mainnet";
const status = "production";

export default {
    rpcUrl: mode === "mainnet" && status === "production" ? "https://api.marena.space" : "http://localhost:443",
    indexerUrl: mode === "mainnet" && status === "production" ? "http://localhost:444" : "http://localhost:444",
    chainId: mode === "mainnet"  ? "0x1388" : "",
    ethRpcUrl: mode === "mainnet" ? "https://rpc.mantle.xyz" : "",
    chainName: mode === "mainnet" ? "Mantle Mainnet" : "Mantle Testnet",
    nativeCurrency: {
        name: "MNT",
        symbol: "MNT",
        decimals: 18
    },
    blockExplorerUrls: "https://mantlescan.xyz",
    site: "https://marena.space",
    twitter: "",
    discord: ""
}