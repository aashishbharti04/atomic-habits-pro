export type Freq = "daily" | "weekdays" | "weekends";
export type CheckValue = true | "skip";
export type Score = "+" | "-" | "=" | null;

export interface Habit {
  id: string;
  name: string;
  freq: Freq;
  created: string; // YYYY-MM-DD
}

export interface ScoreItem {
  id: string;
  text: string;
  score: Score;
}

export interface Stack {
  id: string;
  after: string;
  will: string;
}

export interface Intention {
  id: string;
  behavior: string;
  time: string;
  location: string;
}

export interface Goal {
  id: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  targetReps: number;
  habitIds: string[];
  created: string; // YYYY-MM-DD
}

export interface JournalEntry {
  well: string;
  improve: string;
  win: string;
  distraction: string;
  priority: string;
}

export interface Contract {
  promise: string;
  penalty: string;
  partner: string;
  name: string;
  date: string;
}

export interface AppState {
  habits: Habit[];
  checks: Record<string, Record<string, CheckValue>>;
  scorecard: ScoreItem[];
  stacks: Stack[];
  intentions: Intention[];
  goals: Goal[];
  journal: Record<string, JournalEntry>;
  contract: Contract;
}

export interface Suggestion {
  emoji: string;
  cat: string;
  name: string;
  why: string;
  twoMin: string;
  anchor: string;
  freq: Freq;
}

export interface CoachCard {
  tone: "good" | "info" | "warn" | "risk";
  icon: string;
  title: string;
  body: string;
}

export const defaultState: AppState = {
  habits: [],
  checks: {},
  scorecard: [],
  stacks: [],
  intentions: [],
  goals: [],
  journal: {},
  contract: { promise: "", penalty: "", partner: "", name: "", date: "" },
};
