import { create } from "zustand";

export type AddVideoTab = "youtube" | "upload";

interface UiState {
  isAddVideoOpen: boolean;
  addVideoTab: AddVideoTab;
  openAddVideoModal: (tab?: AddVideoTab) => void;
  closeAddVideoModal: () => void;
  activeSeekTime: number | null;
  setActiveSeekTime: (seconds: number | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isAddVideoOpen: false,
  addVideoTab: "youtube",
  openAddVideoModal: (tab = "youtube") =>
    set({ isAddVideoOpen: true, addVideoTab: tab }),
  closeAddVideoModal: () => set({ isAddVideoOpen: false }),
  activeSeekTime: null,
  setActiveSeekTime: (seconds) => set({ activeSeekTime: seconds }),
}));
