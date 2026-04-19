// Generates a personalized cold outreach message via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  professional: {
    full_name: string;
    role: string;
    company: string;
    field: string;
    bio?: string | null;
  };
  student: {
    full_name?: string | null;
    college?: string | null;
    major?: string | null;
    grad_year?: string | null;
  };
  goal?: string | null;
  variation?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = (await req.json()) as RequestBody;
    if (!body?.professional?.full_name || !body?.professional?.company) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const studentBlurb = [
      body.student.full_name && `Name: ${body.student.full_name}`,
      body.student.college && `College: ${body.student.college}`,
      body.student.major && `Major: ${body.student.major}`,
      body.student.grad_year && `Class of ${body.student.grad_year}`,
    ]
      .filter(Boolean)
      .join("\n") || "(student has not filled out their profile yet)";

    const variantHint = body.variation
      ? `Use a slightly different angle than before (variation #${body.variation}).`
      : "";

    const systemPrompt = `You are a career coach helping a college student write short, warm, specific cold outreach messages to professionals on LinkedIn.

Rules:
- Maximum 110 words.
- Friendly, genuine, never sycophantic. No "I hope this finds you well".
- Reference one concrete thing about the recipient's role/company.
- End with a soft, low-pressure ask (15-min chat, quick question, advice).
- No emojis unless the recipient's bio uses them. No markdown.
- Sign off with the student's first name (or "[Your name]" if missing).

Return JSON via the tool call.`;

    const userPrompt = `RECIPIENT
Name: ${body.professional.full_name}
Role: ${body.professional.role} at ${body.professional.company}
Field: ${body.professional.field}
Bio: ${body.professional.bio ?? "(no bio)"}

STUDENT
${studentBlurb}

GOAL
${body.goal ?? "Learn about their career path and get advice on breaking into the field."}

${variantHint}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "draft_message",
              description: "Return the drafted outreach message.",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Short, specific subject line under 8 words." },
                  body: { type: "string", description: "The message body, under 110 words." },
                },
                required: ["subject", "body"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "draft_message" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : null;
    if (!args?.body) {
      return new Response(JSON.stringify({ error: "No draft returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ subject: args.subject, body: args.body }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-outreach error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
