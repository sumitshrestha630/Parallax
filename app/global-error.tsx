"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#080e1a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "32px" }}>
          <p style={{ fontSize: 32, marginBottom: 16 }}>⚠️</p>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: "#fbbf24", marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
            {error.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              background: "#6ED640",
              border: "3px solid #3A9018",
              color: "#0a1a06",
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
