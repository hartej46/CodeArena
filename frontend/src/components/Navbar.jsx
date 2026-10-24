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

export default function Navbar({
  activePage = "home",
  onNavigate,
  selectedLang = "Python",
  onSelectLang,
  username = "Aarav"
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const LANGUAGES = ["Python", "JavaScript", "C++", "Java"];

  const navItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "dashboard", label: "Dashboard", href: "#dashboard" },
    { id: "ai-tutor", label: "AI Tutor", href: "#ai-tutor" },
    { id: "polyglot", label: "Polyglot Lab", href: "#polyglot" },
  ];

  const handleNavClick = (pageId, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId;
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF9F0]/85 border-b-2 border-[#0F172A]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={(e) => handleNavClick("home", e)}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-mono font-bold text-sm transition-transform group-hover:rotate-6">
            {"</>"}
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
            CodeArena<span className="text-[#FFDF2B]">.</span>
          </span>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#475569]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                  isActive
                    ? "bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD] shadow-sm"
                    : "hover:text-[#0F172A] hover:bg-white/60 font-semibold"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Language Badge + Streak + Avatar */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[#0F172A] text-xs font-bold shadow-[2px_2px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              aria-label="Select Programming Language"
            >
              <GlobeIcon className="w-3.5 h-3.5" />
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

          {/* Streak + Avatar Pill */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
            <span className="text-xs font-bold" title="5 Day Streak">🔥 5</span>
            <div className="w-7 h-7 rounded-full bg-[#DBEAFE] border-2 border-[#0F172A] flex items-center justify-center font-bold text-xs text-[#1D4ED8]">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border-2 border-[#0F172A] bg-white shadow-[2px_2px_0px_#0F172A]"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#0F172A]/10 bg-[#FAF9F0] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`block px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD]"
                    : "text-[#0F172A] hover:bg-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
