import Link from "next/link";
import QuizShell from "@/components/QuizShell";

export default function ReviewNotFound() {
  return (
    <QuizShell>
      <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold text-text-primary">Quiz not found</h1>
        <p className="text-text-secondary mt-2 mb-6">
          This quiz doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-all duration-150"
        >
          Back to Home
        </Link>
      </div>
    </QuizShell>
  );
}
