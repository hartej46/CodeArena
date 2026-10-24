import { useState, useMemo } from "react";

// ──────────────────────────────────────────────
//  DATA: Multi-language learning tracks
// ──────────────────────────────────────────────
const LANGUAGE_TRACKS = {
  Python: {
    name: "Python 3",
    shortName: "Python",
    badge: "PY",
    icon: "🐍",
    progress: 70,
    masteredCount: 14,
    totalCount: 20,
    weakAreas: 6,
    diagnosticScore: 70,
    level: "Intermediate Track",
    currentModule: "Recursion & Edge-Case Boundaries",
    upcomingTopics: [
      {
        id: 1,
        title: "Recursion & Base Case Boundaries",
        tag: "Weakness Detected",
        duration: "15 min",
        status: "next",
        label: "Next Up",
      },
      {
        id: 2,
        title: "Sliding Window & Two Pointers",
        tag: "Logic Gap",
        duration: "20 min",
        status: "upcoming",
        label: "Up Next",
      },
      {
        id: 3,
        title: "HashMap Time-Complexity Optimization",
        tag: "Time Complexity",
        duration: "25 min",
        status: "upcoming",
        label: "Queued",
      },
    ],
  },
  JavaScript: {
    name: "JavaScript ES6+",
    shortName: "JavaScript",
    badge: "JS",
    icon: "⚡",
    progress: 55,
    masteredCount: 11,
    totalCount: 20,
    weakAreas: 9,
    diagnosticScore: 55,
    level: "Intermediate Track",
    currentModule: "Async Promises & Event Loop",
    upcomingTopics: [
      {
        id: 1,
        title: "Async/Await Error Handling & Try-Catch",
        tag: "Weakness Detected",
        duration: "15 min",
        status: "next",
        label: "Next Up",
      },
      {
        id: 2,
        title: "Array Higher-Order Methods (reduce / map)",
        tag: "Core Syntax",
        duration: "20 min",
        status: "upcoming",
        label: "Up Next",
      },
      {
        id: 3,
        title: "Closures & Lexical Scope Edge Cases",
        tag: "Deep Dive",
        duration: "25 min",
        status: "upcoming",
        label: "Queued",
      },
    ],
  },
  "C++": {
    name: "C++ 17",
    shortName: "C++",
    badge: "C++",
    icon: "⚙️",
    progress: 40,
    masteredCount: 8,
    totalCount: 20,
    weakAreas: 12,
    diagnosticScore: 40,
    level: "Beginner Track",
    currentModule: "STL Vectors & Memory References",
    upcomingTopics: [
      {
        id: 1,
        title: "Pass-by-Reference (&) vs Pass-by-Value",
        tag: "Bridge from Python",
        duration: "15 min",
        status: "next",
        label: "Next Up",
      },
      {
        id: 2,
        title: "STL unordered_map & Iterator Safety",
        tag: "Data Structures",
        duration: "20 min",
        status: "upcoming",
        label: "Up Next",
      },
      {
        id: 3,
        title: "Integer Overflow & 64-bit long long Bounds",
        tag: "Edge Cases",
        duration: "20 min",
        status: "upcoming",
        label: "Queued",
      },
    ],
  },
  Java: {
    name: "Java 17",
    shortName: "Java",
    badge: "JV",
    icon: "☕",
    progress: 30,
    masteredCount: 6,
    totalCount: 20,
    weakAreas: 14,
    diagnosticScore: 30,
    level: "Beginner Track",
    currentModule: "OOP Fundamentals & Collections",
    upcomingTopics: [
      {
        id: 1,
        title: "Interfaces vs Abstract Classes",
        tag: "Core OOP",
        duration: "15 min",
        status: "next",
        label: "Next Up",
      },
      {
        id: 2,
        title: "HashMap vs TreeMap Internals",
        tag: "Collections",
        duration: "20 min",
        status: "upcoming",
        label: "Up Next",
      },
      {
        id: 3,
        title: "Exception Handling & Custom Exceptions",
        tag: "Error Handling",
        duration: "18 min",
        status: "upcoming",
        label: "Queued",
      },
    ],
  },
};

// ──────────────────────────────────────────────
//  ICONS (inline SVGs — zero external deps)
// ──────────────────────────────────────────────

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  );
}

function BrainIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-1.18 2.84A4 4 0 0 1 16 12a4 4 0 0 1-2 3.46V20a2 2 0 0 1-4 0v-4.54A4 4 0 0 1 8 12a4 4 0 0 1 1.18-2.84A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
      <path d="M12 2a4 4 0 0 0-4 4c0 .82.25 1.58.67 2.22" />
      <path d="M8.67 8.22A4 4 0 0 0 8 12c0 1.44.77 2.7 1.92 3.4" />
    </svg>
  );
}

function TargetIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ClockIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ──────────────────────────────────────────────
//  HOME PAGE COMPONENT
// ──────────────────────────────────────────────
export default function Home({ username = "Aarav", onNavigate }) {
  const [selectedLang, setSelectedLang] = useState("Python");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeTrack = LANGUAGE_TRACKS[selectedLang];

  // Dynamic morning / afternoon / evening calculation
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }, []);

  return (
    <div
      className="min-h-screen text-[#0F172A] selection:bg-[#FFDF2B]"
      style={{
        backgroundColor: "#FAF9F0",
        backgroundImage: `
          linear-gradient(to right, #e6e4d6 1px, transparent 1px),
          linear-gradient(to bottom, #e6e4d6 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }}
    >
      {/* ═══════════════════════════════════════════
          A. TOP NAVIGATION BAR
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF9F0]/85 border-b-2 border-[#0F172A]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-bold text-sm transition-transform group-hover:rotate-6">
              {"</>"}
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              CodeArena<span className="text-[#FFDF2B]">.</span>
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#475569]">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("home");
                else window.location.hash = "home";
              }}
              className="px-4 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD] transition-all hover:shadow-sm font-bold cursor-pointer"
            >
              Home
            </a>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("dashboard");
                else window.location.hash = "dashboard";
              }}
              className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/60 transition-all font-semibold cursor-pointer"
            >
              Dashboard
            </a>
            <a
              href="#ai-tutor"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("ai-tutor");
                else window.location.hash = "ai-tutor";
              }}
              className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/60 transition-all font-semibold cursor-pointer"
            >
              AI Tutor
            </a>
            <a
              href="#polyglot"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("polyglot");
                else window.location.hash = "polyglot";
              }}
              className="px-4 py-1.5 rounded-full hover:text-[#0F172A] hover:bg-white/60 transition-all font-semibold cursor-pointer"
            >
              Polyglot Lab
            </a>
          </nav>

          {/* Right: Language Badge + User Profile */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[#0F172A] text-xs font-bold shadow-[2px_2px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
              <GlobeIcon className="w-3.5 h-3.5" />
              {activeTrack.shortName}
            </span>

            {/* Streak + Avatar Pill */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
              <span className="text-xs font-bold">🔥 5</span>
              <div className="w-7 h-7 rounded-full bg-[#DBEAFE] border-2 border-[#0F172A] flex items-center justify-center font-bold text-xs text-[#1D4ED8]">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ─── B. DYNAMIC TIME-OF-DAY GREETING ─── */}
        <section className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-[#DBEAFE] border border-[#93C5FD] text-[#1D4ED8] font-mono text-[11px] font-bold tracking-wider uppercase">
            <SparklesIcon className="w-3.5 h-3.5" />
            AI-POWERED MULTI-LANGUAGE LEARNING WORKSPACE
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-[#0F172A] leading-[1.1]">
            Hey!{" "}
            <span className="relative inline-block">
              {username}
              {/* Hand-drawn style coral red underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#EF4444]"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M3 9C20 3 50 2 100 6C150 10 180 4 197 7"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10 10C60 4 140 4 190 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
            , Good {timeGreeting} 👋
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#475569] max-w-2xl font-medium leading-relaxed">
            Pick up right where you left off. Your Socratic AI tutor is ready to
            guide you step-by-step—no spoilers, just real problem-solving.
          </p>
        </section>

        {/* ═══════════════════════════════════════════
            MAIN WORKSPACE BENTO GRID
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ─────────────────────────────────────────
              C. ACTIVE LANGUAGE LEARNING SQUARE CARD
              ───────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white border-2 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_#0F172A] overflow-hidden flex flex-col">
            {/* macOS-style top bar */}
            <div className="px-4 sm:px-5 py-3 bg-[#F8FAFC] border-b-2 border-[#0F172A] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-[#0F172A]/30" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#0F172A]/30" />
                <span className="w-3 h-3 rounded-full bg-[#10B981] border border-[#0F172A]/30" />
                <span className="ml-2 text-xs font-mono font-semibold text-[#475569]">
                  CodeArena — Active Learning Track
                </span>
              </div>

              {/* Quick language tabs */}
              <div className="flex items-center gap-1">
                {Object.keys(LANGUAGE_TRACKS).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                      selectedLang === lang
                        ? "bg-[#FFDF2B] text-[#0F172A] border-[#0F172A] shadow-[1px_1px_0px_#0F172A]"
                        : "bg-white text-[#475569] border-transparent hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {LANGUAGE_TRACKS[lang].badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Card body */}
            <div className="p-5 sm:p-7 space-y-6 flex-1 flex flex-col">

              {/* ── 1. CURRENT LANGUAGE HEADER ── */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex items-center justify-center text-2xl">
                    {activeTrack.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                        Currently Studying
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD]">
                        Diagnostic Score: {activeTrack.diagnosticScore}%
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]">
                        {activeTrack.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                        {activeTrack.name}
                      </h2>
                      {/* Dropdown toggle */}
                      <button
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                        className="p-1 rounded-md hover:bg-[#F1F5F9] transition cursor-pointer"
                      >
                        <ChevronDownIcon className={`w-5 h-5 text-[#475569] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown menu */}
                    {langDropdownOpen && (
                      <div className="mt-2 p-1.5 bg-white border-2 border-[#0F172A] rounded-xl shadow-[4px_4px_0px_#0F172A] absolute z-10">
                        {Object.keys(LANGUAGE_TRACKS).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setSelectedLang(lang);
                              setLangDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                              selectedLang === lang
                                ? "bg-[#FFDF2B] text-[#0F172A]"
                                : "hover:bg-[#F8FAFC] text-[#475569]"
                            }`}
                          >
                            <span>{LANGUAGE_TRACKS[lang].icon}</span>
                            <span>{LANGUAGE_TRACKS[lang].name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-3xl sm:text-4xl font-black text-[#0F172A]">
                    {activeTrack.progress}%
                  </span>
                  <p className="text-xs font-semibold text-[#475569]">
                    Goal: 100%
                  </p>
                </div>
              </div>

              {/* ── 2. INTERACTIVE PROGRESS BAR SECTION ── */}
              <div className="p-4 rounded-xl bg-[#FAF9F0] border-2 border-[#0F172A]">
                <div className="flex justify-between items-center text-[11px] font-extrabold text-[#0F172A] mb-2.5 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <TargetIcon className="w-3.5 h-3.5" />
                    {activeTrack.progress}% Mastery → Goal: 100%
                  </span>
                  <span className="text-[#475569] font-bold normal-case">
                    {activeTrack.masteredCount}/{activeTrack.totalCount} Topics
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-5 bg-white rounded-full border-2 border-[#0F172A] overflow-hidden">
                  <div
                    className="h-full bg-[#FFDF2B] rounded-full transition-all duration-700 ease-out relative progress-stripes"
                    style={{ width: `${activeTrack.progress}%` }}
                  >
                    {/* End marker */}
                    <div className="absolute right-0 top-0 h-full w-0.5 bg-[#0F172A]" />
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-[#475569] font-medium">
                  💡{" "}
                  <strong className="text-[#0F172A]">
                    {activeTrack.masteredCount} of {activeTrack.totalCount}
                  </strong>{" "}
                  Core Concepts Mastered •{" "}
                  <strong className="text-[#EF4444]">
                    {activeTrack.weakAreas} Weak Areas
                  </strong>{" "}
                  Remaining
                </p>
              </div>

              {/* ── 3. UPCOMING TOPICS LIST ── */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                    <BookOpenIcon className="w-3.5 h-3.5" />
                    Upcoming Topics (Based on Your Diagnostic Gaps)
                  </h3>
                  <span className="text-[11px] font-bold text-[#1D4ED8] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                    {activeTrack.upcomingTopics.length} Queued
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeTrack.upcomingTopics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className={`group p-3.5 rounded-xl border-2 border-[#0F172A] flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        topic.status === "next"
                          ? "bg-[#FEF9C3] shadow-[3px_3px_0px_#0F172A] pulse-active"
                          : "bg-white hover:bg-[#F8FAFC] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg border-2 border-[#0F172A] flex items-center justify-center text-xs font-black shrink-0 ${
                            topic.status === "next"
                              ? "bg-[#FFDF2B]"
                              : "bg-[#F8FAFC]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A] group-hover:text-[#0F172A]">
                            {topic.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                              {topic.tag}
                            </span>
                            <span className="text-[10px] font-semibold text-[#475569] flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {topic.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          topic.status === "next"
                            ? "bg-[#0F172A] text-[#FFDF2B]"
                            : "bg-[#F1F5F9] text-[#475569]"
                        }`}>
                          {topic.label}
                        </span>
                        <ArrowRightIcon className="w-4 h-4 text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 4. CONTINUE LEARNING FOOTER ── */}
              <div className="pt-2 border-t-2 border-dashed border-[#0F172A]/10 flex flex-col sm:flex-row items-center gap-3">
                <button className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#FFDF2B] hover:bg-[#f5d311] text-[#0F172A] font-extrabold text-base border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_#0F172A] active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>Continue Learning {activeTrack.shortName}</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>

                <button className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-bold text-sm border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                  Switch or Add New Language
                </button>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              D. RIGHT COLUMN: COMPANION CARDS
              ───────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* ── CARD 1: 70% → 100% Path vs New Language Bridge ── */}
            <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[5px_5px_0px_#0F172A] overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-3 bg-[#F8FAFC] border-b-2 border-[#0F172A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-4 h-4 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Learning Path
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                  BRIDGE MODE
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Current path summary */}
                <div className="p-3.5 rounded-xl bg-[#FEF9C3] border-2 border-[#0F172A]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-[#0F172A]">
                      Push {activeTrack.shortName} to 100%
                    </span>
                    <span className="text-2xl font-black text-[#0F172A]">
                      {activeTrack.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white rounded-full border border-[#0F172A] overflow-hidden">
                    <div
                      className="h-full bg-[#FFDF2B] rounded-full transition-all duration-500"
                      style={{ width: `${activeTrack.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-[#475569] font-medium">
                    {activeTrack.totalCount - activeTrack.masteredCount} concepts remaining • ~{(activeTrack.totalCount - activeTrack.masteredCount) * 15} min estimated
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#0F172A]/10" />
                  <span className="text-[10px] font-extrabold text-[#475569] uppercase tracking-widest">or try a new language</span>
                  <div className="flex-1 h-px bg-[#0F172A]/10" />
                </div>

                {/* New language options */}
                <div className="grid grid-cols-2 gap-2.5">
                  {["C++", "Java", "JavaScript", "Rust"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() =>
                        LANGUAGE_TRACKS[lang] && setSelectedLang(lang)
                      }
                      className="group p-3 rounded-xl border-2 border-[#0F172A] bg-[#FAF9F0] hover:bg-[#FFDF2B] text-left transition-all cursor-pointer hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0F172A]">{lang}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#0F172A] transition" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#1D4ED8] mt-1 block">
                        MCQ + Code Diagnostic
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-[#475569] font-medium text-center">
                  Take a 5-min diagnostic to skip concepts you already know
                </p>
              </div>
            </div>

            {/* ── CARD 2: Socratic AI Tutor Status ── */}
            <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[5px_5px_0px_#0F172A] overflow-hidden">
              {/* Card header */}
              <div className="px-5 py-3 bg-[#F8FAFC] border-b-2 border-[#0F172A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainIcon className="w-4 h-4 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Socratic AI Tutor
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]">
                  ● Active
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Self-Reliance Score */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                      Self-Reliance Score
                    </p>
                    <p className="text-3xl font-black text-[#0F172A] mt-0.5">
                      84%
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-3 bg-[#FAF9F0] rounded-full border-2 border-[#0F172A] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DBEAFE] to-[#1D4ED8] rounded-full transition-all duration-500"
                    style={{ width: "84%" }}
                  />
                </div>
                <p className="text-[11px] text-[#475569] font-medium">
                  You solved <strong className="text-[#0F172A]">84%</strong> of problems with minimal hints — great independence!
                </p>

                {/* Last session hint */}
                <div className="p-3.5 rounded-xl bg-[#FEF9C3] border-2 border-[#0F172A]">
                  <p className="text-xs font-bold text-[#854D0E] mb-1.5 flex items-center gap-1.5">
                    <span>💡</span>
                    Last Failed Problem: Two Sum
                  </p>
                  <p className="text-[11px] text-[#854D0E] leading-relaxed">
                    Your logic was solid, but you missed an edge case with duplicate elements. Ready for step-by-step Socratic hints?
                  </p>
                </div>

                {/* Action */}
                <button
                  onClick={() => onNavigate?.("ai-tutor")}
                  className="w-full py-3 px-4 rounded-xl bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1D4ED8] font-bold text-sm border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BrainIcon className="w-4 h-4" />
                  Retry "Two Sum" with Socratic Hints
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}