import { create } from 'zustand';

export type ViewState = 'intro' | 'carousel' | 'ring' | 'about';

interface PreviousViewState {
  view: ViewState;
  planetId: string;
  projectId: string | null;
}

interface AppState {
  // View state
  view: ViewState;
  focusedPlanetId: string;
  focusedProjectId: string | null;
  previousView: PreviousViewState | null;
  introCompleted: boolean;

  // Audio
  muted: boolean;
  volume: number;

  // Preferences
  reducedMotion: boolean;
  isMobile: boolean;
  isSpinning: boolean;

  // Actions
  setView: (view: ViewState) => void;
  focusPlanet: (id: string) => void;
  setIsSpinning: (v: boolean) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
  openAboutMe: () => void;
  exitAboutMe: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setReducedMotion: (v: boolean) => void;
  setIsMobile: (v: boolean) => void;
  completeIntro: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'intro',
  focusedPlanetId: 'mercury',
  focusedProjectId: null,
  previousView: null,
  introCompleted: false,

  muted: false,
  volume: 0.5,

  reducedMotion: false,
  isMobile: false,
  isSpinning: false,

  setView: (view) => set({ view }),

  focusPlanet: (id) => set({ focusedPlanetId: id }),

  setIsSpinning: (isSpinning) => set({ isSpinning }),

  openProject: (id) => set({
    focusedProjectId: id,
    view: 'ring',
  }),

  closeProject: () => set({
    focusedProjectId: null,
    view: 'carousel',
  }),

  openAboutMe: () => {
    const state = get();
    set({
      previousView: {
        view: state.view,
        planetId: state.focusedPlanetId,
        projectId: state.focusedProjectId,
      },
      view: 'about',
    });
  },

  exitAboutMe: () => {
    const state = get();
    if (state.previousView) {
      set({
        view: state.previousView.view,
        focusedPlanetId: state.previousView.planetId,
        focusedProjectId: state.previousView.projectId,
        previousView: null,
      });
    } else {
      set({ view: 'carousel', previousView: null });
    }
  },

  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setVolume: (v) => set({ volume: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setIsMobile: (v) => set({ isMobile: v }),
  completeIntro: () => set({ introCompleted: true, view: 'carousel' }),
}));
