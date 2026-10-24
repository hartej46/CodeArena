import { useState, useEffect } from "react";
import Home from "./home/Home";
import AuthPage from "./auth/AuthPage";
import AITutor from "./tutor/AITutor";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  // Router
  if (currentPage === "ai-tutor") {
    return (
      <AITutor
        onNavigate={navigate}
        username="Aarav"
        initialLanguage="Python"
      />
    );
  }

  return <Home username="Aarav" onNavigate={navigate} />;
}

export default App;