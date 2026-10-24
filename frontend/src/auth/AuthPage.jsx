import { useState } from "react";

// ──────────────────────────────────────────────
//  INLINE SVG ICONS (matching Home.jsx style)
// ──────────────────────────────────────────────

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function EyeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function MailIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function GitHubIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ──────────────────────────────────────────────
//  AUTH PAGE COMPONENT
// ──────────────────────────────────────────────
export default function AuthPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLang, setPreferredLang] = useState("Python");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const LANGUAGES = [
    { name: "Python", icon: "🐍" },
    { name: "JavaScript", icon: "⚡" },
    { name: "C++", icon: "⚙️" },
    { name: "Java", icon: "☕" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirect to Home for now
    if (onLogin) onLogin();
  };

  return (
    <div
      className="min-h-screen text-[#0F172A] selection:bg-[#FFDF2B] flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "#FAF9F0",
        backgroundImage: `
          linear-gradient(to right, #e6e4d6 1px, transparent 1px),
          linear-gradient(to bottom, #e6e4d6 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }}
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* ═══════════════════════════════════════════
            LEFT SIDE — Value Proposition
            ═══════════════════════════════════════════ */}
        <div className="space-y-8 hidden lg:block">

          {/* ── Brand Logo ── */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-bold text-sm transition-transform group-hover:rotate-6">
              {"</>"}
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              CodeArena<span className="text-[#FFDF2B]">.</span>
            </span>
          </div>

          {/* ── Hero Headline with Hand-Drawn Squiggle ── */}
          <div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[#0F172A] leading-[1.1]">
              Master Any Language.
              <br />
              <span className="relative inline-block mt-1">
                Zero Spoilers.
                {/* Coral-red hand-drawn SVG underline */}
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
            </h1>

            <p className="mt-5 text-base xl:text-lg text-[#475569] max-w-lg font-medium leading-relaxed">
              Take our 5-minute diagnostic to skip what you know. Let our
              Socratic AI guide you toward independent problem-solving across
              Python, C++, Java, and JavaScript.
            </p>
          </div>

          {/* ── Feature Pill Bullets ── */}
          <div className="space-y-3">
            {[
              {
                emoji: "🐍",
                text: "Multi-Language Diagnostic & Bridge Mode",
              },
              {
                emoji: "🤖",
                text: "4-Stage Socratic Hint Ladder (No Code Leaks)",
              },
              {
                emoji: "🔥",
                text: "Active Streak & Self-Reliance Tracking",
              },
            ].map((feature) => (
              <div
                key={feature.text}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] text-sm font-bold text-[#0F172A] mr-2 hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <span className="text-base">{feature.emoji}</span>
                {feature.text}
              </div>
            ))}
          </div>

        </div>

        {/* ═══════════════════════════════════════════
            RIGHT SIDE — Interactive Auth Card
            ═══════════════════════════════════════════ */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">

          {/* Mobile-only brand header */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-bold text-sm">
              {"</>"}
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              CodeArena<span className="text-[#FFDF2B]">.</span>
            </span>
          </div>

          {/* Auth Card */}
          <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_#0F172A] overflow-hidden">

            {/* ── Tab Switcher ── */}
            <div className="flex border-b-2 border-[#0F172A]">
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 py-4 text-sm font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                  activeTab === "signin"
                    ? "bg-[#FFDF2B] text-[#0F172A]"
                    : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                Sign In
              </button>
              <div className="w-0.5 bg-[#0F172A]" />
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-4 text-sm font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                  activeTab === "signup"
                    ? "bg-[#FFDF2B] text-[#0F172A]"
                    : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* ── Form Body ── */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">

              {/* Greeting line */}
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {activeTab === "signin"
                    ? "Welcome back!"
                    : "Join the Arena 🏟️"}
                </h2>
                <p className="text-sm text-[#475569] font-medium mt-1">
                  {activeTab === "signin"
                    ? "Pick up your learning streak right where you left off."
                    : "Start your 5-minute diagnostic and build real mastery."}
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]">
                    <MailIcon className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border-2 border-[#0F172A] text-sm font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FFDF2B] focus:ring-offset-1 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569]">
                    <LockIcon className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-white border-2 border-[#0F172A] text-sm font-semibold text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FFDF2B] focus:ring-offset-1 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-4.5 h-4.5" />
                    ) : (
                      <EyeIcon className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Preferred Language — Signup Only */}
              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-language"
                    className="text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider"
                  >
                    Preferred Language
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      id="auth-language"
                      onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border-2 border-[#0F172A] text-sm font-semibold text-[#0F172A] cursor-pointer hover:bg-[#F8FAFC] transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <span>
                          {LANGUAGES.find((l) => l.name === preferredLang)?.icon}
                        </span>
                        {preferredLang}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-[#475569] transition-transform ${
                          langDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    {langDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 bg-white border-2 border-[#0F172A] rounded-xl shadow-[4px_4px_0px_#0F172A] z-20">
                        {LANGUAGES.map((lang) => (
                          <button
                            type="button"
                            key={lang.name}
                            onClick={() => {
                              setPreferredLang(lang.name);
                              setLangDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2.5 transition cursor-pointer ${
                              preferredLang === lang.name
                                ? "bg-[#FFDF2B] text-[#0F172A]"
                                : "hover:bg-[#F8FAFC] text-[#475569]"
                            }`}
                          >
                            <span>{lang.icon}</span>
                            <span>{lang.name}</span>
                            {preferredLang === lang.name && (
                              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F172A] text-[#FFDF2B]">
                                Selected
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primary CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#FFDF2B] hover:bg-[#f5d311] text-[#0F172A] font-extrabold text-base border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_#0F172A] active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeTab === "signin" ? (
                  <>
                    Sign In to CodeArena
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Start My 5-Min Diagnostic
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#0F172A]/10" />
                <span className="text-[10px] font-extrabold text-[#475569] uppercase tracking-widest">
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-[#0F172A]/10" />
              </div>

              {/* Social Auth Button */}
              <button
                type="button"
                onClick={() => onLogin && onLogin()}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[0px_0px_0px_#0F172A] active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5" />
                <span className="text-sm font-bold text-[#0F172A]">
                  Continue with Google
                </span>
              </button>

              {/* Footer note */}
              <p className="text-[11px] text-[#94A3B8] text-center font-medium leading-relaxed">
                By continuing, you agree to CodeArena's{" "}
                <a
                  href="#terms"
                  className="text-[#1D4ED8] font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                &{" "}
                <a
                  href="#privacy"
                  className="text-[#1D4ED8] font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
