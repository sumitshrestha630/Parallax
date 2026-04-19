/**
 * HTTP client for the FastAPI backend.
 * All requests go to /api/* and are proxied to localhost:8000 in dev
 * (configured in vite.config.ts).
 */

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---------- types ----------

export type SearchInput = { role?: string; company?: string; field?: string; limit?: number };

export type ProfessionalResult = {
  full_name: string;
  role: string;
  company: string;
  field: string;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  avatar_seed: string | null;
};

export type DraftResult = { subject: string; body: string; error?: string };

// ---------- endpoints ----------

export async function searchProfessionalsAPI(input: SearchInput): Promise<ProfessionalResult[]> {
  const data = await request<{ professionals: ProfessionalResult[] }>(
    "/professionals/search",
    { method: "POST", body: JSON.stringify(input) },
  );
  return data.professionals;
}

export async function draftOutreachAPI(payload: {
  professional: Record<string, unknown>;
  student: Record<string, unknown>;
  goal?: string;
  variation?: number;
}): Promise<DraftResult> {
  return request<DraftResult>("/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
