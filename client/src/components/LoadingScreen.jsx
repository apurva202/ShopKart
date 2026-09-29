const LoadingScreen = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center font-sans select-none"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full border-[3px] border-amber-200/70 border-t-[#B45309] animate-spin" />
          <div className="absolute w-13 h-13 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#B45309]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Shop<span className="text-[#B45309]">Kart</span>
        </h1>

        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-xs font-semibold uppercase tracking-[2.5px] text-stone-400">
            Loading
          </span>
          <span className="flex items-center gap-1 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-bounce" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
