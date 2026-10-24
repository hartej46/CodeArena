import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { TOKEN_STORAGE_KEY } from "../auth/authApi";

// ──────────────────────────────────────────────
//  Inline SVG Icons (Zero Missing Dependencies)
// ──────────────────────────────────────────────
function BookOpenIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CompassIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function CodeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SettingsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function FlameIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function BugIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="14" x="8" y="6" rx="4" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m10 4 1 2" />
      <path d="m14 4-1 2" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

export default function Home({ username = "Aarav", onNavigate, user, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch live dashboard metrics from backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = selectedCourseId ? `/api/dashboard?courseId=${selectedCourseId}` : `/api/dashboard`;

    axios
      .get(url, { headers })
      .then((res) => {
        if (!isMounted) return;
        const data = res.data?.data || res.data;
        setDashboardData(data);
        if (!selectedCourseId && data?.enrollments?.length > 0) {
          setSelectedCourseId(data.enrollments[0].courseId);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live dashboard data:", err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]);

  // Derived enrolled courses list from live backend
  const enrolledCourses = useMemo(() => {
    if (!dashboardData?.enrollments || dashboardData.enrollments.length === 0) {
      return [];
    }
    return dashboardData.enrollments.map((e) => {
      const isPython = (e.language || "").toLowerCase().includes("python");
      return {
        id: e.courseId,
        name: e.title || (isPython ? "Python 3 Mastery" : "JavaScript ES6+ Core"),
        badge: isPython ? "PY" : "JS",
        icon: isPython ? "🐍" : "⚡",
        progress: Math.round((e.percent || 0) * 100),
        language: e.language || (isPython ? "Python" : "JavaScript"),
      };
    });
  }, [dashboardData]);

  // Current selected course details
  const currentCourse = useMemo(() => {
    return (
      enrolledCourses.find((c) => c.id === selectedCourseId) ||
      enrolledCourses[0] || {
        id: null,
        name: "Python 3 Mastery",
        badge: "PY",
        icon: "🐍",
        progress: 0,
        language: "Python",
      }
    );
  }, [enrolledCourses, selectedCourseId]);

  // Active course progress stats from backend
  const activeCourseStats = useMemo(() => {
    const raw = dashboardData?.activeCourse;
    if (raw) {
      return {
        title: raw.title || currentCourse.name,
        currentModule: raw.currentFocus || "Core Language Foundations",
        diagnosticScore: raw.diagnosticScore ?? 75,
        masteredCount: raw.conceptsDone ?? 0,
        totalCount: raw.conceptsTotal ?? 20,
        progress: Math.round((raw.percent || 0) * 100),
      };
    }
    return {
      title: currentCourse.name,
      currentModule: "Language Fundamentals & Sandbox",
      diagnosticScore: 70,
      masteredCount: 0,
      totalCount: 20,
      progress: currentCourse.progress,
    };
  }, [dashboardData, currentCourse]);

  // Upcoming topics from live backend nextUp array
  const upcomingTopics = useMemo(() => {
    if (dashboardData?.nextUp && dashboardData.nextUp.length > 0) {
      return dashboardData.nextUp.map((lesson, idx) => ({
        id: lesson.lessonId || `lesson-${idx}`,
        title: lesson.title,
        tag: lesson.kind === "core" ? "Core Concept" : "Applied Challenge",
        duration: `${lesson.estMinutes || 15} min`,
        status: idx === 0 ? "next" : "queued",
      }));
    }
    return [];
  }, [dashboardData]);

  // Self-Reliance metrics from backend
  const selfReliance = dashboardData?.selfReliance || {
    autonomyPct: 85,
    changeThisWeek: 0,
  };

  // Bug DNA list from backend
  const bugAutopsy = useMemo(() => {
    if (dashboardData?.bugDna && dashboardData.bugDna.length > 0) {
      return dashboardData.bugDna.map((b) => ({
        type: b.name,
        category: (b.category || "LOGIC").toUpperCase(),
        severity: b.severity || "Medium",
        occurrences: b.timesDetected || 1,
      }));
    }
    return [];
  }, [dashboardData]);

  // Dynamic greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div
      className="dashboard-page min-h-screen text-[#0F172A] selection:bg-[#FFDF2B] flex flex-col"
      style={{
        backgroundColor: "#FAF9F0",
        backgroundImage: `
          linear-gradient(to right, #e6e4d6 1px, transparent 1px),
          linear-gradient(to bottom, #e6e4d6 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }}
    >
      {/* ── Top Navigation Bar ── */}
      <Navbar
        activePage="home"
        onNavigate={onNavigate}
        selectedLang={currentCourse.language || "Python"}
        onSelectLang={(lang) => {
          const match = enrolledCourses.find(
            (c) => c.language?.toLowerCase() === lang.toLowerCase() || c.name.toLowerCase().includes(lang.toLowerCase())
          );
          if (match) setSelectedCourseId(match.id);
        }}
        username={username}
        user={user}
        onLogout={onLogout}
      />

      <div className="dashboard-layout flex-1 flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* ═══════════════════════════════════════════
            LEFT SIDEBAR (Width: ~280px, Solid border)
            ═══════════════════════════════════════════ */}
        <aside className="dashboard-sidebar w-full md:w-72 shrink-0 bg-[#FAF9F0] border-r-2 border-[#0F172A] p-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* SECTION A: ENROLLED COURSES / ACTIVE TRACKS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <BookOpenIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                  Enrolled Courses
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FFDF2B] border border-[#0F172A] shadow-[1px_1px_0px_#0F172A]">
                  {enrolledCourses.length} Active
                </span>
              </div>

              <div className="space-y-2">
                {enrolledCourses.map((course) => {
                  const isSelected = course.id === selectedCourseId;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 border-[#0F172A] transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white shadow-[4px_4px_0px_#0F172A] border-l-[6px] border-l-[#FFDF2B] translate-x-1"
                          : "bg-white/80 hover:bg-white hover:shadow-[2px_2px_0px_#0F172A] hover:border-l-[4px] hover:border-l-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{course.icon}</span>
                          <span className="text-xs font-black text-[#0F172A]">{course.name}</span>
                        </div>
                        <span className="text-xs font-black text-[#0F172A]">{course.progress}%</span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 border border-[#0F172A] overflow-hidden">
                        <div
                          className="h-full bg-[#FFDF2B] transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION B: QUICK NAVIGATION */}
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] mb-3 block flex items-center gap-1.5">
                <CompassIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                Quick Navigation
              </span>

              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black border-2 border-[#0F172A] transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-[#FFDF2B] text-[#0F172A] shadow-[2px_2px_0px_#0F172A]"
                      : "bg-white text-[#475569] hover:text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CompassIcon className="w-4 h-4" />
                    Dashboard Overview
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-400">
                    Live
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("polyglot");
                    if (onNavigate) {
                      onNavigate("ai-tutor", {
                        language: currentCourse.language || "Python",
                        lessonTitle: activeCourseStats.title,
                      });
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black border-2 border-[#0F172A] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CodeIcon className="w-4 h-4" />
                    Open AI Tutor
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DBEAFE] text-[#1D4ED8] border border-[#0F172A]">
                    Socratic
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* User Profile Mini Footer */}
          <div className="mt-6 pt-4 border-t-2 border-[#0F172A]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 shrink-0 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-black text-xs text-[#0F172A]">
                {(username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-[#0F172A] leading-none truncate">{username}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5 truncate">{user?.email || "Pro Learner"}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[11px] font-black text-[#EF4444] hover:underline cursor-pointer shrink-0 ml-2"
              >
                Sign out
              </button>
            )}
          </div>
        </aside>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT AREA (Right of Sidebar)
            ═══════════════════════════════════════════ */}
        <main className="dashboard-main flex-1 p-4 sm:p-6 max-w-6xl">
          {/* 1. USER GREETING BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBEAFE] border border-[#0F172A] text-xs font-black text-[#1D4ED8] mb-2 shadow-[2px_2px_0px_#0F172A]">
                <SparklesIcon className="w-3.5 h-3.5" />
                Adaptive Learning Mode Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Hey {username}, {timeGreeting}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
                You're mastering <span className="underline decoration-[#FFDF2B] decoration-4 font-black text-[#0F172A]">{activeCourseStats.title}</span>. Here is your daily diagnostic breakdown:
              </p>
            </div>

            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate("ai-tutor", {
                    language: currentCourse.language || "Python",
                    lessonTitle: activeCourseStats.title,
                  });
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFDF2B] text-[#0F172A] font-black text-sm border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer self-start sm:self-auto"
            >
              <span>Launch AI Tutor</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 2. ACTIVE LANGUAGE LEARNING PROGRESS SQUARE CARD */}
          <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[5px_5px_0px_#0F172A] p-4 sm:p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#0F172A]/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentCourse.icon}</span>
                <div>
                  <h2 className="text-lg font-black text-[#0F172A]">{activeCourseStats.title}</h2>
                  <p className="text-xs font-bold text-slate-500">
                    Current Focus: <span className="text-[#0F172A] font-black">{activeCourseStats.currentModule}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#FAF9F0] border-2 border-[#0F172A] text-xs font-black shadow-[2px_2px_0px_#0F172A]">
                  Diagnostic: {activeCourseStats.diagnosticScore}%
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] text-xs font-black shadow-[2px_2px_0px_#0F172A]">
                  {activeCourseStats.masteredCount} / {activeCourseStats.totalCount} Concepts
                </span>
              </div>
            </div>

            {/* Main Progress Bar */}
            <div className="mt-4 mb-4">
              <div className="flex justify-between text-xs font-black text-[#0F172A] mb-2">
                <span>Course Completion Progress</span>
                <span>{activeCourseStats.progress}% Completed</span>
              </div>
              <div className="w-full h-4 rounded-xl bg-slate-100 border-2 border-[#0F172A] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-lg bg-[#FFDF2B] border-r border-[#0F172A] transition-all duration-700 progress-stripes"
                  style={{ width: `${Math.max(activeCourseStats.progress, 5)}%` }}
                />
              </div>
            </div>

            {/* Upcoming Topics Checklist */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#475569] mb-3">
                Next Up in This Track:
              </h3>
              {upcomingTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {upcomingTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3.5 rounded-xl border-2 border-[#0F172A] bg-[#FAF9F0] flex flex-col justify-between hover:shadow-[3px_3px_0px_#0F172A] transition-all cursor-pointer"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate("ai-tutor", {
                            lessonTitle: topic.title,
                            language: currentCourse.language || "Python",
                          });
                        }
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#DBEAFE] text-[#1D4ED8] border border-[#0F172A]">
                            {topic.tag}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">{topic.duration}</span>
                        </div>
                        <p className="text-xs font-black text-[#0F172A] leading-snug">{topic.title}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#0F172A]/10 flex items-center justify-between text-[11px] font-black text-[#1D4ED8]">
                        <span>{topic.status === "next" ? "▶️ Start Exercise" : "Queued"}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#0F172A]/30 bg-[#FAF9F0] text-center">
                  <p className="text-xs font-black text-[#0F172A]">All track exercises completed! 🏆</p>
                  <p className="text-[11px] text-slate-500 font-bold mt-1">
                    Select another course or continue freeform practice in the AI Tutor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. COMPANION ANALYTICS (AI Self-Reliance & Bug DNA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI SELF-RELIANCE SCORE */}
            <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[5px_5px_0px_#0F172A] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-[#0F172A]">AI Self-Reliance Score</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    High Autonomy
                  </span>
                </div>

                <div className="flex items-center gap-4 my-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-[#0F172A]">{selfReliance.autonomyPct}%</span>
                    <span className="text-[9px] font-black uppercase text-slate-700">Autonomy</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#0F172A] leading-relaxed">
                      You solve {selfReliance.autonomyPct}% of challenges using guided Socratic inquiries without asking for complete code solutions.
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <span>▲</span> {selfReliance.changeThisWeek >= 0 ? `+${selfReliance.changeThisWeek}%` : `${selfReliance.changeThisWeek}%`} reliance trend this week
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t-2 border-[#0F172A]/10 text-[11px] font-bold text-slate-500">
                Tip: Each step solved independently increases your mastery score.
              </div>
            </div>

            {/* BUG DNA & WEAKNESS SUMMARY */}
            <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[5px_5px_0px_#0F172A] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BugIcon className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-black text-[#0F172A]">Bug DNA Diagnostics</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                    {bugAutopsy.length > 0 ? "Detected Patterns" : "All Clear"}
                  </span>
                </div>

                {bugAutopsy.length > 0 ? (
                  <div className="space-y-2">
                    {bugAutopsy.map((bug, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-[#0F172A] bg-[#FAF9F0] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-black text-[#0F172A]">{bug.type}</p>
                          <p className="text-[10px] font-bold text-slate-500">
                            {bug.category} • Detected {bug.occurrences} time{bug.occurrences > 1 ? "s" : ""}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border border-[#0F172A] ${
                            bug.severity?.toLowerCase() === "critical"
                              ? "bg-rose-200 text-rose-900"
                              : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {bug.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-[#0F172A]/30 bg-[#FAF9F0] text-center my-2">
                    <p className="text-xs font-black text-[#0F172A]">No critical bug patterns detected yet! 🎯</p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      Complete live challenges in AI Tutor to diagnose edge-case weaknesses and runtime habits.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("ai-tutor", {
                      language: currentCourse.language || "Python",
                      lessonTitle: activeCourseStats.title,
                    });
                  }
                }}
                className="mt-3 w-full py-2 rounded-xl bg-[#DBEAFE] hover:bg-blue-200 text-[#1D4ED8] font-black text-xs border border-[#0F172A] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Practice Bug Autopsies in AI Tutor</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}