import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// ──────────────────────────────────────────────
//  Configurable Endpoints (Axios)
// ──────────────────────────────────────────────
export const AI_CHAT_ENDPOINT = "/api/ai/chat";
export const DIRECT_BACKEND_URL = "http://localhost:5001/api/ai/chat";
export const RUN_CODE_ENDPOINT = "/api/run";
export const DIRECT_RUN_ENDPOINT = "http://localhost:5001/api/run";

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

function PlayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function TerminalIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function SpinnerIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
function FormattedMessage({ content, language, onApplyCode }) {
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
              className="my-3 rounded-xl border-2 border-[#0F172A] bg-[#070B14] text-[#F8FAFC] shadow-[3px_3px_0px_#0F172A] overflow-hidden"
            >
              <div className="px-3 py-1.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 opacity-80">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] ml-1">{part.lang}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {onApplyCode && (
                    <button
                      type="button"
                      onClick={() => onApplyCode(part.code)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 transition-colors cursor-pointer"
                      title="Load this snippet into your active editor"
                    >
                      <SparklesIcon className="w-2.5 h-2.5 text-sky-300" />
                      <span>Apply to Editor</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(part.code, index)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
                  >
                    {copiedIndex === index ? (
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
                </div>
              </div>
              <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed bg-[#070B14] dark-scrollbar">
                <pre className="text-emerald-300/90 font-mono">
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
  user,
  onLogout,
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
  const [codeCopied, setCodeCopied] = useState(false);

  // ── Code Execution & Terminal States ──
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [stdinInput, setStdinInput] = useState("");
  const [activeTerminalTab, setActiveTerminalTab] = useState("output"); // "output" | "stdin"
  const [terminalCopied, setTerminalCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "code"

  const messagesEndRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync line numbers scroll with editor textarea
  const handleEditorScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Editor keyboard actions: Tab indent + Cmd/Ctrl+Enter execution
  const handleEditorKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = activeCode.substring(0, start) + "  " + activeCode.substring(end);
      setActiveCode(newCode);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

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

  // ────────────────────────────────────────────
  //  Action: Run Code in Live Sandbox
  // ────────────────────────────────────────────
  const handleRunCode = async () => {
    if (isRunningCode || !activeCode.trim()) return;
    setIsRunningCode(true);
    setIsTerminalOpen(true);
    setActiveTerminalTab("output");

    try {
      let res;
      try {
        res = await axios.post(RUN_CODE_ENDPOINT, {
          code: activeCode,
          language: selectedLang,
          stdin: stdinInput,
        });
      } catch (proxyErr) {
        console.warn("Proxy execution call failed, falling back to direct port 5001...", proxyErr);
        res = await axios.post(DIRECT_RUN_ENDPOINT, {
          code: activeCode,
          language: selectedLang,
          stdin: stdinInput,
        });
      }

      const executionData = res.data?.data || res.data;
      setRunResult(executionData);
    } catch (err) {
      console.error("Code execution failed:", err);
      setRunResult({
        status: { id: 11, description: "Execution Error" },
        stdout: "",
        stderr: err.response?.data?.error || err.response?.data?.details || err.message || "Failed to execute code.",
        time: "0ms",
        memory: "0 MB",
        exit_code: 1,
        engine: "Runtime Error",
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleClearTerminal = () => {
    setRunResult(null);
  };

  const handleCopyTerminal = () => {
    if (!runResult) return;
    const fullOutput = [runResult.stdout, runResult.stderr, runResult.compile_output]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(fullOutput || "(No output)");
    setTerminalCopied(true);
    setTimeout(() => setTerminalCopied(false), 2000);
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
        user={user}
        onLogout={onLogout}
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
                          ? "bg-white shadow-[4px_4px_0px_#0F172A] border-l-[6px] border-l-[#FFDF2B] translate-x-1"
                          : "bg-white/80 hover:bg-white hover:shadow-[2px_2px_0px_#0F172A] hover:border-l-[4px] hover:border-l-slate-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <h4 className="text-xs font-black text-[#0F172A] line-clamp-1">
                          {chat.title}
                        </h4>
                        {chats.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5"
                            title="Delete session"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-[#FAF9F0] border border-[#0F172A]/30 text-[#0F172A] font-mono">
                          {chat.language || "Python"}
                        </span>
                        <span className="text-slate-400">{chat.timestamp || "Active"}</span>
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
            PARALLEL WORKSPACE: CHAT (LEFT) & CODE SNIPPET (RIGHT)
            ═══════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col lg:flex-row max-h-[calc(100vh-65px)] overflow-hidden min-w-0">
          {/* ───────────────────────────────────────────
              PARALLEL PANE 1 (LEFT): CHAT CONVERSATION & PROMPT
              ─────────────────────────────────────────── */}
          <div
            className={`w-full lg:w-1/2 flex flex-col min-w-0 border-b-2 lg:border-b-0 lg:border-r-2 border-[#0F172A] bg-[#FAF9F0] overflow-hidden ${
              mobileTab === "code" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* 1. CHAT HEADER */}
            <div className="px-4 py-3 bg-white border-b-2 border-[#0F172A] flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-base shrink-0">
                  🤖
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-[#0F172A] truncate tracking-tight">
                    {activeChat.title}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px]">
                      {selectedLang}
                    </span>
                    <span>•</span>
                    <span>{activeChat.messages?.length || 0} interactions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile View Toggle */}
                <div className="lg:hidden flex items-center bg-slate-100 rounded-lg p-0.5 border border-[#0F172A]">
                  <button
                    type="button"
                    onClick={() => setMobileTab("chat")}
                    className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                      mobileTab === "chat" ? "bg-[#FFDF2B] text-[#0F172A] shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab("code")}
                    className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${
                      mobileTab === "code" ? "bg-[#FFDF2B] text-[#0F172A] shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Editor & Sandbox
                  </button>
                </div>

                {/* Socratic No-Spoiler Mode Active Badge */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
                  <span className="text-[11px] font-black text-[#1D4ED8] uppercase tracking-wider">
                    Socratic Mode
                  </span>
                </div>
              </div>
            </div>

            {/* 2. CHAT MESSAGE FEED (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {activeChat.messages?.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 sm:gap-3 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}

                    <div
                      className={`max-w-xl sm:max-w-2xl rounded-2xl border-2 border-[#0F172A] p-4 transition-all ${
                        isAssistant
                          ? "bg-white shadow-[3px_3px_0px_#0F172A]"
                          : "bg-[#FEF08A] text-[#0F172A] shadow-[3px_3px_0px_#0F172A]"
                      }`}
                    >
                      {/* Header inside message */}
                      <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-[#0F172A]/15 text-[11px] font-bold">
                        <span className="font-black text-[#0F172A] flex items-center gap-1.5">
                          {isAssistant ? (
                            <>
                              <span>Socratic AI Tutor</span>
                              {message.hintLevel && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FEF08A] border border-[#0F172A]/30 font-bold">
                                  Hint Level {message.hintLevel}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span>{username}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-[#0F172A]/30 font-mono font-bold">
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
                        <div className="mb-2.5 p-2 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-amber-200 border border-amber-400 font-mono text-[10px]">
                            Line {message.lineReference.line}
                          </span>
                          <span>{message.lineReference.message}</span>
                        </div>
                      )}

                      {/* Content formatted with Apply Fix capability */}
                      <FormattedMessage
                        content={message.content}
                        language={selectedLang}
                        onApplyCode={(fixCode) => {
                          setActiveCode(fixCode);
                          setMobileTab("code");
                        }}
                      />

                      {/* Micro-MCQ interactive widget if attached */}
                      {message.microMcq && <MicroMcqCard microMcq={message.microMcq} />}
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-[#FFDF2B] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
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
                  <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[3px_3px_0px_#0F172A] p-3.5 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs font-bold text-[#475569] font-mono">
                      Analyzing code & formulating Socratic inquiry...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 3. SUGGESTED PROMPTS (Quick chips if conversation is short) */}
            {(activeChat.messages?.length || 0) <= 3 && (
              <div className="px-4 py-2.5 bg-[#FAF9F0] border-t-2 border-[#0F172A]/15 shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#475569] shrink-0">
                    ⚡ Quick Questions:
                  </span>
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendPrompt(prompt.query)}
                      disabled={isSubmitting}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-[#FEF9C3] hover:-translate-y-0.5 border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] font-bold text-[11px] text-[#0F172A] shrink-0 flex items-center gap-1.5 transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <span>{prompt.icon}</span>
                      <span>{prompt.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. CHAT PROMPT INPUT BAR (Bottom of Left Chat Column) */}
            <div className="p-3.5 bg-white border-t-2 border-[#0F172A] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex items-stretch gap-2.5"
              >
                <div className="relative flex-1 rounded-2xl border-2 border-[#0F172A] bg-[#FAF9F0] shadow-[3px_3px_0px_#0F172A] focus-within:border-[#1D4ED8] transition-all">
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question, paste a runtime error, or request Socratic guidance..."
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 bg-transparent text-xs sm:text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none font-medium leading-relaxed"
                  />
                  <div className="px-3 pb-1.5 text-[10px] text-[#64748B] flex justify-between select-none">
                    <span>Press <kbd className="px-1 py-0.5 bg-white border border-[#0F172A]/20 rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-white border border-[#0F172A]/20 rounded text-[9px]">Shift+Enter</kbd> for newline</span>
                    <span className="font-mono text-[#1D4ED8] font-bold">
                      📎 Context: {lineCount} lines ({selectedLang})
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !promptInput.trim()}
                  className={`px-5 rounded-2xl border-2 border-[#0F172A] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer self-stretch shrink-0 ${
                    isSubmitting || !promptInput.trim()
                      ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none"
                      : "bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] shadow-[4px_4px_0px_#0F172A] hover:shadow-[2px_2px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  }`}
                >
                  <span>Send</span>
                  <SendIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* ───────────────────────────────────────────
              PARALLEL PANE 2 (RIGHT): CODE SNIPPET CONTEXT & RUNNER (IDE)
              ─────────────────────────────────────────── */}
          <div
            className={`w-full lg:w-1/2 flex flex-col min-w-0 bg-[#070B14] text-white overflow-hidden ${
              mobileTab === "chat" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* 1. IDE TOP HEADER BAR */}
            <div className="px-3.5 py-2 bg-[#0F172A] border-b-2 border-[#0F172A] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-3">
                {/* macOS Window Controls */}
                <div className="hidden sm:flex items-center gap-1.5 mr-1 select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-[#DC2626]/60 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-[#D97706]/60 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-[#059669]/60 shadow-sm" />
                </div>

                {/* Active Tab */}
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1E293B] border-t-2 border-t-[#38BDF8] border-x border-b border-slate-700/80 rounded-t-lg text-xs font-mono font-bold text-slate-200 shadow-sm">
                  <span className="text-[#38BDF8]">{selectedLang === "Python" ? "🐍" : "⚡"}</span>
                  <span>{FILE_EXTENSIONS[selectedLang]}</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">({lineCount}L)</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                {/* RUN CODE BUTTON */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunningCode || !activeCode.trim()}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-2 transition-all cursor-pointer border-2 ${
                    isRunningCode
                      ? "bg-emerald-950 text-emerald-400 border-emerald-600/60 cursor-wait"
                      : "bg-[#10B981] hover:bg-[#059669] text-slate-950 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]"
                  }`}
                  title="Execute code in sandbox (Cmd+Enter or Ctrl+Enter)"
                >
                  {isRunningCode ? (
                    <>
                      <SpinnerIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-3.5 h-3.5 fill-current text-slate-950" />
                      <span>Run Code</span>
                      <span className="text-[10px] bg-slate-900/20 px-1 py-0.2 rounded font-sans font-bold">⌘↵</span>
                    </>
                  )}
                </button>

                {/* TERMINAL TOGGLE */}
                <button
                  type="button"
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isTerminalOpen
                      ? "bg-[#1E293B] text-sky-300 border-sky-400/80 shadow-[1px_1px_0px_#0F172A]"
                      : "bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 border-slate-700"
                  }`}
                  title="Toggle console terminal"
                >
                  <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Terminal</span>
                  {runResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        runResult.status?.id === 3 ? "bg-emerald-400 shadow-[0_0_6px_#10B981]" : "bg-rose-400 shadow-[0_0_6px_#F43F5E]"
                      }`}
                    />
                  )}
                </button>

                {/* RESET STARTER BUTTON */}
                <button
                  type="button"
                  onClick={handleResetStarter}
                  className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 text-[11px] font-mono font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  title="Reset to boilerplate code"
                >
                  <RefreshIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                {/* COPY CODE BUTTON */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 text-[11px] font-mono font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                  title="Copy editor code"
                >
                  {codeCopied ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. CODE EDITOR BODY (With Line Numbers Gutter & Tab Indent) */}
            <div className="flex-1 flex min-h-0 bg-[#070B14] relative overflow-hidden">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="w-10 sm:w-12 py-3 px-1.5 bg-[#050811] border-r border-slate-800/80 text-slate-600 font-mono text-xs leading-6 select-none text-right overflow-hidden shrink-0"
              >
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx} className="h-6 leading-6">
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Monospace Code Editor Textarea */}
              <textarea
                ref={textareaRef}
                value={activeCode}
                onChange={(e) => setActiveCode(e.target.value)}
                onScroll={handleEditorScroll}
                onKeyDown={handleEditorKeyDown}
                spellCheck="false"
                className="flex-1 p-3 bg-[#070B14] text-[#F1F5F9] font-mono text-xs sm:text-[13px] leading-6 resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-[#38BDF8]/30 dark-scrollbar"
                placeholder={`Write or paste your ${selectedLang} code here (Cmd+Enter to Run)...`}
              />
            </div>

            {/* 3. TERMINAL CONSOLE / RUNNER PANEL */}
            {isTerminalOpen ? (
              <div className="h-64 sm:h-72 border-t-2 border-slate-800 bg-[#050811] flex flex-col shrink-0 overflow-hidden shadow-2xl">
                {/* Terminal Header Bar */}
                <div className="px-3.5 py-1.5 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5">
                    {/* Tab buttons */}
                    <div className="flex items-center bg-[#070B14] rounded-lg p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveTerminalTab("output")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTerminalTab === "output"
                            ? "bg-slate-800 text-sky-300 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <TerminalIcon className="w-3 h-3" />
                        <span>Output</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTerminalTab("stdin")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeTerminalTab === "stdin"
                            ? "bg-slate-800 text-amber-300 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>Stdin</span>
                        {stdinInput.trim() && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </button>
                    </div>

                    {/* Status badge */}
                    {runResult && (
                      <div
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                          runResult.status?.id === 3
                            ? "bg-emerald-950/70 text-emerald-300 border-emerald-600/50"
                            : runResult.status?.id === 5
                            ? "bg-amber-950/70 text-amber-300 border-amber-600/50"
                            : "bg-rose-950/70 text-rose-300 border-rose-600/50"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            runResult.status?.id === 3
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-rose-400"
                          }`}
                        />
                        <span>{runResult.status?.description || "Executed"}</span>
                        {runResult.time && <span className="opacity-70 font-normal">({runResult.time})</span>}
                      </div>
                    )}
                  </div>

                  {/* Terminal Actions */}
                  <div className="flex items-center gap-1.5">
                    {runResult && (
                      <>
                        <button
                          type="button"
                          onClick={handleCopyTerminal}
                          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold border border-slate-700 transition-colors cursor-pointer"
                          title="Copy output"
                        >
                          {terminalCopied ? "Copied!" : "Copy"}
                        </button>
                        <button
                          type="button"
                          onClick={handleClearTerminal}
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          title="Clear terminal"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTerminalOpen(false)}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 transition-colors cursor-pointer"
                      title="Minimize terminal"
                    >
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Terminal Body */}
                <div className="flex-1 overflow-y-auto p-3.5 bg-[#050811] dark-scrollbar">
                  {activeTerminalTab === "stdin" ? (
                    <div className="h-full flex flex-col">
                      <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-300">Standard Input (stdin):</span>
                        <span className="text-slate-500 text-[10px]">Piped to program during sandbox run</span>
                      </div>
                      <textarea
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        className="w-full flex-1 bg-[#090E1A] border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500 resize-none dark-scrollbar leading-relaxed"
                        placeholder="Enter standard input values (space or newline separated)..."
                      />
                    </div>
                  ) : isRunningCode ? (
                    <div className="flex items-center gap-2.5 text-sky-400 py-4 px-2">
                      <SpinnerIcon className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-mono">
                        Executing {FILE_EXTENSIONS[selectedLang]} in isolated sandbox engine...
                      </span>
                    </div>
                  ) : runResult ? (
                    <div className="space-y-2.5 font-mono text-xs leading-relaxed">
                      {/* Compilation Error */}
                      {runResult.compile_output && (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1.5">
                            <span>⚠️ Compilation Error:</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-xs text-rose-200 overflow-x-auto dark-scrollbar">
                            {runResult.compile_output}
                          </pre>
                        </div>
                      )}

                      {/* Standard Output (stdout) */}
                      {runResult.stdout && (
                        <div className="p-2.5 rounded-lg bg-[#070D1A] border border-slate-800/80">
                          <pre className="whitespace-pre-wrap font-mono text-emerald-300 leading-relaxed overflow-x-auto dark-scrollbar">
                            {runResult.stdout}
                          </pre>
                        </div>
                      )}

                      {/* Standard Error (stderr) */}
                      {runResult.stderr && (
                        <div className="p-3 rounded-xl bg-rose-950/40 border-l-4 border-rose-500 text-rose-300">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1.5">
                            <span>⚠️ Runtime Error:</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-xs text-rose-200 overflow-x-auto dark-scrollbar">
                            {runResult.stderr}
                          </pre>
                        </div>
                      )}

                      {/* No output printed */}
                      {!runResult.stdout && !runResult.stderr && !runResult.compile_output && (
                        <div className="text-slate-400 italic text-xs py-2 px-1">
                          [Process exited with code {runResult.exit_code ?? 0} — No console output printed]
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 py-6 text-xs flex flex-col justify-center items-center h-full text-center">
                      <TerminalIcon className="w-7 h-7 text-slate-700 mb-2" />
                      <span className="font-semibold text-slate-400">Terminal ready for code execution.</span>
                      <span className="text-[11px] text-slate-600 mt-1">
                        Click &quot;Run Code&quot; or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">⌘↵</kbd> to execute your code.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsTerminalOpen(true)}
                className="px-4 py-2 bg-[#0B1120] hover:bg-[#0F172A] border-t-2 border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center justify-between cursor-pointer transition-colors shrink-0 select-none group"
              >
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-slate-300">Terminal Console</span>
                  {runResult && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        runResult.status?.id === 3
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                          : "bg-rose-950/80 text-rose-300 border border-rose-700/50"
                      }`}
                    >
                      {runResult.status?.description || "Last Result"} {runResult.time ? `(${runResult.time})` : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-sky-300 transition-colors font-medium">
                  <span>Expand Terminal</span>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
