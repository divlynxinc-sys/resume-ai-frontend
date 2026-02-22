import SiteNavbar from "../layout/site-navbar";


function ArtBoard() {
  return (
    <div className="mx-auto w-[300px]">
      <div className="rounded-xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
        <div className="relative rounded-md bg-[#efe6dc] h-[230px] overflow-hidden">
          {/* decorative shapes */}
          <div className="absolute left-14 top-14 w-28 h-28 rounded-[40%] rotate-12 bg-[#e0b197]" />
          <div className="absolute right-12 bottom-12 w-28 h-28 rounded-[40%] -rotate-12 bg-[#d69d85]" />
          {/* centered text */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tracking-tight text-[#7b5a4a]">404</span>
            <span className="mt-1 text-sm font-medium tracking-wide text-[#7b5a4a]">ERROR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-svh bg-[var(--app-bg)] text-white">
      <SiteNavbar />
      <main className="px-4">
        <div className="mt-6">
          <ArtBoard />
        </div>
        <div className="text-center mt-6">
          <h1 className="text-3xl font-semibold">Page Not Found</h1>
          <p className="text-white/70 mt-2 max-w-xl mx-auto">
            The page you are looking for does not exist or has been moved. Please check the URL, or return to the homepage.
          </p>
          <button className="mt-4 rounded-full bg-[oklch(0.488_0.243_264.376)] px-5 py-2.5 text-white shadow-md shadow-[oklch(0.488_0.243_264.376)/30]">
            Go to Homepage
          </button>
        </div>
      </main>
    </div>
  );
}