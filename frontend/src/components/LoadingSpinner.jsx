export default function LoadingSpinner({
  size = 40,
  label = "Loading...",
  center = true,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        center ? "min-h-[120px] w-full" : ""
      }`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full border-4 border-border"
          style={{ opacity: 0.25 }}
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent
                     dark:border-indigo-400 animate-spin"
        />
      </div>

      {label && (
        <p className="text-sm font-semibold text-foreground/70">{label}</p>
      )}
    </div>
  );
}
