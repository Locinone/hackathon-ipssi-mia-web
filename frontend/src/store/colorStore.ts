import { create } from 'zustand';

interface ColorState {
    baseHue: number;
    color1: string;
    color2: string;
    color3: string;
    gradient: string;
    generateRandomGradient: () => void;
}

export const useColorStore = create<ColorState>((set) => ({
    baseHue: Math.floor(Math.random() * 360),
    color1: '',
    color2: '',
    color3: '',
    gradient: '',
    generateRandomGradient: () => {
        const baseHue = Math.floor(Math.random() * 360);

        const color1 = `hsl(${baseHue}, 80%, 40%)`;
        const color2 = `hsl(${(baseHue + 30) % 360}, 80%, 70%)`;
        const color3 = `hsl(${(baseHue + 15) % 360}, 80%, 30%)`;

        const gradient = `linear-gradient(${Math.floor(Math.random() * 360)}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;

        set({ baseHue, color1, color2, color3, gradient });
    },
}));

// Initialiser le gradient au démarrage
useColorStore.getState().generateRandomGradient();
