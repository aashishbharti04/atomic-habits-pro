"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { levelInfo, xpTotal } from "@/lib/logic";
import { QUOTES } from "@/lib/seeds";
import {
  AtomIcon, BookOpenIcon, BotIcon, CalendarIcon, ChartIcon, ClipboardIcon,
  DownloadIcon, FileIcon, FlagIcon, HomeIcon, JournalIcon, LinkIcon,
  MoonIcon, SparkleIcon, SunIcon, TargetIcon, UploadIcon,
} from "./icons";

const NAV: { label: string; items: { href: string; name: string; icon: React.ReactNode }[] }[] = [
  {
    label: "Track",
    items: [
      { href: "/", name: "Today", icon: <HomeIcon /> },
      { href: "/calendar", name: "Calendar", icon: <CalendarIcon /> },
      { href: "/insights", name: "Insights", icon: <ChartIcon /> },
      { href: "/coach", name: "Coach", icon: <BotIcon /> },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/discover", name: "Discover", icon: <SparkleIcon /> },
      { href: "/goals", name: "Goals", icon: <FlagIcon /> },
      { href: "/stacks", name: "Stacks", icon: <LinkIcon /> },
      { href: "/intentions", name: "Intentions", icon: <TargetIcon /> },
      { href: "/scorecard", name: "Scorecard", icon: <ClipboardIcon /> },
    ],
  },
  {
    label: "Reflect",
    items: [
      { href: "/journal", name: "Journal", icon: <JournalIcon /> },
      { href: "/contract", name: "Contract", icon: <FileIcon /> },
      { href: "/guide", name: "Guide", icon: <BookOpenIcon /> },
    ],
  },
];

const PAGE_META: Record<string, [string, string]> = {
  "/": ["Today", ""],
  "/calendar": ["Habit Tracker", "Don't break the chain"],
  "/insights": ["Insights", "Your consistency, habit strength and achievements at a glance"],
  "/coach": ["Coach", "Patterns, risks and recommendations — computed from your own history"],
  "/discover": ["Discover", "Positive habits worth adopting — start with the two-minute version"],
  "/goals": ["Goals", "Link habits to outcomes — the system gets you there"],
  "/stacks": ["Habit Stacking", "After [current habit], I will [new habit]"],
  "/intentions": ["Implementation Intentions", "I will [behavior] at [time] in [location]"],
  "/scorecard": ["Habits Scorecard", "Rate every behavior in your day: + good · = neutral · – bad"],
  "/journal": ["Journal", "Daily reflection — five questions, two minutes"],
  "/contract": ["Habit Contract", "Make breaking your habit public and painful"],
  "/guide": ["Guide", "The habit loop, the four laws, and answers to common questions"],
};

function XpWidget() {
  const { state } = useApp();
  if (!state) return <div className="xp-widget" />;
  const { lvl, rem, need, title } = levelInfo(xpTotal(state));
  return (
    <div className="xp-widget">
      <div className="xp-top">
        <span className="xp-level">{lvl}</span>
        <span className="xp-title">
          <b>{title}</b>
          <small>{xpTotal(state)} XP · {need - rem} to next</small>
        </span>
      </div>
      <div className="xp-bar">
        <span className="xp-fill" style={{ width: `${Math.round((rem / need) * 100)}%` }} />
      </div>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toasts, exportJson, exportCsv, importJson, toast } = useApp();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("atomicHabitsTheme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("atomicHabitsTheme", next);
  };

  const [title, sub] = PAGE_META[pathname] ?? ["Atomic Habits", ""];
  const todaySub = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark"><AtomIcon /></div>
          <div className="logo-text">
            <strong>Atomic Habits</strong>
            <span>1% better every day</span>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((group) => (
            <div key={group.label} style={{ display: "contents" }}>
              <p className="nav-label">{group.label}</p>
              {group.items.map((it) => (
                <Link key={it.href} href={it.href} className={`nav-item ${pathname === it.href ? "active" : ""}`}>
                  {it.icon}
                  <span>{it.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <XpWidget />
        <div className="sidebar-foot">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle light / dark theme">
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button className="icon-btn" onClick={exportJson} title="Export data (JSON)"><DownloadIcon /></button>
          <button className="icon-btn" onClick={exportCsv} title="Export history (CSV)"><ChartIcon /></button>
          <button className="icon-btn" onClick={() => fileRef.current?.click()} title="Import data (JSON) — works with v1 exports"><UploadIcon /></button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (!importJson(String(reader.result))) toast("Invalid JSON file");
              };
              reader.readAsText(f);
              e.target.value = "";
            }}
          />
        </div>
      </aside>

      <div className="content">
        <header className="page-head">
          <div>
            <h1>{title}</h1>
            <p className="page-sub">{pathname === "/" ? todaySub : sub}</p>
          </div>
          <div className="page-quote">{quote}</div>
        </header>
        <main className="page">{children}</main>
        <footer className="app-foot">
          Atomic Habits Pro · your data stays in your browser (localStorage) · inspired by James Clear
        </footer>
      </div>

      <div className="toast-zone">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
