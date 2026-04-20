export function SimpleMarkdown({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className="space-y-4 text-sm leading-relaxed text-[var(--rp-muted)]">
      {blocks.map((block, idx) => {
        const b = block.trim();
        if (b.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-lg font-semibold tracking-tight text-[var(--rp-fg)]"
            >
              {b.slice(3)}
            </h2>
          );
        }
        if (b.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[var(--rp-primary)]/60 bg-white/5 px-4 py-3 text-[var(--rp-fg)]"
            >
              {b
                .split("\n")
                .map((l) => l.replace(/^>\s?/, ""))
                .join(" ")}
            </blockquote>
          );
        }
        if (b.includes("\n- ")) {
          const [head, ...rest] = b.split("\n- ");
          return (
            <div key={idx} className="space-y-2">
              {head ? <p className="text-[var(--rp-fg)]">{head}</p> : null}
              <ul className="list-disc space-y-1 pl-5">
                {rest.map((li, j) => (
                  <li key={j}>{li.trim()}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={idx} className="text-[var(--rp-muted)]">
            {b}
          </p>
        );
      })}
    </div>
  );
}
