# Mantle Arena

Mantle Arena is a PvP game where players can form squads with any NFTs, unleash unique auto-generated skills from each NFT trait, and battle others for staked $MNT.

https://marena.space/

# Demo material

* Website: https://marena.space/
* Demo video: https://youtu.be/kjw8FuI3zrA
* Contract Mantle Arena: https://mantlescan.xyz/address/0x24FF4C118ABC95E74932334FCB0FF717172c1A1d
* Deck: https://docs.google.com/presentation/d/14L1pvNV9NUmxRdap6OGrILfyPW1FQl_ZnxdVhc-VNek/edit?usp=sharing
* Full detail submission on Hackquest: https://www.hackquest.io/projects/Mantle-Arena

# How to run

* Run npm install to install dependencies
* Execute npm run dev and visit http://localhost:5173/

# Utilizing Mantle network

* Use $MNT as stake for each battle, winner takes $MNT from loser
* Utilizing Mantle network's fast transaction speed with low gas fees ensures seamless and efficient interactions such as instantly creating matches and challenging others, greatly enhancing the gaming experience.

# Technical Workflow

* User chooses 3 NFTs then stakes $MNT to contract to create struct with unique battleID in contract
* Backend verifies on-chain data and creates a queue with that battleID and the NFT squad user chose
* Other user who joins that battleID must deposit the same amount of money to contract and choose 3 NFTs to battle
* After verifying on-chain, backend processes battle and returns the signature to address who won to withdraw the stake (the contract nonce prevents signature reuse and has rule that only defender or attacker can withdraw money)

# Team

* Quan Nguyen: Project Manager & Lead Developer - Oversees business model and overall architecture.
* Minh Nguyen: Full-Stack Developer - Develops and maintains game engine & smart contract
* Oanh Kim - Full-Stack Developer - Builds front-end interfaces and integrates game assets.

# Contact

**npquan2209@gmail.com** 
