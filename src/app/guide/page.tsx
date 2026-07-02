const LOOP = [
  { n: 1, name: "Cue", desc: "The trigger that initiates the behavior. It predicts a reward." },
  { n: 2, name: "Craving", desc: "The motivational force. You crave the change in state, not the habit itself." },
  { n: 3, name: "Response", desc: "The actual habit you perform — a thought or an action." },
  { n: 4, name: "Reward", desc: "The end goal. Rewards satisfy the craving and teach the brain to repeat the loop." },
];

const QA = [
  ["How long does it take to build a habit?", "The honest answer: forever — because a habit stops being a habit once you stop doing it. What matters isn't time but frequency: habits form based on the number of repetitions, not the number of days. Stop asking \"how long\" and just put in your reps."],
  ["What should I do when I miss a day?", "Follow the rule: never miss twice. Missing once is an accident; missing twice is the start of a new (bad) habit. The first mistake is never the one that ruins you — it's the spiral of repeated mistakes that follows."],
  ["Where do I start if I want to change?", "Start with identity, not outcomes. Instead of \"I want to run a marathon\" (outcome), aim for \"I am a runner\" (identity). Every action you take is a vote for the type of person you wish to become."],
  ["How do I break a bad habit?", "Invert the four laws: make it invisible (remove the cue), unattractive (reframe the benefits of avoiding it), difficult (increase friction, use commitment devices), and unsatisfying (accountability partner + habit contract)."],
  ["Why do small habits matter so much?", "Habits are the compound interest of self-improvement. Getting 1% better every day makes you ~37× better after one year. Success is the product of daily habits, not once-in-a-lifetime transformations."],
  ["What if a habit feels boring or I lose motivation?", "Everyone faces the same challenge: the plateau of latent potential. Habits often appear to make no difference until you cross a critical threshold. The work is never wasted — it's being stored. Professionals stick to the schedule; amateurs let life get in the way."],
];

export default function GuidePage() {
  return (
    <>
      <div className="card">
        <h2>The Habit Loop</h2>
        <p className="explain">Every habit runs through the same four-step loop. Understand the loop and you can redesign any habit.</p>
        <div className="loop-diagram">
          {LOOP.map((step, i) => (
            <div key={step.n} style={{ display: "contents" }}>
              <div className="loop-step">
                <span className="loop-num">{step.n}</span>
                <b>{step.name}</b>
                <p>{step.desc}</p>
              </div>
              {i < LOOP.length - 1 && <div className="loop-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Habits Cheat Sheet — The Four Laws</h2>
        <div className="laws-grid" style={{ marginTop: ".9rem" }}>
          <div className="law">
            <h3><span className="law-badge">1</span> Make It Obvious</h3>
            <ul>
              <li>Fill out the <b>Habits Scorecard</b> to become aware of your habits.</li>
              <li>Use <b>implementation intentions</b>: &quot;I will [behavior] at [time] in [location].&quot;</li>
              <li>Use <b>habit stacking</b>: &quot;After [current habit], I will [new habit].&quot;</li>
              <li><b>Design your environment</b> — make the cues of good habits visible.</li>
            </ul>
            <p className="inversion"><b>Inversion — Make It Invisible:</b> reduce exposure; remove the cues of bad habits from your environment.</p>
          </div>
          <div className="law">
            <h3><span className="law-badge">2</span> Make It Attractive</h3>
            <ul>
              <li>Use <b>temptation bundling</b> — pair an action you want with one you need.</li>
              <li><b>Join a culture</b> where your desired behavior is the normal behavior.</li>
              <li>Create a <b>motivation ritual</b> — do something you enjoy right before a difficult habit.</li>
            </ul>
            <p className="inversion"><b>Inversion — Make It Unattractive:</b> reframe your mindset; highlight the benefits of avoiding the bad habit.</p>
          </div>
          <div className="law">
            <h3><span className="law-badge">3</span> Make It Easy</h3>
            <ul>
              <li><b>Reduce friction</b> — decrease the steps between you and good habits.</li>
              <li><b>Prime the environment</b> — prepare it so future actions are easy.</li>
              <li>Master the <b>decisive moment</b> — optimize the small choices with big impact.</li>
              <li>Use the <b>Two-Minute Rule</b> — downscale habits until they take two minutes.</li>
              <li><b>Automate</b> — invest in technology and one-time choices that lock in behavior.</li>
            </ul>
            <p className="inversion"><b>Inversion — Make It Difficult:</b> increase friction; use commitment devices to restrict future choices.</p>
          </div>
          <div className="law">
            <h3><span className="law-badge">4</span> Make It Satisfying</h3>
            <ul>
              <li>Use <b>reinforcement</b> — give yourself an immediate reward on completion.</li>
              <li>Make &quot;doing nothing&quot; enjoyable when avoiding a bad habit.</li>
              <li>Use a <b>habit tracker</b> — keep the streak alive and &quot;don&apos;t break the chain.&quot;</li>
              <li><b>Never miss twice</b> — when you forget, get back on track immediately.</li>
            </ul>
            <p className="inversion"><b>Inversion — Make It Unsatisfying:</b> get an accountability partner; sign a <b>habit contract</b> so breaking the habit is public and painful.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Questions &amp; Answers</h2>
        <div style={{ marginTop: ".9rem" }}>
          {QA.map(([q, a]) => (
            <details key={q} className="qa">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Sources</h3>
        <p className="explain" style={{ margin: 0 }}>
          Based on <i>Atomic Habits</i> by James Clear and its official companion resources: The Habit Loop,
          Habits Cheat Sheet, The Habits Scorecard, Implementation Intentions, Habit Stack, Habit Tracker,
          Habit Contract, and Q&amp;A. See{" "}
          <a href="https://jamesclear.com/atomic-habits" target="_blank" rel="noopener noreferrer">jamesclear.com/atomic-habits</a>{" "}
          and the <a href="https://jamesclear.com/atomic-habits/endnotes" target="_blank" rel="noopener noreferrer">endnotes</a>.
        </p>
      </div>
    </>
  );
}
