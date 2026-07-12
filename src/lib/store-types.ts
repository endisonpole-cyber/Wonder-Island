"use client";

import { create } from "zustand";

// Theme types
export type ThemeId = "space" | "animals" | "plants";

// Station types within an act
export type StationType = "story" | "math" | "english" | "science" | "thinking";

// Game state for a single station
export interface StationState {
  completed: boolean;
  score: number;
  stars: number; // 0-3
}

// Act state
export interface ActState {
  stations: Record<StationType, StationState>;
  crystalsCollected: number;
  totalCrystals: number;
  unlocked: boolean;
}

// Theme state
export interface ThemeState {
  acts: ActState[];
  crystalsCollected: number;
}

// Overall game state
export interface GameState {
  playerName: string;
  currentTheme: ThemeId | null;
  currentAct: number;
  currentStation: StationType | null;
  themes: Record<ThemeId, ThemeState>;
  totalScore: number;
  wordsLearned: string[];
  thinkingAnswers: string[];

  // Actions
  setPlayerName: (name: string) => void;
  selectTheme: (theme: ThemeId) => void;
  selectAct: (act: number) => void;
  selectStation: (station: StationType) => void;
  completeStation: (station: StationType, score: number, stars: number) => void;
  collectCrystal: (count: number) => void;
  learnWord: (word: string) => void;
  addThinkingAnswer: (answer: string) => void;
  goBack: () => void;
  resetProgress: () => void;

  // Derived helpers
  getActState: () => ActState | null;
  getCurrentStationState: () => StationState | null;
}
