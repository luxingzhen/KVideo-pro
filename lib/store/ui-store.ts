import { create } from 'zustand';

interface UIState {
  isFavoritesOpen: boolean;
  isHistoryOpen: boolean;
  toggleFavorites: () => void;
  setFavoritesOpen: (isOpen: boolean) => void;
  toggleHistory: () => void;
  setHistoryOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isFavoritesOpen: false,
  isHistoryOpen: false,
  toggleFavorites: () => set((state) => ({ isFavoritesOpen: !state.isFavoritesOpen })),
  setFavoritesOpen: (isOpen) => set({ isFavoritesOpen: isOpen }),
  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),
  setHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
}));
