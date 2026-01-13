import { writable } from 'svelte/store';

export const musicEnabled = writable(false);
export const currentTrack = writable(null);
export const isPlaying = writable(false);