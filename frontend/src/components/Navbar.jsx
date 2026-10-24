import { useState } from "react";

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MenuIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BotIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function HomeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LogoutIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Navbar({
  activePage = "home",
  onNavigate,
  selectedLang = "Python",
  onSelectLang,
  username = "Aarav",
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const LANGUAGES = ["Python", "JavaScript"];

  const handleNavClick = (pageId, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  const isHomeActive = activePage === "home" || activePage === "dashboard";
  const isTutorActive = activePage === "ai-tutor" || activePage === "tutor";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF9F0]/90 border-b-2 border-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div
          onClick={(e) => handleNavClick("home", e)}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-black text-sm transition-transform group-hover:rotate-6">
            {"</>"}
          </div>
          <span className="text-xl font-black tracking-tight text-[#0F172A]">
            CodeArena<span className="text-[#FFDF2B]">.</span>
          </span>
        </div>

        {/* Right: Two Primary Navigation Links (Desktop) */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 p-1 bg-white/80 border-2 border-[#0F172A] rounded-xl shadow-[3px_3px_0px_#0F172A]">
            <button
              onClick={(e) => handleNavClick("home", e)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isHomeActive
                  ? "bg-[#FFDF2B] text-[#0F172A] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]"
                  : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 border-2 border-transparent"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home / Dashboard</span>
            </button>

            <button
              onClick={(e) => handleNavClick("ai-tutor", e)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isTutorActive
                  ? "bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]"
                  : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 border-2 border-transparent"
              }`}
            >
              <BotIcon className="w-4 h-4" />
              <span>AI Tutor</span>
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </nav>

          {/* Language Switcher Badge */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-bold shadow-[2px_2px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              <GlobeIcon className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>{selectedLang}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border-2 border-[#0F172A] rounded-xl shadow-[4px_4px_0px_#0F172A] p-1.5 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      if (onSelectLang) onSelectLang(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedLang === lang
                        ? "bg-[#FFDF2B] text-[#0F172A]"
                        : "text-[#0F172A] hover:bg-[#FAF9F0]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Avatar & User Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
              <div className="w-6 h-6 rounded-lg bg-[#DBEAFE] border-2 border-[#0F172A] flex items-center justify-center font-black text-xs text-[#1D4ED8]">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline-block text-xs font-black text-[#0F172A] max-w-[110px] truncate">
                {username}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-[#475569] hover:text-[#EF4444] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer text-xs font-black flex items-center gap-1"
              >
                <LogoutIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline-block">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
