import { useState, type ReactNode } from "react";
import { Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import SiteNavbar from "../layout/site-navbar";
import junoBot from "../../assets/juno.png";

// function SectionHeading({ children }: { children: ReactNode }) {
//   return <h2 className="text-white/80 font-semibold text-sm">{children}</h2>;
// }

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/5 border border-white/12 p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white/60">
      <path
        fill="currentColor"
        d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
      <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "assistant" | "user";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`flex items-end gap-4 ${
        isUser ? "justify-end flex-row-reverse" : "justify-start"
      }`}>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-[#2b5bd9]/30 border border-[#2b5bd9]/50"
            : "bg-white/10 border border-white/20"
        }`}>
        {isUser ? (
          <User className="size-5 text-[#2b5bd9]" />
        ) : (
          <Bot className="size-5 text-white/80" />
        )}
      </div>

      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
          isUser
            ? "bg-[#2b5bd9] text-white"
            : "bg-white/8 border border-white/12 text-white/90"
        }`}>
        {children}
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="h-full flex flex-col">
      <Card className="relative flex-1 space-y-5 p-6 overflow-y-auto bg-[#0e1830] border-white/10">
        <ChatBubble role="assistant">
          Hi Sarah, how can I help you improve your resume today?
        </ChatBubble>
        <ChatBubble role="user">
          Can you make my summary more professional?
        </ChatBubble>
      </Card>

      <div className="mt-3 bg-[#0e1830] border border-white/10 rounded-2xl flex items-center p-3">
        <input
          className="flex-1 bg-transparent outline-none text-white/90 placeholder:text-white/50 text-sm px-2"
          placeholder="Type your message..."
        />
        <button className="size-8 rounded-md bg-[#2b5bd9] flex items-center justify-center">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function ExamplePromptDropdown() {
  const [open, setOpen] = useState(false);
  const prompts = [
    "Make my summary more professional",
    "Improve my work experience descriptions",
    "Suggest skills for my industry",
    "Write a strong career objective",
    "Optimize my resume for ATS",
    "Improve my formatting and structure",
    "Create a cover letter for my resume",
    "Enhance my achievements with metrics",
  ];

  return (
    <div className="mt-6 relative">
      <div
        className="relative z-10 flex items-center justify-between cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">View Example Prompts</span>
        {open ? (
          <ChevronUp className="size-4 text-white/70" />
        ) : (
          <ChevronDown className="size-4 text-white/70" />
        )}
      </div>
      <img
        src={junoBot}
        alt="Juno Bot"
        className="absolute right-170 -top-25 w-26 h-26 object-contain hidden md:block pointer-events-none z-0"
        style={{ filter: "drop-shadow(0px 10px 18px rgba(0,0,0,0.45))" }}
      />

      {open && (
        <div className="absolute left-0 top-full mt-2 w-full p-4 border border-white/10 bg-[#101a33] rounded-xl space-y-3 shadow-lg animate-fadeIn z-30">
          <p className="text-xs text-white/50 mb-2">
            Try one of these prompts:
          </p>
          <div className="flex flex-wrap gap-3">
            {prompts.map((p) => (
              <button
                key={p}
                className="h-9 px-4 rounded-full text-xs font-medium bg-white/5 text-white/80 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-200">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIChatModal() {
  return (
    <div className="h-svh bg-[var(--app-bg)] text-white overflow-hidden relative">
      <SiteNavbar />

      <main className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-56px)] overflow-visible relative">
        {/* Bot graphic moved into prompts area to avoid overlapping heading */}
        {/* Left Column */}
        <div className="lg:col-span-2 h-full min-h-0 flex flex-col relative z-20">
          {/* ✅ Heading block creates new stacking context */}
          <div className="relative z-20 inline-block bg-[var(--app-bg)]">
            <h1 className="relative text-4xl md:text-4xl font-extrabold tracking-tight leading-tight text-white z-20 bg-[var(--app-bg)] px-2 py-1">
              Juno AI Assistant
            </h1>
          </div>

          <p className="text-white/60 mt-1 relative z-20 bg-[var(--app-bg)] inline-block px-2">
            Get instant feedback and suggestions to improve your resume.
          </p>

          <ExamplePromptDropdown />

          <div className="mt-8 flex-1 grid grid-rows-[auto_1fr] min-h-0 relative z-20">
            <Card className="relative min-h-[260px] h-full flex flex-col pb-20">
              <div className="flex items-center justify-end">
                <button className="h-8 w-8 rounded-md bg-white/6 border border-white/12 flex items-center justify-center">
                  <CopyIcon />
                </button>
              </div>
              <div className="flex-1 text-white/50 text-sm flex items-center px-3">
                AI suggestions will appear here...
              </div>
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4">
                <button className="h-12 px-5 rounded-xl bg-[#2b5bd9] text-white text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(43,91,217,0.35)] w-full">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="text-white">
                    <path
                      fill="currentColor"
                      d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"
                    />
                  </svg>
                  Apply to Resume
                </button>
                <button className="h-12 px-5 rounded-xl bg-white/6 border border-white/12 text-white text-sm w-full">
                  Generate New
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="h-full">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
