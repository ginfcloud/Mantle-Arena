import { musicEnabled, currentTrack, isPlaying } from './musicStore.js';
import { get } from 'svelte/store';

class MusicManager {
    constructor() {
        this.backgroundMusic = null;
        this.soundEffects = new Map();
        this.fadeInterval = null;
        this.volume = 0.3;
        this.hasUserInteracted = false; // Add this flag

        this.pageMusic = {
            '/game/battle': 'battle-theme',
            '/game/trainingRoomBattle': 'battle-theme',
            '/game': 'background-theme',
            'default': 'background-theme'
        };
    }


    // Add this method to enable audio after user interaction
    enableAudio() {
        this.hasUserInteracted = true;
    }

    async setMusicForPage(pathname) {
        if (!get(musicEnabled) || !this.hasUserInteracted) return;
        
        // Find matching music for the page
        let songName = this.pageMusic['default'];
        
        for (const [page, song] of Object.entries(this.pageMusic)) {
            if (pathname.includes(page)) {
                songName = song;
                break;
            }
        }
        
        // Only change if it's different from current
        if (this.pendingTrack !== songName) {
            await this.playMusic(songName);
        }
        console.log(songName, "songNamesongName")
    }

    async playMusic(songName) {
        if (!get(musicEnabled) || !this.hasUserInteracted) return;

        const newTrack = `/game/music/${songName}.ogg`;
        
        if (get(currentTrack) === newTrack && this.backgroundMusic && !this.backgroundMusic.paused) {
            return;
        }

        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            await this.fadeOut(this.backgroundMusic);
        }

        this.backgroundMusic = new Audio(newTrack);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0;
        
        try {
            await this.backgroundMusic.play();
            currentTrack.set(newTrack);
            isPlaying.set(true);
            await this.fadeIn(this.backgroundMusic);
        } catch (error) {
            console.error('Failed to play music:', error);
        }
    }

    playSound(soundName) {
        if (!get(musicEnabled) || !this.hasUserInteracted) return;

        const sound = new Audio(`/game/music/effects/${soundName}.ogg`);
        sound.volume = this.volume;
        sound.play().catch(error => console.error('Failed to play sound:', error));
    }

    async toggleMusic() {
        // Enable audio on first interaction
        if (!this.hasUserInteracted) {
            this.enableAudio();
        }

        const enabled = !get(musicEnabled);
        musicEnabled.set(enabled);
        
        if (!enabled) {
            await this.stopMusic();
        } else {
            // Start music when enabling
            await this.playMusic('background-theme');
        }
    }

    async stopMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            await this.fadeOut(this.backgroundMusic);
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
        currentTrack.set(null);
        isPlaying.set(false);
    }

    async fadeIn(audio, duration = 1000) {
        return new Promise((resolve) => {
            const steps = 50;
            const stepTime = duration / steps;
            const volumeStep = this.volume / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                audio.volume = Math.min(volumeStep * currentStep, this.volume);
                
                if (currentStep >= steps) {
                    clearInterval(interval);
                    resolve();
                }
            }, stepTime);
        });
    }

    async fadeOut(audio, duration = 1000) {
        return new Promise((resolve) => {
            const steps = 50;
            const stepTime = duration / steps;
            const volumeStep = audio.volume / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                audio.volume = Math.max(audio.volume - volumeStep, 0);
                
                if (currentStep >= steps || audio.volume <= 0) {
                    clearInterval(interval);
                    audio.volume = 0;
                    resolve();
                }
            }, stepTime);
        });
    }
}

export const musicManager = new MusicManager();