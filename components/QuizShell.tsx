import StorageWarning from "@/components/StorageWarning";

interface QuizShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function QuizShell({ children, header }: QuizShellProps) {
  return (
    <div className="min-h-dvh flex flex-col">
      {header && (
        <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-lg border-b border-border px-4 py-3">
          {header}
        </header>
      )}
      <StorageWarning />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
