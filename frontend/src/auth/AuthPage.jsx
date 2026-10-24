import { useState, useEffect, useRef } from "react";
import {
  authenticateWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginWithDemo,
  safeStorage,
} from "./authApi";

// ──────────────────────────────────────────────
//  INLINE SVG ICONS
// ──────────────────────────────────────────────

function GoogleIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function KeyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function SpinnerIcon({ className = "w-5 h-5 animate-spin" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ──────────────────────────────────────────────
//  GOOGLE-EXCLUSIVE AUTH COMPONENT
// ──────────────────────────────────────────────
export default function AuthPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clientIdInput, setClientIdInput] = useState("");
  const [isConfiguringId, setIsConfiguringId] = useState(false);

  // Read Google Client ID from environment or default to configured client ID
  const getActiveGoogleClientId = () => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      safeStorage.getItem("codearena_google_client_id") ||
      "337886591905-4f8ppdqstl6ts455ubgg1iup3ool5shg.apps.googleusercontent.com"
    );
  };

  const [activeClientId, setActiveClientId] = useState(getActiveGoogleClientId);

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!activeClientId) return;

    let checkInterval = null;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: activeClientId,
        callback: async (response) => {
          if (!response.credential) return;
          try {
            setLoading(true);
            setErrorMessage("");
            const result = await authenticateWithGoogle({ credential: response.credential });
            if (onLogin) onLogin(result.user, result.token);
          } catch (err) {
            setErrorMessage(
              err.response?.data?.error?.message ||
                err.response?.data?.error ||
                "Google authentication failed. Please try again."
            );
          } finally {
            setLoading(false);
          }
        },
      });

      return true;
    };

    if (!setupGoogle()) {
      checkInterval = setInterval(() => {
        if (setupGoogle() && checkInterval) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      try {
        window.google?.accounts?.id?.cancel();
      } catch (_) {}
    };
  }, [activeClientId]);

  // Handle manual Google sign-in click
  const handleGoogleClick = () => {
    if (!activeClientId) {
      setIsConfiguringId(true);
      return;
    }

    // Try Google Identity Services OAuth popup
    if (window.google?.accounts?.oauth2) {
      setLoading(true);
      setErrorMessage("");
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: "email profile openid",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const result = await authenticateWithGoogle({
                  accessToken: tokenResponse.access_token,
                });
                if (onLogin) onLogin(result.user, result.token);
              } catch (err) {
                setErrorMessage(
                  err.response?.data?.error?.message ||
                    err.response?.data?.error ||
                    "Failed to verify Google account."
                );
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: (err) => {
            setLoading(false);
            setErrorMessage(err.message || "Google OAuth window closed or cancelled.");
          },
        });
        client.requestAccessToken();
      } catch (err) {
        setLoading(false);
        setErrorMessage("Failed to open Google sign-in window: " + err.message);
      }
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setErrorMessage("Google Identity Services is still loading. Please check your internet connection.");
    }
  };

  // Save custom client ID locally
  const handleSaveClientId = (e) => {
    e.preventDefault();
    const trimmed = clientIdInput.trim();
    if (!trimmed) return;
    safeStorage.setItem("codearena_google_client_id", trimmed);
    setActiveClientId(trimmed);
    setIsConfiguringId(false);
    setErrorMessage("");
  };

  // Email Auth & Demo States
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState("learner@codearena.dev");
  const [passwordInput, setPasswordInput] = useState("password123");
  const [nameInput, setNameInput] = useState("CodeArena Learner");

  // 1-Click Instant Demo Login
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const result = await loginWithDemo();
      if (onLogin) onLogin(result.user, result.token);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          "Demo login failed. Please ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Traditional Email Login or Registration
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage("");
      let result;
      if (isRegisterMode) {
        result = await registerWithEmail(nameInput.trim(), emailInput.trim(), passwordInput);
      } else {
        result = await loginWithEmail(emailInput.trim(), passwordInput);
      }
      if (onLogin) onLogin(result.user, result.token);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          "Authentication failed. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
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
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        {/* ═══════════════════════════════════════════
            LEFT SIDE — Brand & Platform Intro
            ═══════════════════════════════════════════ */}
        <div className="space-y-8 hidden lg:block">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex items-center justify-center font-mono font-black text-base transition-transform group-hover:rotate-6">
              {"</>"}
            </div>
            <span className="text-3xl font-black tracking-tight text-[#0F172A]">
              CodeArena<span className="text-[#FFDF2B]">.</span>
            </span>
          </div>

          {/* Hero Headline */}
          <div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-[#0F172A] leading-[1.15]">
              Master Any Language.
              <br />
              <span className="relative inline-block mt-1">
                Zero Spoilers.
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
              Step into the adaptive coding arena. Sign in seamlessly with your real Google account to save your diagnostic benchmarks, Socratic AI chats, and code solutions.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            {[
              {
                emoji: "🔐",
                text: "Real Google Account Authentication",
              },
              {
                emoji: "⚡",
                text: "Single Click Sign In & Automatic Registration",
              },
              {
                emoji: "🤖",
                text: "Socratic AI Tutor with Live Python & JS Execution",
              },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] text-sm font-bold text-[#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <span className="text-lg">{feature.emoji}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT SIDE — Dedicated Google Auth Card
            ═══════════════════════════════════════════ */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          {/* Mobile brand header */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-bold text-sm">
              {"</>"}
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              CodeArena<span className="text-[#FFDF2B]">.</span>
            </span>
          </div>

          {/* Main Card */}
          <div className="bg-white border-3 border-[#0F172A] rounded-2xl shadow-[8px_8px_0px_#0F172A] overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDF2B] border border-[#0F172A] text-xs font-black shadow-[2px_2px_0px_#0F172A]">
                <span>🏟️</span>
                <span>Welcome to CodeArena</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Sign In / Sign Up with Google
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                One click to sign in or create your new account using your real Google email.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border-2 border-[#EF4444] text-[#B91C1C] text-xs font-bold flex items-start gap-2.5 shadow-[2px_2px_0px_#EF4444]">
                <span className="text-base">⚠️</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-3.5 py-4 px-6 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#0F172A] shadow-[5px_5px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_#0F172A] active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer group disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="w-5 h-5 text-[#0F172A]" />
                    <span className="text-base font-black text-[#0F172A]">
                      Verifying with Google...
                    </span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-6 h-6 shrink-0" />
                    <span className="text-base font-black text-[#0F172A]">
                      Sign In / Sign Up with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#0F172A]/20" />
              <span className="flex-shrink mx-3 text-[10px] font-black uppercase text-[#475569] tracking-wider">
                OR Instant Access
              </span>
              <div className="flex-grow border-t border-[#0F172A]/20" />
            </div>

            {/* 1-Click Instant Demo Login */}
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] font-black text-sm border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] transition-all cursor-pointer disabled:opacity-60"
              >
                <span>⚡ 1-Click Demo Learner Login (Real Backend)</span>
              </button>
            </div>

            {/* Traditional Email Sign In / Registration Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full text-center text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer py-1"
              >
                {showEmailForm ? "▲ Hide Email / Password Form" : "▼ Or Sign In / Register with Email & Password"}
              </button>

              {showEmailForm && (
                <form onSubmit={handleEmailAuth} className="mt-3 p-4 rounded-xl bg-[#FAF9F0] border-2 border-[#0F172A] space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#0F172A]/10">
                    <span className="text-xs font-black text-[#0F172A]">
                      {isRegisterMode ? "Create New Account" : "Email Sign In"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                      className="text-[11px] font-bold text-[#1D4ED8] underline cursor-pointer"
                    >
                      {isRegisterMode ? "Already registered? Login" : "New user? Register"}
                    </button>
                  </div>

                  {isRegisterMode && (
                    <div>
                      <label className="block text-[11px] font-black text-[#0F172A] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Learner Name"
                        required
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border-2 border-[#0F172A] text-[#0F172A] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black text-[#0F172A] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border-2 border-[#0F172A] text-[#0F172A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#0F172A] mb-1">Password</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border-2 border-[#0F172A] text-[#0F172A] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-[#0F172A] text-white font-black text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    {loading ? "Authenticating..." : isRegisterMode ? "Create Account & Login" : "Sign In with Email"}
                  </button>
                </form>
              )}
            </div>

            {/* Google OAuth Client ID Configuration Helper */}
            {!activeClientId && (
              <div className="p-4 rounded-xl bg-[#FAF9F0] border-2 border-[#0F172A] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#0F172A]">
                  <KeyIcon className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Connect Google Cloud Client ID</span>
                </div>
                <p className="text-[11px] text-[#475569] font-medium leading-relaxed">
                  To authenticate with real Google accounts, enter your{" "}
                  <strong>Google OAuth 2.0 Web Client ID</strong> below:
                </p>
                <form onSubmit={handleSaveClientId} className="space-y-2">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxxxxxx.apps.googleusercontent.com"
                    required
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white border-2 border-[#0F172A] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FFDF2B]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] text-xs font-black text-[#0F172A] shadow-[2px_2px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
                  >
                    Save & Enable Real Google Sign-In
                  </button>
                </form>
              </div>
            )}

            {/* Trust & Security Badge */}
            <div className="pt-2 border-t border-[#0F172A]/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#475569]">
                <ShieldCheckIcon className="w-4 h-4 text-[#10B981]" />
                <span>Secured via Google OAuth 2.0 & JWT Sessions</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                By continuing with Google, you agree to CodeArena's{" "}
                <a href="#terms" className="text-[#1D4ED8] underline font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#privacy" className="text-[#1D4ED8] underline font-semibold">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}