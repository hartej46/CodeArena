import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// ──────────────────────────────────────────────
//  Configurable Endpoints (Axios)
// ──────────────────────────────────────────────
export const AI_CHAT_ENDPOINT = "/api/ai/chat";
export const DIRECT_BACKEND_URL = "http://localhost:5000/api/ai/chat";

// ──────────────────────────────────────────────
//  Starter Code Templates
// ──────────────────────────────────────────────
const CODE_TEMPLATES = {
  Python: `# Two Sum Problem
# Given an array of integers nums and an integer target,
# return indices of the two numbers such that they add up to target.

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test your code
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Result: {result}") # Expected: [0, 1]
`,
  JavaScript: `// Two Sum Problem
// Return indices of the two numbers such that they add up to target.

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result:", twoSum(nums, target));
`,
};

const FILE_EXTENSIONS = {
  Python: "solution.py",
  JavaScript: "solution.js",
};

// ──────────────────────────────────────────────
//  Initial Chat Sessions History
// ──────────────────────────────────────────────
const INITIAL_CHATS = [
  {
    id: "chat-two-sum",
    title: "Two Sum Debugging Session",
    language: "Python",
    timestamp: "10 mins ago",
    currentCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))`,
    messages: [
      {
        id: "m1",
        role: "assistant",
        content:
          "Welcome Aarav! I'm your **Socratic AI Tutor** for **Two Sum Debugging** 🚀\n\nI have active visibility into your editor code. What edge cases or logic points would you like to verify before running?",
        timestamp: "10:40 AM",
        hintLevel: 1,
      },
      {
        id: "m2",
        role: "user",
        content: "Why do we check if complement is in seen before storing seen[num] = i?",
        attachedCodeLength: 184,
        timestamp: "10:42 AM",
      },
      {
        id: "m3",
        role: "assistant",
        content:
          "Great observation! Let's think about what would happen if a number could accidentally match with itself.\n\nIf you have `nums = [3, 2, 4]` and `target = 6`, what would occur at `i = 0` if we inserted `3` into the hashmap before checking if `6 - 3 = 3` exists?",
        lineReference: {
          line: 5,
          severity: "warning",
          message: "Check order: checking membership before inserting prevents self-pairing.",
        },
        microMcq: {
          question: "If we store seen[num] before checking, what index pair would [3, 2, 4] with target=6 return?",
          options: [
            "[0, 0] (The same element twice)",
            "[0, 2] (Correct pair)",
            "Empty list []",
          ],
          correctIndex: 0,
          explanation: "Checking beforehand prevents an element from matching with itself!",
        },
        hintLevel: 2,
        timestamp: "10:43 AM",
      },
    ],
  },
  {
    id: "chat-js-async",
    title: "JS Async & Promises Debugging",
    language: "JavaScript",
    timestamp: "1 hour ago",
    currentCode: `async function fetchUserData(userId) {
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err.message);
    return null;
  }
}

fetchUserData(42).then(console.log);`,
    messages: [
      {
        id: "js-m1",
        role: "assistant",
        content:
          "Welcome to **JavaScript Async & Promises Debugging** ⚡\n\nI can see your async/await handler. How does error propagation work when awaiting a rejected Promise?",
        timestamp: "09:30 AM",
        hintLevel: 1,
      },
      {
        id: "js-m2",
        role: "user",
        content: "What happens if I forget the try/catch around an awaited promise?",
        attachedCodeLength: 280,
        timestamp: "09:32 AM",
      },
      {
        id: "js-m3",
        role: "assistant",
        content:
          "If an awaited Promise rejects without an enclosing try/catch block, what does the enclosing async function return to its caller?",
        microMcq: {
          question: "What does an unhandled rejection inside an async function produce?",
          options: [
            "A rejected Promise that bubbles up to the caller or unhandledrejection event",
            "It automatically returns null and continues synchronous execution",
            "The browser immediately terminates all JS event loop queues",
          ],
          correctIndex: 0,
          explanation: "Async functions always return Promises, so an uncaught throw rejects the returned Promise!",
        },
        hintLevel: 2,
        timestamp: "09:34 AM",
      },
    ],
  },
  {
    id: "chat-recursion",
    title: "Python Recursion Help",
    language: "Python",
    timestamp: "Yesterday",
    currentCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
    messages: [
      {
        id: "rec-m1",
        role: "assistant",
        content:
          "Hello! Welcome to your **Python Recursion Help** session 🐍\n\nWe're focusing on base cases and call-stack unwinding. How can I guide your reasoning?",
        timestamp: "Yesterday",
        hintLevel: 1,
      },
    ],
  },
  {
    id: "chat-js-closures",
    title: "JavaScript Closures & Lexical Scope",
    language: "JavaScript",
    timestamp: "2 days ago",
    currentCode: `function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count,
  };
}

const counter = createCounter(5);
console.log(counter.increment()); // 6`,
    messages: [
      {
        id: "clos-m1",
        role: "assistant",
        content:
          "Welcome to **JavaScript Closures & Lexical Scope** ⚡\n\nNotice how the returned methods retain access to the enclosed `count` variable. What happens if multiple counters are instantiated?",
        timestamp: "2 days ago",
        hintLevel: 1,
      },
    ],
  },
];

// ──────────────────────────────────────────────
//  Inline SVG Icons (Zero Missing Dependencies)
// ──────────────────────────────────────────────
function PlusIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SendIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CodeBracketIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

// ──────────────────────────────────────────────
//  Suggested Prompts for Fast Socratic Inquiries
// ──────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  {
    title: "Explain recursion simply",
    query: "Can you explain recursion simply using an intuitive analogy and show where the base case fits in?",
    icon: "🔄",
  },
  {
    title: "Help me debug my loop",
    query: "Please inspect my current code and guide me through finding any loop boundary or logic issues step by step without giving away the full answer.",
    icon: "🐞",
  },
  {
    title: "Analyze time complexity",
    query: "What is the Big-O Time and Space Complexity of my current approach, and how could it be optimized?",
    icon: "⏱️",
  },
  {
    title: "Test edge cases",
    query: "What edge cases (e.g. empty inputs, duplicates, negatives) should I test against my current code?",
    icon: "🧪",
  },
];

// ──────────────────────────────────────────────
//  Micro-MCQ Interactive Card Component
// ──────────────────────────────────────────────
function MicroMcqCard({ microMcq }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!microMcq || !microMcq.options || microMcq.options.length === 0) {
    return null;
  }

  const isCorrect = selectedIdx === microMcq.correctIndex;

  return (
    <div className="mt-3 p-4 rounded-xl border-2 border-[#0F172A] bg-[#FAF9F0] shadow-[3px_3px_0px_#0F172A]">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#FFDF2B] border border-[#0F172A]">
          MICRO-MCQ
        </span>
        <span className="text-xs font-black text-[#0F172A]">Socratic Concept Check</span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-[#0F172A] mb-3">
        {microMcq.question}
      </p>

      <div className="space-y-2">
        {microMcq.options.map((option, idx) => {
          let btnStyle = "bg-white border-[#0F172A] text-[#0F172A] hover:bg-slate-50";

          if (hasAnswered) {
            if (idx === microMcq.correctIndex) {
              btnStyle = "bg-emerald-100 border-emerald-600 text-emerald-900 font-black shadow-[2px_2px_0px_#0F172A]";
            } else if (idx === selectedIdx) {
              btnStyle = "bg-rose-100 border-rose-500 text-rose-900 line-through";
            } else {
              btnStyle = "bg-white/60 border-slate-300 text-slate-400";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (!hasAnswered) {
                  setSelectedIdx(idx);
                  setHasAnswered(true);
                }
              }}
              disabled={hasAnswered}
              className={`w-full text-left px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <span>{option}</span>
              {hasAnswered && idx === microMcq.correctIndex && (
                <span className="text-emerald-700 font-black">✓ Correct</span>
              )}
              {hasAnswered && idx === selectedIdx && idx !== microMcq.correctIndex && (
                <span className="text-rose-600 font-black">✗ Try Again</span>
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="mt-3 pt-2.5 border-t border-[#0F172A]/15 text-xs">
          <p className={`font-bold ${isCorrect ? "text-emerald-800" : "text-amber-800"}`}>
            {isCorrect ? "🎉 Well reasoned! " : "💡 Socratic insight: "}
            <span className="font-medium text-[#0F172A]">
              {microMcq.explanation || "Notice how this assumption directly drives your logic branch."}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  Markdown & Code Block Renderer
// ──────────────────────────────────────────────
function FormattedMessage({ content, language }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const parts = [];
  const codeRegex = /```([a-zA-Z0-9+#_ -]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      lang: match[1].trim() || (language ? language.toLowerCase() : "code"),
      code: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", text: content.slice(lastIndex) });
  }

  const handleCopy = (snippet, index) => {
    navigator.clipboard.writeText(snippet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderText = (raw) => {
    return raw.split("\n").map((line, idx) => {
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const text = isBullet ? line.trim().substring(2) : line;

      const tokens = [];
      const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
      let curr = 0;
      let inlineMatch;

      while ((inlineMatch = inlineRegex.exec(text)) !== null) {
        if (inlineMatch.index > curr) {
          tokens.push(text.slice(curr, inlineMatch.index));
        }
        const matched = inlineMatch[0];
        if (matched.startsWith("`")) {
          tokens.push(
            <code
              key={`c-${idx}-${curr}`}
              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#FEF08A] text-[#0F172A] font-mono text-[11px] sm:text-xs font-semibold border border-[#EAB308]/40"
            >
              {matched.slice(1, -1)}
            </code>
          );
        } else if (matched.startsWith("**")) {
          tokens.push(
            <strong key={`b-${idx}-${curr}`} className="font-black text-[#0F172A]">
              {matched.slice(2, -2)}
            </strong>
          );
        }
        curr = inlineMatch.index + matched.length;
      }
      if (curr < text.length) {
        tokens.push(text.slice(curr));
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm leading-relaxed my-1">
            {tokens}
          </li>
        );
      }

      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-black text-[#0F172A] mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }

      return line.trim() === "" ? (
        <div key={idx} className="h-1.5" />
      ) : (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed my-1">
          {tokens}
        </p>
      );
    });
  };

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return (
            <div
              key={index}
              className="my-2 rounded-xl border-2 border-[#0F172A] bg-[#0F172A] text-[#F8FAFC] shadow-[2px_2px_0px_#0F172A] overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-[#1E293B] border-b border-slate-700/60 flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-slate-300 uppercase">{part.lang}</span>
                <button
                  onClick={() => handleCopy(part.code, index)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-600/50 cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 overflow-x-auto text-xs font-mono leading-relaxed bg-[#0F172A]">
                <pre className="text-[#38BDF8]">
                  <code>{part.code}</code>
                </pre>
              </div>
            </div>
          );
        }

        return <div key={index}>{renderText(part.text)}</div>;
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
//  MAIN AI TUTOR COMPONENT (PAGE 2)
// ──────────────────────────────────────────────
export default function AITutor({
  onNavigate,
  initialLanguage = "Python",
  username = "Aarav",
}) {
  // ── State for Chat Sessions ──
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState("chat-two-sum");

  // Active chat session reference
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || chats[0];
  }, [chats, activeChatId]);

  // Active code being edited and evaluated alongside prompt
  const [activeCode, setActiveCode] = useState(() => activeChat.currentCode || CODE_TEMPLATES[activeChat.language] || "");
  const [selectedLang, setSelectedLang] = useState(activeChat.language || initialLanguage);

  // When activeChatId changes, sync code & language
  useEffect(() => {
    if (activeChat) {
      setActiveCode(activeChat.currentCode || CODE_TEMPLATES[activeChat.language] || "");
      setSelectedLang(activeChat.language || "Python");
    }
  }, [activeChatId]);

  // ── Input & UI States ──
  const [promptInput, setPromptInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(true); // Dual-Input Code Preview Drawer
  const [codeCopied, setCodeCopied] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isSubmitting]);

  // ────────────────────────────────────────────
  //  Action: "+ New Chat"
  //  Initializes a brand new chat session and prepends to history list
  // ────────────────────────────────────────────
  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChatNumber = chats.length + 1;
    const starterCode = CODE_TEMPLATES[selectedLang] || CODE_TEMPLATES.Python;

    const newChat = {
      id: newId,
      title: `New Socratic Session #${newChatNumber}`,
      language: selectedLang,
      timestamp: "Just now",
      currentCode: starterCode,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: `Hey there, ${username}! 🚀 Brand new Socratic chat session initialized.\n\nI have loaded your **${selectedLang}** code context in the workspace below. Type any question, paste a bug report, or ask for guidance!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          hintLevel: 1,
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
    setActiveCode(starterCode);
  };

  // ────────────────────────────────────────────
  //  Action: Delete a Chat Session
  // ────────────────────────────────────────────
  const handleDeleteChat = (idToDelete, e) => {
    e.stopPropagation();
    if (chats.length <= 1) {
      alert("You need at least one active chat session.");
      return;
    }
    const remaining = chats.filter((c) => c.id !== idToDelete);
    setChats(remaining);
    if (activeChatId === idToDelete) {
      setActiveChatId(remaining[0].id);
    }
  };

  // ────────────────────────────────────────────
  //  Action: Send Prompt + Code Context (Dual-Input)
  // ────────────────────────────────────────────
  const handleSendPrompt = async (customPrompt = null) => {
    const textToSend = customPrompt !== null ? customPrompt : promptInput;
    if (!textToSend.trim() || isSubmitting) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      attachedCodeLength: activeCode.length,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update active chat's messages locally
    const updatedMessages = [...(activeChat.messages || []), userMsg];
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: updatedMessages, currentCode: activeCode }
          : c
      )
    );

    setPromptInput("");
    setIsSubmitting(true);

    try {
      // 1. Send Prompt + Current Code to backend AI route
      let res;
      try {
        res = await axios.post(AI_CHAT_ENDPOINT, {
          prompt: textToSend.trim(),
          currentCode: activeCode,
          language: selectedLang,
          lesson: activeChat.title,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        });
      } catch (proxyErr) {
        console.warn("Proxy post failed, attempting direct backend port 5000...", proxyErr);
        res = await axios.post(DIRECT_BACKEND_URL, {
          prompt: textToSend.trim(),
          currentCode: activeCode,
          language: selectedLang,
          lesson: activeChat.title,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        });
      }

      const tutorData = res.data?.data || res.data;
      const aiReplyText =
        tutorData.message ||
        tutorData.socraticResponse ||
        (typeof tutorData === "string" ? tutorData : "I have inspected your code and prompt.");

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiReplyText,
        hintLevel: tutorData.hintLevel || 1,
        lineReference: tutorData.lineReference || null,
        microMcq: tutorData.microMcq || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...updatedMessages, aiMsg] }
            : c
        )
      );
    } catch (err) {
      console.error("AI Tutor send error:", err);
      // Fallback Socratic inquiry
      const fallbackAiMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `💡 **Socratic Guidance & Code Evaluation:**\n\nI reviewed your **${selectedLang}** code (${activeCode.split("\n").length} lines) regarding: *"${textToSend.trim()}"*.\n\nTake a look at how your loop terminates. What is the value of your pointer/index at the final boundary?`,
        microMcq: {
          question: "When evaluating bounds, what check avoids an out-of-bounds error?",
          options: [
            "Check length boundaries (i < len) before accessing array[i]",
            "Increment index inside the condition block",
            "Wrap everything in an empty try/catch block",
          ],
          correctIndex: 0,
          explanation: "Boundary checking before index access is fundamental across all languages!",
        },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...updatedMessages, fallbackAiMsg] }
            : c
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleResetStarter = () => {
    const starter = CODE_TEMPLATES[selectedLang] || "";
    setActiveCode(starter);
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, currentCode: starter } : c))
    );
  };

  const lineCount = Math.max(activeCode.split("\n").length, 1);

  return (
    <div
      className="min-h-screen text-[#0F172A] selection:bg-[#FFDF2B] flex flex-col"
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
        activePage="ai-tutor"
        onNavigate={onNavigate}
        selectedLang={selectedLang}
        onSelectLang={(lang) => {
          setSelectedLang(lang);
          if (CODE_TEMPLATES[lang]) {
            setActiveCode(CODE_TEMPLATES[lang]);
          }
        }}
        username={username}
      />

      {/* ── Main Split-Screen Workspace ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* ═══════════════════════════════════════════
            LEFT SIDEBAR: CHAT HISTORY & SESSIONS
            Width: ~280px, Solid border
            ═══════════════════════════════════════════ */}
        <aside className="w-full md:w-72 shrink-0 bg-[#FAF9F0] border-r-2 border-[#0F172A] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* 1. PROMINENT "+ NEW CHAT" BUTTON */}
            <button
              onClick={handleNewChat}
              className="w-full py-3 px-4 rounded-xl bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] font-black text-sm border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              <span>+ New Chat</span>
            </button>

            {/* 2. CHAT HISTORY SESSIONS LIST */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <ChatIcon className="w-3.5 h-3.5 text-[#0F172A]" />
                  Chat History
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#DBEAFE] text-[#1D4ED8] border border-[#0F172A]">
                  {chats.length} Sessions
                </span>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {chats.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`group relative p-3 rounded-xl border-2 border-[#0F172A] transition-all cursor-pointer ${
                        isActive
                          ? "bg-white shadow-[4px_4px_0px_#0F172A] translate-x-1"
                          : "bg-white/70 hover:bg-white hover:shadow-[2px_2px_0px_#0F172A]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h4 className="text-xs font-black text-[#0F172A] line-clamp-1">
                          {chat.title}
                        </h4>
                        {chats.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5"
                            title="Delete session"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mt-1">
                        <span className="px-1.5 py-0.2 rounded bg-[#FAF9F0] border border-[#0F172A]/30 text-[#0F172A]">
                          {chat.language || "Python"}
                        </span>
                        <span>{chat.timestamp || "Active"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Socratic Mode Badge Footer */}
          <div className="mt-4 pt-3 border-t-2 border-[#0F172A]/10">
            <div className="p-2.5 rounded-xl bg-white border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-black text-[#0F172A]">Socratic Guardrails</p>
                <p className="text-[10px] text-slate-500 font-bold">Never gives away direct code</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════════════════
            RIGHT MAIN CHAT AREA (AI TUTOR WORKSPACE)
            ═══════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col justify-between max-h-[calc(100vh-65px)] overflow-hidden">
          {/* 1. CHAT HEADER */}
          <div className="px-5 py-3.5 bg-white border-b-2 border-[#0F172A] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#0F172A]">
                  {activeChat.title}
                </h2>
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <span>Track: {selectedLang}</span>
                  <span>•</span>
                  <span>{activeChat.messages?.length || 0} messages exchanged</span>
                </p>
              </div>
            </div>

            {/* Socratic No-Spoiler Mode Active Badge */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
                <span className="text-xs font-black text-[#1D4ED8]">
                  Socratic No-Spoiler Mode Active
                </span>
              </div>
            </div>
          </div>

          {/* 2. CHAT MESSAGE FEED (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeChat.messages?.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                      🤖
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl border-2 border-[#0F172A] p-4 transition-all ${
                      isAssistant
                        ? "bg-white shadow-[4px_4px_0px_#0F172A]"
                        : "bg-[#FFDF2B] text-[#0F172A] shadow-[4px_4px_0px_#0F172A]"
                    }`}
                  >
                    {/* Header inside message */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-[#0F172A]/15 text-[11px] font-bold">
                      <span className="font-black text-[#0F172A] flex items-center gap-1">
                        {isAssistant ? (
                          <>
                            <span>Socratic AI Tutor</span>
                            {message.hintLevel && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FEF08A] border border-[#0F172A]/40">
                                Hint Level {message.hintLevel}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span>{username}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-[#0F172A]/40 font-mono">
                              📎 Code Attached
                            </span>
                          </>
                        )}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {message.timestamp}
                      </span>
                    </div>

                    {/* Line reference indicator if any */}
                    {message.lineReference && (
                      <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-200 border border-amber-400 font-mono text-[10px]">
                          Line {message.lineReference.line}
                        </span>
                        <span>{message.lineReference.message}</span>
                      </div>
                    )}

                    {/* Content formatted */}
                    <FormattedMessage content={message.content} language={selectedLang} />

                    {/* Micro-MCQ interactive widget if attached */}
                    {message.microMcq && <MicroMcqCard microMcq={message.microMcq} />}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-black text-xs shrink-0 mt-1">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isSubmitting && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                  🤖
                </div>
                <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[3px_3px_0px_#0F172A] p-3 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs font-bold text-[#475569] font-mono">
                    Analyzing prompt & editor code context...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. SUGGESTED PROMPTS (Quick chips if conversation is short) */}
          {(activeChat.messages?.length || 0) <= 3 && (
            <div className="px-4 py-2 bg-[#FAF9F0] border-t-2 border-[#0F172A]/10 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#475569] shrink-0">
                  ⚡ Quick:
                </span>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(prompt.query)}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FEF9C3] border border-[#0F172A] shadow-[1px_1px_0px_#0F172A] font-bold text-[11px] text-[#0F172A] shrink-0 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{prompt.icon}</span>
                    <span>{prompt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              4. BOTTOM DUAL-INPUT BAR
              (Prompt Input + Code Snippet Context Preview + Send Button)
              ═══════════════════════════════════════════ */}
          <div className="p-4 bg-white border-t-2 border-[#0F172A] shrink-0">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* CODE SNIPPET CONTEXT PREVIEW BOX (Collapsible / Editable) */}
              <div className="rounded-xl border-2 border-[#0F172A] bg-[#0F172A] text-white overflow-hidden shadow-[3px_3px_0px_#0F172A]">
                {/* Header bar of code snippet context */}
                <div className="px-3 py-2 bg-[#1E293B] border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CodeBracketIcon className="w-4 h-4 text-[#38BDF8]" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      Code Snippet Context ({FILE_EXTENSIONS[selectedLang]})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      • {lineCount} lines • Evaluated alongside prompt
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetStarter}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold border border-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                      title="Reset boilerplate"
                    >
                      <RefreshIcon className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold border border-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {codeCopied ? (
                        <>
                          <CheckIcon className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
                      className="px-2 py-0.5 rounded bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#38BDF8]/40 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {isCodeDrawerOpen ? (
                        <>
                          <span>Hide Editor</span>
                          <ChevronUpIcon className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span>Edit Code</span>
                          <ChevronDownIcon className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Textarea Drawer */}
                {isCodeDrawerOpen && (
                  <div className="p-2.5 bg-[#0B1120]">
                    <textarea
                      value={activeCode}
                      onChange={(e) => setActiveCode(e.target.value)}
                      rows={5}
                      spellCheck="false"
                      className="w-full bg-transparent text-[#F8FAFC] font-mono text-xs leading-[1.6] resize-y focus:outline-none overflow-auto whitespace-pre selection:bg-[#38BDF8]/30"
                      placeholder={`Write or paste your ${selectedLang} code here to be evaluated...`}
                    />
                  </div>
                )}
              </div>

              {/* CHAT PROMPT INPUT BOX + VIBRANT YELLOW SEND BUTTON */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="relative flex-1 rounded-xl border-2 border-[#0F172A] bg-[#FAF9F0] shadow-[3px_3px_0px_#0F172A] focus-within:border-[#1D4ED8] transition-all">
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI a question or request Socratic guidance on your code..."
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none font-medium"
                  />
                  <div className="px-3 pb-1 text-[10px] text-[#64748B] flex justify-between">
                    <span>Shift+Enter for newline</span>
                    <span className="font-mono text-[#1D4ED8]">
                      📎 Code attached: {lineCount} lines ({selectedLang})
                    </span>
                  </div>
                </div>

                {/* Send Button styled in vibrant yellow (#FFDF2B) with hard shadow */}
                <button
                  type="submit"
                  disabled={isSubmitting || !promptInput.trim()}
                  className={`px-6 py-3 rounded-xl border-2 border-[#0F172A] font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer self-stretch sm:self-auto shrink-0 ${
                    isSubmitting || !promptInput.trim()
                      ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                      : "bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  <span>Send Prompt</span>
                  <SendIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
