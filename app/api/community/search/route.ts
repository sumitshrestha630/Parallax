import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Professional } from "@/types/community";

const APPROACHABLE = /\b(mentor|mentoring|chat|happy to|open to|dm me|advice|coffee|love to|reach out)\b/i;

function score(
  pro: Professional,
  role: string,
  field: string,
  company: string,
  student: { college?: string | null; major?: string | null },
): { score: number; reasons: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const bio = (pro.bio ?? "").toLowerCase();
  const proRole = (pro.role ?? "").toLowerCase();
  const proField = (pro.field ?? "").toLowerCase();
  const proCompany = (pro.company ?? "").toLowerCase();

  if (pro.full_name.includes(" ")) s += 2;
  if (bio) { s += 1; } else { s -= 1; }

  if (role) {
    const r = role.toLowerCase();
    if (proRole.includes(r)) { s += 5; reasons.push("strong role match"); }
    else if (bio.includes(r)) { s += 3; reasons.push("role mentioned in profile"); }
  }
  if (field) {
    const f = field.toLowerCase();
    if (proField.includes(f) || bio.includes(f)) { s += 4; reasons.push("field alignment"); }
  }
  if (company) {
    const c = company.toLowerCase();
    if (proCompany.includes(c)) { s += 3; reasons.push("target company match"); }
  }
  const college = (student.college ?? "").toLowerCase();
  if (college.length > 3 && bio.includes(college)) { s += 4; reasons.push("shared school background"); }
  if (bio && APPROACHABLE.test(bio)) { s += 2; reasons.push("likely approachable profile"); }
  const major = (student.major ?? "").toLowerCase();
  if (major.length > 3 && (bio.includes(major) || proField.includes(major))) { s += 2; reasons.push("major aligns with their work"); }

  return { score: s, reasons };
}

function label(s: number) {
  if (s >= 18) return "Best Match";
  if (s >= 13) return "High Response Chance";
  if (s >= 8)  return "Strong Fit";
  return "Good Backup";
}

function reasonText(reasons: string[]): string {
  if (!reasons.length) return "Relevant result worth considering";
  if (reasons.length === 1) return reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1);
  return `${reasons[0].charAt(0).toUpperCase()}${reasons[0].slice(1)} and ${reasons[1]}`;
}

function parseLinkedInResult(r: Record<string, string>): Omit<Professional, "id" | "priority_score" | "priority_label" | "priority_reason"> | null {
  const title: string = r.title ?? "";
  const snippet: string = r.snippet ?? "";
  const link: string = r.link ?? "";

  const clean = title.replace(/\s*\|\s*LinkedIn.*$/i, "").trim();
  let name = "", role = "", company = "";

  if (clean.includes(" - ")) {
    const [n, rest] = clean.split(" - ", 2);
    name = n.trim();
    if (rest.includes(" at ")) {
      const [ro, co] = rest.split(" at ", 2);
      role = ro.trim(); company = co.trim();
    } else {
      role = rest.trim();
    }
  } else {
    name = clean;
  }

  if (!name) return null;
  return {
    full_name: name,
    role,
    company,
    field: "",
    location: null,
    bio: snippet || null,
    linkedin_url: link || null,
    avatar_seed: name.toLowerCase().replace(/\s+/g, "_"),
  };
}

async function fetchFromSerpApi(
  role: string,
  company: string,
  field: string,
): Promise<Omit<Professional, "id">[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  const parts = ["site:linkedin.com/in/"];
  if (role) parts.push(role);
  if (company) parts.push(company);
  if (field) parts.push(field);
  if (parts.length === 1) parts.push("professional");

  const params = new URLSearchParams({ engine: "google", q: parts.join(" "), num: "30", api_key: key });
  const res = await fetch(`https://serpapi.com/search?${params}`);
  if (!res.ok) return [];

  const data = await res.json() as { organic_results?: Record<string, string>[] };
  const organic = data.organic_results ?? [];

  return organic
    .map(parseLinkedInResult)
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({ ...p, field: field || role }));
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    role?: string; company?: string; field?: string;
    student?: { college?: string; major?: string; grad_year?: string };
  };
  const role = body.role ?? "";
  const company = body.company ?? "";
  const field = body.field ?? "";
  const student = body.student ?? {};

  // Fetch profile for student context
  const { data: profile } = await supabase
    .from("profiles")
    .select("college, major, grad_year")
    .eq("id", user.id)
    .maybeSingle();

  const ctx = {
    college: profile?.college ?? student.college ?? null,
    major:   profile?.major   ?? student.major   ?? null,
  };

  // Try DB first (seeded pros)
  const { data: dbPros } = await supabase
    .from("professionals")
    .select("*")
    .or(
      [
        role    ? `role.ilike.%${role}%`    : null,
        company ? `company.ilike.%${company}%` : null,
        field   ? `field.ilike.%${field}%`  : null,
      ].filter(Boolean).join(",") || "id.neq.00000000-0000-0000-0000-000000000000",
    )
    .limit(30);

  // Also search SerpAPI for fresh results
  const livePros = await fetchFromSerpApi(role, company, field);

  // Merge: DB pros as authoritative (have id), live pros without id
  const allPros: Professional[] = [
    ...(dbPros ?? []),
    ...livePros.filter((lp) =>
      !(dbPros ?? []).some((dp) => dp.linkedin_url && dp.linkedin_url === lp.linkedin_url),
    ).map((lp) => ({ id: "", ...lp })),
  ];

  // Rank
  const scored = allPros.map((pro) => {
    const { score: s, reasons } = score(pro, role, field, company, ctx);
    return { ...pro, priority_score: s, priority_label: label(s), priority_reason: reasonText(reasons) };
  });
  scored.sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  return NextResponse.json({ professionals: scored.slice(0, 20) });
}
