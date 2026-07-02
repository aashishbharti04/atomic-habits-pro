import type { AppState, Suggestion } from "./types";
import { todayKey, uid } from "./logic";

export const ROUTINE_SCORECARD = [
  "Wake up at 6:00 AM",
  "Drink water",
  "Go to toilet, wash hands & face",
  "Cook breakfast (7:00–7:30 AM)",
  "Brush teeth",
  "Take a bath",
  "Call my mother",
  "Read before office (8:45 AM)",
  "Go to office & start work (weekdays)",
  "Lunch break & rest (1:00–2:00 PM)",
  "Work until 6:00 PM (weekdays)",
  "Return home & rest (till ~7:30 PM)",
  "Go to the park — play / walk (sometimes)",
  "Cook dinner",
  "Stop using phone at 9:00 PM",
  "Read at night",
  "Sleep at 10:30 PM",
];

export const ROUTINE_STACKS = [
  { after: "wake up at 6:00 AM", will: "drink a glass of water" },
  { after: "brush my teeth and take a bath", will: "call my mother" },
  { after: "stop using my phone at 9:00 PM", will: "read until bedtime" },
];

export const ROUTINE_INTENTIONS = [
  { behavior: "read", time: "8:45 AM", location: "home, before leaving for office" },
  { behavior: "stop using my phone", time: "9:00 PM", location: "home" },
  { behavior: "go to sleep", time: "10:30 PM", location: "my bed" },
];

export const STARTER_HABITS = [
  { name: "Meditate for 5 minutes", freq: "daily" as const },
  { name: "Plan tomorrow's top 3 tasks", freq: "weekdays" as const },
];
export const STARTER_STACKS = [
  { after: "drink my morning water", will: "meditate for 5 minutes" },
  { after: "finish work at 6:00 PM", will: "write tomorrow's top 3 tasks" },
];
export const STARTER_INTENTIONS = [
  { behavior: "meditate for 5 minutes", time: "6:05 AM", location: "my room" },
  { behavior: "plan tomorrow's top 3 tasks", time: "6:00 PM", location: "my office desk" },
];

export function seedRoutine(s: AppState): boolean {
  let changed = false;
  if (!s.scorecard.length) {
    s.scorecard = ROUTINE_SCORECARD.map((text) => ({ id: uid(), text, score: null }));
    changed = true;
  }
  if (!s.stacks.length) {
    s.stacks = ROUTINE_STACKS.map((x) => ({ id: uid(), ...x }));
    changed = true;
  }
  if (!s.intentions.length) {
    s.intentions = ROUTINE_INTENTIONS.map((x) => ({ id: uid(), ...x }));
    changed = true;
  }
  if (!s.habits.length) {
    s.habits = STARTER_HABITS.map((h) => ({ id: uid(), ...h, created: todayKey() }));
    for (const st of STARTER_STACKS) {
      if (!s.stacks.some((x) => x.will.toLowerCase() === st.will.toLowerCase()))
        s.stacks.push({ id: uid(), ...st });
    }
    for (const it of STARTER_INTENTIONS) {
      if (!s.intentions.some((x) => x.behavior.toLowerCase() === it.behavior.toLowerCase()))
        s.intentions.push({ id: uid(), ...it });
    }
    changed = true;
  }
  return changed;
}

export const TIPS = [
  "Make it obvious — put the cue for your habit where you can't miss it.",
  "Make it attractive — pair a habit you need with something you love (temptation bundling).",
  "Make it easy — use the Two-Minute Rule: scale any habit down to a two-minute version.",
  "Make it satisfying — reward yourself immediately; what is rewarded is repeated.",
  "Never miss twice. Missing once is an accident; missing twice is the start of a new habit.",
  "Every action is a vote for the type of person you wish to become.",
  "You do not rise to the level of your goals; you fall to the level of your systems.",
  "Environment beats motivation — design your space so the good choice is the easy choice.",
];

export const QUOTES = [
  "“You do not rise to the level of your goals. You fall to the level of your systems.”",
  "“Every action you take is a vote for the type of person you wish to become.”",
  "“Habits are the compound interest of self-improvement.”",
  "“Success is the product of daily habits — not once-in-a-lifetime transformations.”",
  "“The most effective form of motivation is progress.”",
];

export const SUGGESTIONS: Suggestion[] = [
  { emoji: "💧", cat: "Health", name: "Drink 2 liters of water", why: "Hydration lifts energy, focus and mood — most fatigue is mild dehydration.", twoMin: "Fill a bottle right after your morning glass of water.", anchor: "After I wake up and drink water, I will fill my day's water bottle.", freq: "daily" },
  { emoji: "🍎", cat: "Health", name: "Eat one fruit a day", why: "An easy nutrition win — fiber, vitamins and fewer junk cravings.", twoMin: "Keep a fruit visible on your desk or kitchen counter.", anchor: "After I cook breakfast, I will pack one fruit for the office.", freq: "daily" },
  { emoji: "🚶", cat: "Health", name: "Walk 10 minutes after lunch", why: "Post-meal walks improve digestion and cut the afternoon slump.", twoMin: "Just walk one lap around your office building.", anchor: "After I finish lunch (1–2 PM break), I will walk for 10 minutes.", freq: "weekdays" },
  { emoji: "😴", cat: "Health", name: "No screens 30 min before bed", why: "Blue light delays sleep; better sleep multiplies every other habit.", twoMin: "You already stop your phone at 9 PM — keep the streak visible here.", anchor: "After I stop using my phone at 9 PM, I will leave it outside the bedroom.", freq: "daily" },
  { emoji: "💪", cat: "Fitness", name: "Do 10 push-ups", why: "Strength compounds — 10 push-ups a day is 3,650 a year.", twoMin: "Start with 2 knee push-ups. Show up first, scale later.", anchor: "After I return home and change clothes, I will do 10 push-ups.", freq: "daily" },
  { emoji: "🧘", cat: "Fitness", name: "Stretch for 5 minutes", why: "Desk work tightens hips and back; daily mobility prevents pain.", twoMin: "Do one forward fold and one shoulder stretch.", anchor: "After I brush my teeth in the morning, I will stretch for 5 minutes.", freq: "daily" },
  { emoji: "🏸", cat: "Fitness", name: "Play or exercise in the park", why: "You already go sometimes — making it scheduled makes it identity.", twoMin: "Just put on your shoes and step outside.", anchor: "After I rest till 7:30 PM, I will go to the park.", freq: "daily" },
  { emoji: "🪜", cat: "Fitness", name: "Take the stairs", why: "Free cardio built into your office day — no willpower needed.", twoMin: "One floor counts. Elevator for the rest is fine.", anchor: "After I reach the office, I will take the stairs.", freq: "weekdays" },
  { emoji: "🧠", cat: "Mind", name: "Meditate for 5 minutes", why: "Trains focus and lowers stress — the highest-leverage mental habit.", twoMin: "Sit and take 10 slow breaths. That's it.", anchor: "After I drink my morning water, I will meditate for 5 minutes.", freq: "daily" },
  { emoji: "📓", cat: "Mind", name: "Journal one line", why: "One sentence a day builds self-awareness and a record of your life.", twoMin: "Write literally one line: 'Today the best thing was…'", anchor: "After I start reading at 9 PM, I will first write one line in my journal.", freq: "daily" },
  { emoji: "🙏", cat: "Mind", name: "Write 3 things you're grateful for", why: "Gratitude is the most replicated happiness intervention in psychology.", twoMin: "Name them out loud if writing feels like too much.", anchor: "After I get into bed at 10:30 PM, I will list 3 good things.", freq: "daily" },
  { emoji: "🎧", cat: "Mind", name: "Learn 15 minutes (course / podcast)", why: "15 focused minutes a day is ~90 hours of new skill in a year.", twoMin: "Queue one lesson or episode during your commute.", anchor: "After I leave for the office, I will play one lesson on the way.", freq: "weekdays" },
  { emoji: "📝", cat: "Productivity", name: "Plan tomorrow's top 3 tasks", why: "A 2-minute shutdown ritual beats an hour of morning confusion.", twoMin: "Write just the single most important task.", anchor: "After I finish work at 6 PM, I will write tomorrow's top 3.", freq: "weekdays" },
  { emoji: "⏱️", cat: "Productivity", name: "First hour = deep work, no email", why: "Your morning focus is your scarcest resource — spend it on real work.", twoMin: "Close the inbox tab for just the first 15 minutes.", anchor: "After I reach the office and sit down, I will do deep work first.", freq: "weekdays" },
  { emoji: "🧹", cat: "Productivity", name: "Clear desk before leaving", why: "A reset environment makes tomorrow's start frictionless.", twoMin: "Put away 3 things and close all tabs.", anchor: "After I write tomorrow's top 3, I will clear my desk.", freq: "weekdays" },
  { emoji: "🗂️", cat: "Productivity", name: "Weekly review", why: "30 minutes on the weekend keeps goals, money and tasks on track.", twoMin: "Just review your habit tracker for the week.", anchor: "After I cook breakfast on Sunday, I will do my weekly review.", freq: "weekends" },
  { emoji: "💬", cat: "Relationships", name: "Message one friend", why: "Relationships are the #1 predictor of long-term happiness — maintain them in 2 minutes.", twoMin: "Send one 'thinking of you' text.", anchor: "After I finish lunch, I will message one friend.", freq: "daily" },
  { emoji: "👥", cat: "Relationships", name: "Weekend time with people you love", why: "Scheduled connection beats leftover time — your weekends are free.", twoMin: "Make one plan: a call, a meal, a walk together.", anchor: "After I finish Saturday breakfast, I will make one plan with someone.", freq: "weekends" },
  { emoji: "🙌", cat: "Relationships", name: "Give one genuine compliment", why: "Costs nothing, compounds trust at work and at home.", twoMin: "Notice one thing someone did well and say it.", anchor: "After I start work, I will appreciate one colleague's work today.", freq: "weekdays" },
  { emoji: "💰", cat: "Money", name: "Track today's expenses", why: "Awareness is to money what the scorecard is to habits.", twoMin: "Log just the total you spent today — one number.", anchor: "After I stop using my phone at 9 PM, I will first log today's expenses.", freq: "daily" },
  { emoji: "🏦", cat: "Money", name: "Weekly money check-in", why: "15 minutes: review spending, move savings, no surprises at month-end.", twoMin: "Just open your bank app and read the balance mindfully.", anchor: "After my Sunday weekly review, I will do a money check-in.", freq: "weekends" },
  { emoji: "🚫", cat: "Money", name: "One no-spend day a week", why: "Builds the muscle of contentment and breaks impulse-buying loops.", twoMin: "Pick the day each week — put it on the tracker.", anchor: "After my Saturday morning routine, I will make Saturday a no-spend day.", freq: "weekends" },
];
