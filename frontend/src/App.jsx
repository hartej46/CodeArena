import { useState, useEffect } from "react";
import Home from "./home/Home";
import AuthPage from "./auth/AuthPage";
import AITutor from "./tutor/AITutor";
import { getStoredAuth, setStoredAuth, clearStoredAuth, getMe } from "./auth/authApi";

function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isVerifying, setIsVerifying] = useState(Boolean(auth.token));

  // Verify stored session on load
  useEffect(() => {
    if (!auth.token) {
      setIsVerifying(false);
      return;
    }

    let isMounted = true;
    getMe(auth.token)
      .then((freshUser) => {
        if (isMounted) {
          setAuth({ token: auth.token, user: freshUser });
          setStoredAuth(auth.token, freshUser);
        }
      })
      .catch((err) => {
        console.warn("Session expired or token invalid:", err.message);
        if (isMounted) {
          clearStoredAuth();
          setAuth({ token: null, user: null });
        }
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Read initial page from hash or default to "home"
  const getInitialPage = () => {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (hash === "ai-tutor" || hash === "tutor") return "ai-tutor";
    return "home";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  // Sync with browser back/forward and URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      if (hash === "ai-tutor" || hash === "tutor") {
        setCurrentPage("ai-tutor");
      } else if (hash === "home" || hash === "") {
        setCurrentPage("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (user, token) => {
    setAuth({ user, token });
    setStoredAuth(token, user);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuth({ token: null, user: null });
    window.location.hash = "";
  };

  // Show small loading indicator while validating session on initial load
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#FAF9F0] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex items-center justify-center font-mono font-black text-sm animate-bounce">
          {"</>"}
        </div>
        <p className="text-sm font-black text-[#0F172A]">Loading CodeArena...</p>
      </div>
    );
  }

  // If not authenticated, display the AuthPage
  if (!auth.token || !auth.user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const username = auth.user.name || auth.user.email?.split("@")[0] || "Learner";

  // Router
  if (currentPage === "ai-tutor") {
    return (
      <AITutor
        onNavigate={navigate}
        username={username}
        user={auth.user}
        onLogout={handleLogout}
        initialLanguage="Python"
      />
    );
  }

  return (
    <Home
      username={username}
      user={auth.user}
      onNavigate={navigate}
      onLogout={handleLogout}
    />
  );
}

export default App;