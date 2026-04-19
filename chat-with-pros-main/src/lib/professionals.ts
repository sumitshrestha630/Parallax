import type { Professional } from "@/lib/types";

export type SearchInput = {
  role?: string;
  company?: string;
  field?: string;
  student?: {
    college?: string | null;
    major?: string | null;
    grad_year?: string | null;
  };
};

export async function searchProfessionals(input: SearchInput): Promise<Professional[]> {
  const res = await fetch(`/api/professionals/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: input.role ?? "",
      company: input.company ?? "",
      field: input.field ?? "",
      student: {
        college: input.student?.college ?? "",
        major: input.student?.major ?? "",
        grad_year: input.student?.grad_year ?? "",
      },
    }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return (data.professionals ?? []) as Professional[];
}
