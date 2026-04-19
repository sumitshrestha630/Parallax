import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a career coach helping a college student write short, warm, specific cold outreach messages to professionals on LinkedIn.

Rules:
- Maximum 110 words.
- Friendly, genuine, never sycophantic. No "I hope this finds you well".
- Reference one concrete thing about the recipient's role/company.
- End with a soft, low-pressure ask (15-min chat, quick question, advice).
- No emojis unless the recipient's bio uses them. No markdown.
- Sign off with the student's first name (or "[Your name]" if missing).

Return JSON with keys: subject (string, under 8 words) and body (string, under 110 words).`;

function buildPrompt(
  professional: Record<string, string | null | undefined>,
  student: Record<string, string | null | undefined>,
  goal: string,
  variation: number,
): string {
  const studentBlurb = [
    student.full_name  && `Name: ${student.full_name}`,
    student.college    && `College: ${student.college}`,
    student.major      && `Major: ${student.major}`,
    student.grad_year  && `Class of ${student.grad_year}`,
  ].filter(Boolean).join("\n") || "(student has not filled out their profile yet)";

  const variantHint = variation > 0
    ? `Use a slightly different angle than before (variation #${variation}).`
    : "";

  return `RECIPIENT
Name: ${professional.full_name ?? ""}
Role: ${professional.role ?? ""} at ${professional.company ?? ""}
Field: ${professional.field ?? ""}
Bio: ${professional.bio ?? "(no bio)"}

STUDENT
${studentBlurb}

GOAL
${goal || "Learn about their career path and get advice on breaking into the field."}

${variantHint}`.trim();
}

function fallbackDraft(
  professional: Record<string, string | null | undefined>,
  student: Record<string, string | null | undefined>,
) {
  const name    = professional.full_name ?? "there";
  const first   = ((student.full_name ?? "[Your name]") as string).split(" ")[0];
  const company = professional.company ?? "your company";
  const role    = professional.role    ?? "your work";
  return {
    subject: "Quick question from a student",
    body: `Hi ${name},\n\nI came across your profile and was really impressed by your experience as ${role} at ${company}. I'm a student exploring this field and would love to hear about your path and any advice you'd share. Would you be open to a quick 15-minute chat?\n\nThanks so much,\n${first}`,
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    professional: Record<string, string | null | undefined>;
    student:      Record<string, string | null | undefined>;
    goal?:        string;
    variation?:   number;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackDraft(body.professional, body.student));
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildPrompt(body.professional, body.student, body.goal ?? "", body.variation ?? 0) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const payload = JSON.parse(completion.choices[0].message.content ?? "{}") as { subject?: string; body?: string };
    if (!payload.body) return NextResponse.json({ error: "No draft returned" }, { status: 500 });
    return NextResponse.json({ subject: payload.subject ?? "", body: payload.body });
  } catch {
    return NextResponse.json(fallbackDraft(body.professional, body.student));
  }
}
