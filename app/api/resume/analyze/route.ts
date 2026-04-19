import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResumeWithAI } from "@/lib/ai/resume-analyzer";
import type { TargetRole } from "@/types/resume";

export const dynamic = "force-dynamic";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Use internal module directly — pdf-parse's index.js reads a test file on import which
  // throws ENOENT in Next.js. The lib file is the actual parser with no side-effects.
  /* eslint-disable */
  const pdfParse = (require as any)("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;
  /* eslint-enable */
  const result = await pdfParse(buffer);
  if (!result.text?.trim()) throw new Error("PDF appears to be empty or image-only (no extractable text).");
  return result.text;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let resumeText = "";
  let targetRole: TargetRole = "software_engineer";

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const roleRaw = form.get("targetRole") as string | null;
    const pastedText = form.get("resumeText") as string | null;

    targetRole = (roleRaw ?? "software_engineer") as TargetRole;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      try {
        resumeText = await extractTextFromPdf(buffer);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown PDF error";
        console.error("[resume/pdf]", msg);
        return NextResponse.json({ error: `Failed to parse PDF: ${msg}` }, { status: 400 });
      }
    } else if (pastedText) {
      resumeText = pastedText;
    }
  } else {
    const body = await req.json() as { resumeText?: string; targetRole?: string };
    resumeText = body.resumeText ?? "";
    targetRole = (body.targetRole ?? "software_engineer") as TargetRole;
  }

  if (!resumeText.trim() || resumeText.trim().length < 50) {
    return NextResponse.json({ error: "Resume text is too short. Please provide a full resume." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI provider not configured. Set OPENAI_API_KEY in .env.local." }, { status: 500 });
  }

  try {
    const result = await analyzeResumeWithAI(resumeText, targetRole);

    // Persist analysis (fire-and-forget, non-blocking)
    void supabase.from("resume_analyses").insert({
      user_id: user.id,
      target_role: targetRole,
      score: result.score,
      result,
    }).then();

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    console.error("[resume/analyze]", msg);
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 });
  }
}
