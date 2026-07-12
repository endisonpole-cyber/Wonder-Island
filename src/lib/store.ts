"use client";

import { create } from "zustand";
import { GameState, ThemeId, StationType, ActState, StationState } from "./store-types";

const defaultStation = (): StationState => ({
  completed: false,
  score: 0,
  stars: 0,
});

const defaultAct = (): ActState => ({
  stations: {
    story: defaultStation(),
    math: defaultStation(),
    english: defaultStation(),
    science: defaultStation(),
    thinking: defaultStation(),
  },
  crystalsCollected: 0,
  totalCrystals: 5,
  unlocked: false,
});

const defaultThemeState = () => ({
  acts: [defaultAct(), defaultAct(), defaultAct()],
  crystalsCollected: 0,
});

const initialThemes: Record<ThemeId, ReturnType<typeof defaultThemeState>> = {
  space: defaultThemeState(),
  animals: defaultThemeState(),
  plants: defaultThemeState(),
};

// Unlock first act of space theme by default
initialThemes.space.acts[0].unlocked = true;

export const useGameStore = create<GameState>((set, get) => ({
  playerName: "",
  currentTheme: null,
  currentAct: 0,
  currentStation: null,
  themes: initialThemes,
  totalScore: 0,
  wordsLearned: [],
  thinkingAnswers: [],

  setPlayerName: (name) => set({ playerName: name }),

  selectTheme: (theme) =>
    set({
      currentTheme: theme,
      currentAct: 0,
      currentStation: null,
    }),

  selectAct: (act) => set({ currentAct: act, currentStation: null }),

  selectStation: (station) => set({ currentStation: station }),

  completeStation: (station, score, stars) => {
    const { currentTheme, currentAct, themes } = get();
    if (!currentTheme) return;

    const updated = { ...themes };
    const themeState = { ...updated[currentTheme] };
    const acts = [...themeState.acts];
    const act = { ...acts[currentAct] };
    const stations = { ...act.stations };
    stations[station] = { completed: true, score, stars };
    act.stations = stations;
    act.crystalsCollected = Math.min(act.crystalsCollected + 1, act.totalCrystals);
    acts[currentAct] = act;

    // Unlock next act if all stations complete
    if (currentAct < 2) {
      const nextAct = { ...acts[currentAct + 1] };
      nextAct.unlocked = true;
      acts[currentAct + 1] = nextAct;
    }

    themeState.acts = acts;
    themeState.crystalsCollected = acts.reduce((sum, a) => sum + a.crystalsCollected, 0);
    updated[currentTheme] = themeState;

    set({
      themes: updated,
      totalScore: get().totalScore + score,
    });
  },

  collectCrystal: (count) => {
    const { currentTheme, currentAct, themes } = get();
    if (!currentTheme) return;

    const updated = { ...themes };
    const themeState = { ...updated[currentTheme] };
    const acts = [...themeState.acts];
    const act = { ...acts[currentAct] };
    act.crystalsCollected = Math.min(act.crystalsCollected + count, act.totalCrystals);
    acts[currentAct] = act;
    themeState.acts = acts;
    updated[currentTheme] = themeState;

    set({ themes: updated });
  },

  learnWord: (word) => {
    const { wordsLearned } = get();
    if (!wordsLearned.includes(word)) {
      set({ wordsLearned: [...wordsLearned, word] });
    }
  },

  addThinkingAnswer: (answer) =>
    set({ thinkingAnswers: [...get().thinkingAnswers, answer] }),

  resetProgress: () => {
    // 重置所有游戏进度，保留玩家名与当前主题选择
    const { playerName, currentTheme } = get();
    const freshThemes: Record<ThemeId, ReturnType<typeof defaultThemeState>> = {
      space: defaultThemeState(),
      animals: defaultThemeState(),
      plants: defaultThemeState(),
    };
    freshThemes.space.acts[0].unlocked = true;

    set({
      playerName,
      currentTheme,
      currentAct: 0,
      currentStation: null,
      themes: freshThemes,
      totalScore: 0,
      wordsLearned: [],
      thinkingAnswers: [],
    });
  },

  goBack: () => set({ currentStation: null }),

  getActState: () => {
    const { currentTheme, currentAct, themes } = get();
    if (!currentTheme) return null;
    return themes[currentTheme].acts[currentAct] || null;
  },

  getCurrentStationState: () => {
    const { currentTheme, currentAct, currentStation, themes } = get();
    if (!currentTheme || !currentStation) return null;
    return themes[currentTheme].acts[currentAct]?.stations[currentStation] || null;
  },
}));
