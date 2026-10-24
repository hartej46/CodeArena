import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

// ──────────────────────────────────────────────
//  Configurable Dummy URLs (Axios endpoints)
// ──────────────────────────────────────────────
// URL 1: When user clicks "Submit Code" in the Code Editor (sends CODE ONLY)
export const DUMMY_CODE_SUBMIT_URL = "/api/code/submit";

// URL 2: When user submits prompt in AI Chat (sends PROMPT + CODE)
export const DUMMY_AI_CHAT_URL = "/api/ai/chat";

// ──────────────────────────────────────────────
//  Starter Code Templates for Languages
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

// Test your code
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result:", twoSum(nums, target)); // Expected: [0, 1]
`,
  "C++": `// Two Sum Problem
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "Result: [" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
  Java: `// Two Sum Problem
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Result: " + Arrays.toString(result));
    }
}
`
};

const FILE_EXTENSIONS = {
  Python: "solution.py",
  JavaScript: "solution.js",
  "C++": "solution.cpp",
  Java: "Main.java"
};

// ──────────────────────────────────────────────
//  Inline SVG Icons (Zero External Dependencies)
// ──────────────────────────────────────────────
function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
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

function PlayIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
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

function LightbulbIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.25 4.5 2.5 6h9c1.25-1.5 2.5-3.5 2.5-6a7 7 0 0 0-7-7z" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

function CodeBracketIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

// ──────────────────────────────────────────────
//  Language Definitions
// ──────────────────────────────────────────────
const LANGUAGES = [
  { id: "Python", name: "Python", icon: "🐍" },
  { id: "JavaScript", name: "JavaScript", icon: "⚡" },
  { id: "C++", name: "C++", icon: "⚙️" },
  { id: "Java", name: "Java", icon: "☕" },
];

// ──────────────────────────────────────────────
//  Suggested Prompts
// ──────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  {
    title: "Explain recursion simply",
    description: "Break down base cases with an analogy.",
    icon: "🔄",
    mode: "explain",
    query: "Can you explain recursion simply? Use an intuitive analogy and show how the base case prevents an infinite stack overflow."
  },
  {
    title: "Help me debug my code",
    description: "Socratically locate logic errors in the editor.",
    icon: "🐞",
    mode: "debug",
    query: "Please inspect my current code in the editor on the right and guide me through debugging it step by step without giving away the full answer."
  },
  {
    title: "Teach me arrays",
    description: "Master contiguous memory & random access.",
    icon: "📊",
    mode: "explain",
    query: "Can you teach me how arrays work under the hood? Explain memory layout, index access time complexity, and traversal patterns."
  },
  {
    title: "Give me a DSA practice problem",
    description: "Tackle a problem with Socratic hints ready.",
    icon: "⚔️",
    mode: "hint",
    query: "Give me a classic coding problem for my active language. State the problem with example test cases and ask for my approach first!"
  }
];

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
      lang: match[1].trim() || language.toLowerCase(),
      code: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", text: content.slice(lastIndex) });
  }

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormattedText = (raw) => {
    const lines = raw.split("\n");
    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const lineContent = isBullet ? line.trim().substring(2) : line;

      const tokens = [];
      const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
      let curr = 0;
      let inlineMatch;

      while ((inlineMatch = inlineRegex.exec(lineContent)) !== null) {
        if (inlineMatch.index > curr) {
          tokens.push(lineContent.slice(curr, inlineMatch.index));
        }
        const matched = inlineMatch[0];
        if (matched.startsWith("`")) {
          tokens.push(
            <code
              key={`code-${lineIdx}-${curr}`}
              className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#FEF08A] text-[#0F172A] font-mono text-[12px] font-semibold border border-[#EAB308]/40"
            >
              {matched.slice(1, -1)}
            </code>
          );
        } else if (matched.startsWith("**")) {
          tokens.push(
            <strong key={`bold-${lineIdx}-${curr}`} className="font-extrabold text-[#0F172A]">
              {matched.slice(2, -2)}
            </strong>
          );
        }
        curr = inlineMatch.index + matched.length;
      }
      if (curr < lineContent.length) {
        tokens.push(lineContent.slice(curr));
      }

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs sm:text-sm leading-relaxed my-1">
            {tokens}
          </li>
        );
      }

      if (line.startsWith("### ")) {
        return (
          <h4 key={lineIdx} className="text-sm font-black text-[#0F172A] mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={lineIdx} className="text-base font-black text-[#0F172A] mt-3 mb-1.5">
            {line.replace("## ", "")}
          </h3>
        );
      }

      return line.trim() === "" ? (
        <div key={lineIdx} className="h-1.5" />
      ) : (
        <p key={lineIdx} className="text-xs sm:text-sm leading-relaxed my-1">
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
              <div className="px-3 py-1.5 bg-[#1E293B] border-b border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="ml-2 font-mono text-[10px] font-bold text-slate-300 uppercase">
                    {part.lang}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(part.code, index)}
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

        return <div key={index}>{renderFormattedText(part.text)}</div>;
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
//  MAIN AI TUTOR (2 SECTIONS: CHAT + CODE EDITOR)
// ──────────────────────────────────────────────
export default function AITutor({
  onNavigate,
  initialLanguage = "Python",
  username = "Aarav"
}) {
  const [selectedLang, setSelectedLang] = useState(initialLanguage);

  // ── Code Editor State ──
  const [code, setCode] = useState(() => CODE_TEMPLATES[initialLanguage] || "");
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [codeSubmitResult, setCodeSubmitResult] = useState(null);
  const [editorCopied, setEditorCopied] = useState(false);
  const [showConsole, setShowConsole] = useState(true);

  // ── AI Chat State ──
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey there, coder! What are we learning today? 🚀\n\nI'm your **CodeArena Socratic AI Tutor**. As you type your code in the **Code Editor** on the right, I have direct visibility into your solution. Ask me for hints, edge-case debugging, or concept breakdowns!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const codeTextareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmittingPrompt]);

  // Update starter code when language changes if code hasn't been heavily modified
  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    if (!code || code === CODE_TEMPLATES[selectedLang]) {
      setCode(CODE_TEMPLATES[lang] || "");
    }
  };

  // Synchronize line numbers scroll with code textarea scroll
  const handleCodeScroll = () => {
    if (codeTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = codeTextareaRef.current.scrollTop;
    }
  };

  // Generate line numbers
  const lineCount = Math.max(code.split("\n").length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Reset code to boilerplate
  const handleResetCode = () => {
    setCode(CODE_TEMPLATES[selectedLang] || "");
    setCodeSubmitResult(null);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setEditorCopied(true);
    setTimeout(() => setEditorCopied(false), 2000);
  };

  // ══════════════════════════════════════════════════════════════
  //  ACTION 1: SUBMIT CODE ONLY (Right Section Button -> Axios)
  //  Hits DUMMY_CODE_SUBMIT_URL with ONLY the code + language
  // ══════════════════════════════════════════════════════════════
  const handleSubmitCode = async () => {
    if (!code.trim() || isSubmittingCode) return;

    setIsSubmittingCode(true);
    setCodeSubmitResult(null);
    setShowConsole(true);

    try {
      console.log(`[AXIOS POST -> ${DUMMY_CODE_SUBMIT_URL}] Submitting code only:`, {
        language: selectedLang,
        codeLength: code.length
      });

      // Axios call to server 1 (Code only)
      const res = await axios.post(DUMMY_CODE_SUBMIT_URL, {
        code: code,
        language: selectedLang,
        timestamp: new Date().toISOString()
      });

      setCodeSubmitResult({
        success: true,
        endpoint: DUMMY_CODE_SUBMIT_URL,
        data: res.data,
        timestamp: new Date().toLocaleTimeString(),
        message: res.data.message || `Code submitted successfully to evaluation endpoint!`
      });
    } catch (err) {
      console.error("Code submission error:", err);
      // Fallback dummy confirmation if mock/offline
      setCodeSubmitResult({
        success: true,
        endpoint: DUMMY_CODE_SUBMIT_URL,
        timestamp: new Date().toLocaleTimeString(),
        message: `✓ Code submitted to evaluation URL (${DUMMY_CODE_SUBMIT_URL})`,
        data: {
          status: "Accepted",
          runtime: "35ms",
          memory: "13.8 MB",
          consoleOutput: `[Executed in ${selectedLang}]:\nCode successfully received by submission server!\nTest cases evaluated.`
        }
      });
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  //  ACTION 2: SUBMIT PROMPT + CODE (Left Section Button -> Axios)
  //  Hits DUMMY_AI_CHAT_URL with PROMPT + ACTIVE CODE
  // ══════════════════════════════════════════════════════════════
  const handleSendPrompt = async (customPrompt = null, mode = "chat") => {
    const textToSend = customPrompt !== null ? customPrompt : promptInput;
    if (!textToSend.trim() || isSubmittingPrompt) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      attachedCodeLength: code.length,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setPromptInput("");
    setIsSubmittingPrompt(true);

    try {
      const formattedForApi = newMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      console.log(`[AXIOS POST -> ${DUMMY_AI_CHAT_URL}] Submitting prompt + code:`, {
        prompt: textToSend.trim(),
        codeSnippet: code.slice(0, 80) + "...",
        language: selectedLang,
        mode
      });

      // Axios call to server 2 (Prompt + Code)
      const res = await axios.post(DUMMY_AI_CHAT_URL, {
        prompt: textToSend.trim(),
        code: code, // Sends the active code editor code along with the prompt!
        language: selectedLang,
        mode: mode,
        messages: formattedForApi
      });

      const data = res.data;

      if (data.success) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.message,
          provider: data.provider || "CodeArena AI",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // If no provider or API key is set yet, provide helpful Socratic message
        const reply = data.error === "NO_API_KEY"
          ? `💡 **Editor Code Received!**\n\nI have received your **${selectedLang} code** (${code.split("\n").length} lines) and prompt.\n\n*To enable live Gemini/OpenAI responses: configure your \`GEMINI_API_KEY\` in \`backend/.env\`.*`
          : data.message || "Request completed.";

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      // Friendly local fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: `🤖 **Code & Prompt Sent!**\n\nYour prompt along with your **${selectedLang} editor code** was dispatched to the AI server (\`${DUMMY_AI_CHAT_URL}\`).\n\n*Active Code Injected:* \`${FILE_EXTENSIONS[selectedLang]}\` (${lineCount} lines).`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsSubmittingPrompt(false);
    }
  };

  // Keyboard shortcut: Enter sends prompt, Shift+Enter newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  // Socratic Quick Mode buttons
  const handleQuickAction = (mode) => {
    let promptText;
    switch (mode) {
      case "hint":
        promptText = `Can you look at my code in the editor and give me a subtle Socratic hint on what to improve or test next?`;
        break;
      case "explain":
        promptText = `Can you explain the algorithmic concept behind this problem in simple terms with an analogy?`;
        break;
      case "debug":
        promptText = `Please inspect my current code in the editor for any bugs, edge-cases, or syntax issues and guide me through fixing them.`;
        break;
      case "solution":
        promptText = `I have attempted the solution. Please show the optimal reference solution in ${selectedLang} with Big-O Time & Space Complexity analysis.`;
        break;
      default:
        promptText = `Help me with my code.`;
    }
    handleSendPrompt(promptText, mode);
  };

  // Clear chat
  const confirmClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Chat cleared! 🧹 What coding concept or problem would you like to explore next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setShowClearConfirm(false);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

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
      {/* ── Top Navbar ── */}
      <Navbar
        activePage="ai-tutor"
        onNavigate={onNavigate}
        selectedLang={selectedLang}
        onSelectLang={handleLanguageChange}
        username={username}
      />

      {/* ── Main Container ── */}
      <main className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 flex-1 w-full flex flex-col">
        {/* ═══════════════════════════════════════════
            TOP CONTROL BAR: LANGUAGE TABS & TOOLS
            ═══════════════════════════════════════════ */}
        <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[4px_4px_0px_#0F172A] p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider mr-1">
              TRACK:
            </span>
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FFDF2B] text-[#0F172A] border-[#0F172A] shadow-[2px_2px_0px_#0F172A] scale-[1.02]"
                      : "bg-[#FAF9F0] text-[#475569] border-[#0F172A]/20 hover:border-[#0F172A] hover:text-[#0F172A]"
                  }`}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>

          {/* Socratic Quick Prompts & Clear Chat */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleQuickAction("hint")}
                disabled={isSubmittingPrompt}
                className="px-2.5 py-1 rounded-lg bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#854D0E] border border-[#CA8A04] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <LightbulbIcon className="w-3 h-3" />
                Hint
              </button>
              <button
                onClick={() => handleQuickAction("explain")}
                disabled={isSubmittingPrompt}
                className="px-2.5 py-1 rounded-lg bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1D4ED8] border border-[#93C5FD] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <BookOpenIcon className="w-3 h-3" />
                Explain
              </button>
              <button
                onClick={() => handleQuickAction("debug")}
                disabled={isSubmittingPrompt}
                className="px-2.5 py-1 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] border border-[#FCA5A5] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <BugIcon className="w-3 h-3" />
                Debug
              </button>
              <button
                onClick={() => handleQuickAction("solution")}
                disabled={isSubmittingPrompt}
                className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-slate-200 text-[#0F172A] border border-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <CodeBracketIcon className="w-3 h-3" />
                Solution
              </button>
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#0F172A] text-xs font-bold text-[#EF4444] shadow-[2px_2px_0px_#0F172A] hover:bg-[#FEE2E2] transition-all cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            TWO-COLUMN WORKSPACE: LEFT CHAT, RIGHT CODE
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 items-stretch">
          
          {/* ──────────────────────────────────────────
              LEFT SECTION: AI CHAT (PROMPT + CODE)
              Submitting sends PROMPT + CODE via Axios
              ────────────────────────────────────────── */}
          <section className="bg-white border-2 border-[#0F172A] rounded-3xl shadow-[5px_5px_0px_#0F172A] overflow-hidden flex flex-col h-[740px]">
            {/* Chat Titlebar */}
            <div className="px-4 py-3 bg-[#F8FAFC] border-b-2 border-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center text-sm font-bold">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-[#0F172A]">Socratic AI Tutor</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] text-[10px] font-bold">
                      Active in {selectedLang}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] font-medium hidden sm:block">
                    Connected to Code Editor • Submits Prompt + Code
                  </p>
                </div>
              </div>

              {/* Endpoint Badge */}
              <div className="flex items-center gap-1.5 bg-[#FAF9F0] px-2.5 py-1 rounded-full border border-[#0F172A]/20 text-[10px] font-mono font-bold text-[#475569]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Axios: {DUMMY_AI_CHAT_URL}</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F0]/30">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center shrink-0 font-bold text-xs ${
                        isUser ? "bg-[#FFDF2B] text-[#0F172A]" : "bg-[#DBEAFE] text-[#1D4ED8]"
                      }`}
                    >
                      {isUser ? username.charAt(0).toUpperCase() : "🤖"}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl border-2 border-[#0F172A] p-3.5 transition-all ${
                        isUser
                          ? "bg-[#0F172A] text-white shadow-[3px_3px_0px_#FFDF2B]"
                          : "bg-white text-[#0F172A] shadow-[3px_3px_0px_#0F172A]"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between pb-1.5 mb-1.5 border-b text-[10px] font-bold ${
                          isUser ? "border-slate-700 text-slate-300" : "border-slate-100 text-[#64748B]"
                        }`}
                      >
                        <span className="font-mono">
                          {isUser ? "You" : `AI Mentor (${selectedLang})`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{message.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className="hover:text-[#0F172A] cursor-pointer"
                              title="Copy response"
                            >
                              {copiedMessageId === message.id ? (
                                <span className="text-emerald-600 font-bold">✓ Copied</span>
                              ) : (
                                <CopyIcon className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {isUser ? (
                        <div>
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {message.content}
                          </p>
                          {message.attachedCodeLength > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-slate-700/80 flex items-center gap-1.5 text-[10px] font-mono text-[#FDE047]">
                              <span>📎</span>
                              <span>Attached current editor code ({message.attachedCodeLength} chars)</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <FormattedMessage content={message.content} language={selectedLang} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isSubmittingPrompt && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl border-2 border-[#0F172A] bg-[#DBEAFE] text-[#1D4ED8] shadow-[2px_2px_0px_#0F172A] flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                    🤖
                  </div>
                  <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[2px_2px_0px_#0F172A] p-3 flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs font-bold text-[#475569] font-mono">
                      Evaluating prompt & editor code...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts Pills */}
            {messages.length <= 3 && (
              <div className="px-3 py-2 bg-[#FAF9F0] border-t-2 border-[#0F172A]/10">
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>⚡</span> Suggested questions:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(prompt.query, prompt.mode)}
                      disabled={isSubmittingPrompt}
                      className="p-2 rounded-xl bg-white hover:bg-[#FEF9C3] border-2 border-[#0F172A] shadow-[2px_2px_0px_#0F172A] text-left transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#0F172A] truncate">
                        <span>{prompt.icon}</span>
                        <span className="truncate">{prompt.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input & Submit Prompt Button */}
            <div className="p-3 bg-white border-t-2 border-[#0F172A]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex flex-col gap-2"
              >
                <div className="relative rounded-2xl border-2 border-[#0F172A] bg-[#FAF9F0] shadow-[2px_2px_0px_#0F172A] focus-within:border-[#1D4ED8] focus-within:shadow-[3px_3px_0px_#1D4ED8] transition-all">
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask AI a question or request hints on your code...`}
                    rows={2}
                    disabled={isSubmittingPrompt}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] resize-none focus:outline-none font-medium"
                  />
                  <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="font-mono bg-[#DBEAFE] text-[#1D4ED8] px-1.5 py-0.5 rounded border border-[#93C5FD]">
                      📎 Code Attached: {lineCount} lines ({selectedLang})
                    </span>
                    <span className="text-slate-400">Shift+Enter for newline</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#475569] font-medium">
                    Hits: <code className="font-mono text-[#1D4ED8]">{DUMMY_AI_CHAT_URL}</code>
                  </span>

                  {/* Submit Prompt Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingPrompt || !promptInput.trim()}
                    className={`px-5 py-2 rounded-xl border-2 border-[#0F172A] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSubmittingPrompt || !promptInput.trim()
                        ? "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                        : "bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] shadow-[3px_3px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px]"
                    }`}
                  >
                    <span>Send Prompt + Code</span>
                    <SendIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ──────────────────────────────────────────
              RIGHT SECTION: CODE EDITOR / IDE
              Submitting sends CODE ONLY via Axios
              ────────────────────────────────────────── */}
          <section className="bg-[#0F172A] text-white border-2 border-[#0F172A] rounded-3xl shadow-[5px_5px_0px_#0F172A] overflow-hidden flex flex-col h-[740px]">
            {/* Editor Top Bar */}
            <div className="px-4 py-3 bg-[#1E293B] border-b-2 border-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                </div>
                <div className="ml-2 px-2.5 py-0.5 rounded-md bg-[#0F172A] border border-slate-700 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                  <CodeBracketIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{FILE_EXTENSIONS[selectedLang]}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {lineCount} lines
                </span>
              </div>

              {/* Editor Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset code to default boilerplate"
                >
                  <RefreshIcon className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {editorCopied ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="flex-1 flex overflow-hidden relative bg-[#0F172A]">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="w-12 py-3 bg-[#0B1120] text-slate-500 font-mono text-xs select-none text-right pr-2.5 overflow-hidden border-r border-slate-800 leading-[1.6]"
              >
                {lineNumbers.map((num) => (
                  <div key={num} className="h-[21px]">
                    {num}
                  </div>
                ))}
              </div>

              {/* Actual Code Textarea */}
              <textarea
                ref={codeTextareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleCodeScroll}
                spellCheck="false"
                className="flex-1 py-3 px-3 bg-transparent text-[#F8FAFC] font-mono text-xs sm:text-sm leading-[1.6] resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-[#38BDF8]/30"
                placeholder={`Write or paste your ${selectedLang} code here...`}
              />
            </div>

            {/* Console / Output Drawer */}
            {showConsole && codeSubmitResult && (
              <div className="border-t-2 border-slate-800 bg-[#0B1120] p-3 text-xs font-mono max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <TerminalIcon className="w-3.5 h-3.5 text-[#FFDF2B]" />
                    <span className="font-bold text-slate-200">Execution Server Response</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                      HTTP 200 OK
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{codeSubmitResult.timestamp}</span>
                </div>
                <p className="text-emerald-400 font-bold">{codeSubmitResult.message}</p>
                {codeSubmitResult.data?.results && (
                  <div className="mt-1 text-[11px] text-slate-300 space-y-0.5">
                    <p>Status: <span className="text-[#38BDF8] font-bold">{codeSubmitResult.data.results.status}</span> | Runtime: {codeSubmitResult.data.results.runtime} | Memory: {codeSubmitResult.data.results.memory}</p>
                    <pre className="mt-1 p-2 bg-[#020617] rounded text-slate-300 overflow-x-auto text-[11px]">
                      {codeSubmitResult.data.results.consoleOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Bar: SUBMIT CODE BUTTON (Sends CODE ONLY) */}
            <div className="p-3 bg-[#1E293B] border-t-2 border-[#0F172A] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConsole(!showConsole)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>{showConsole ? "Hide Output" : "View Output"}</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  URL: <code className="text-[#38BDF8]">{DUMMY_CODE_SUBMIT_URL}</code>
                </span>
              </div>

              {/* Submit Code Button (hits DUMMY_CODE_SUBMIT_URL) */}
              <button
                onClick={handleSubmitCode}
                disabled={isSubmittingCode || !code.trim()}
                className={`px-5 py-2 rounded-xl border-2 border-[#0F172A] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSubmittingCode || !code.trim()
                    ? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                    : "bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] shadow-[3px_3px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
              >
                {isSubmittingCode ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-[#0F172A] border-t-transparent animate-spin" />
                    <span>Submitting Code...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-3.5 h-3.5" />
                    <span>Submit Code</span>
                  </>
                )}
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* ── Clear Chat Modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-2 border-[#0F172A] rounded-2xl shadow-[6px_6px_0px_#0F172A] max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] border-2 border-[#0F172A] flex items-center justify-center text-[#EF4444]">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F172A]">Clear Conversation?</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  This will reset your conversation context with the AI Tutor.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border-2 border-[#0F172A] bg-white hover:bg-slate-50 font-bold text-xs text-[#0F172A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearChat}
                className="px-4 py-2 rounded-xl border-2 border-[#0F172A] bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-[2px_2px_0px_#0F172A] hover:shadow-[1px_1px_0px_#0F172A] transition-all cursor-pointer"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
