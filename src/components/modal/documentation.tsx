function SidebarLink({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`relative block px-3 py-2 rounded-md text-sm transition-colors border ${
        active
          ? "text-white bg-white/5 border-white/15 pl-4 border-l-2 border-l-[#2b5bd9]"
          : "text-white/80 hover:text-white border-transparent hover:bg-white/5"
      }`}
    >
      {label}
    </a>
  );
}

function SearchBar() {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
      <input
        placeholder="Search documentation..."
        className="w-full h-11 rounded-full bg-transparent border border-white/12 pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25"
      />
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  const copy = () => navigator.clipboard.writeText(code);
  return (
    <div className="rounded-xl bg-[#0f162a] border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 text-xs text-white/70">
        <span>{title}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 rounded-lg bg-white/8 border border-white/12 px-3 py-1 text-white/80 hover:text-white">
          <span className="text-xs">📋</span> Copy
        </button>
      </div>
      <pre className="px-4 py-3 text-sm text-white/90 overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}

export default function DocumentationScreen() {
  const python = `def hello_world():\n    print("Hello, World!")`;
  const js = `function greet(name) {\n  console.log('Hello, ${name}!');\n}`;

  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white grid grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="bg-[#0f162a] border-r border-white/10 p-4">
        <div className="text-white/80 text-xs">Docs <span className="text-white/50">v1.0.0</span></div>
        <nav className="mt-4 space-y-1">
          <SidebarLink label="Getting Started" active />
          <SidebarLink label="AI Resume Builder" />
          <SidebarLink label="AI Tailoring" />
          <SidebarLink label="Integrations" />
          <SidebarLink label="Troubleshooting" />
        </nav>
      </aside>

      {/* Main */}
      <main className="px-8 py-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-center">Resume Builder Documentation</h1>
        <p className="text-white/70 text-center mt-2">Your guide to creating the perfect resume with AI.</p>
        <div className="max-w-[960px] mx-auto mt-8">
          <SearchBar />

          {/* Introduction */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-white/70 mt-2">
              Resume Builder is an AI-powered tool designed to help you create professional resumes quickly and easily. Our platform leverages advanced AI algorithms to generate tailored resumes that highlight your skills and experience, ensuring you stand out to potential employers.
            </p>
          </section>

          {/* Getting Started */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Getting Started</h2>
            <p className="text-white/70 mt-2">
              To begin, sign up for a free account on our website. Once registered, you can start building your resume by entering your personal information, work history, education, and skills. Our AI will then analyze your input and generate a customized resume tailored to your career goals.
            </p>
          </section>

          {/* Code Snippets */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Code Snippets</h2>
            <p className="text-white/70 mt-2">Here are some code snippets that might be helpful. Use the <span className="px-1 rounded bg-white/8 border border-white/12 text-white/80">Copy</span> button to get the code.</p>
            <div className="mt-4 space-y-4">
              <CodeBlock title="Python Example" code={python} />
              <CodeBlock title="JavaScript Example" code={js} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}