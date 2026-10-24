import { useState } from "react";
import Home from "./home/Home";
import AuthPage from "./auth/AuthPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Home username="Aarav" />;
}

export default App;