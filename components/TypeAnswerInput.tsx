"use client";

interface TypeAnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  example?: string;
}

export default function TypeAnswerInput({ value, onChange, onSubmit, example }: TypeAnswerInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim().length > 0) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {example && (
        <div className="px-4 py-3 bg-bg-secondary rounded-xl border border-border">
          <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">
            Example format
          </span>
          <code className="text-sm font-mono text-accent">{example}</code>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full px-5 py-4 bg-bg-secondary border-2 border-border rounded-2xl text-text-primary font-mono text-base placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-bg-tertiary transition-all duration-150"
        />
      </div>
    </div>
  );
}
