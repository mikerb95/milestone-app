export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-2 flex min-h-screen items-center justify-center px-4 py-6">
      <div
        className="flex w-full max-w-[420px] flex-col gap-4"
        style={{ animation: "var(--animate-ms-fade-up)" }}
      >
        {children}
      </div>
    </div>
  );
}
