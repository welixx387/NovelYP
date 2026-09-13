// Анимированный "aurora"-фон: три размытых цветных пятна, медленно смещающихся
// по независимым траекториям (keyframes aurora-1/2/3 в tailwind.config.ts).
// Чистый CSS без JS/canvas — дёшево по производительности, не мешает скроллу.
export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden>
      <div
        className="aurora-blob left-[10%] top-[-10%] h-[36rem] w-[36rem] animate-aurora-1 bg-violet-500"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="aurora-blob right-[5%] top-[10%] h-[30rem] w-[30rem] animate-aurora-2 bg-cyan-400"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="aurora-blob bottom-[-15%] left-[30%] h-[32rem] w-[32rem] animate-aurora-3 bg-pink-400"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
