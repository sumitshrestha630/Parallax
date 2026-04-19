"""
Generate a personalized cold outreach message via OpenAI.

Falls back to a template when OPENAI_API_KEY is not configured.
"""
import os
import openai

SYSTEM_PROMPT = """\
You are a career coach helping a college student write short, warm, specific cold outreach messages to professionals on LinkedIn.

Rules:
- Maximum 110 words.
- Friendly, genuine, never sycophantic. No "I hope this finds you well".
- Reference one concrete thing about the recipient's role/company.
- End with a soft, low-pressure ask (15-min chat, quick question, advice).
- No emojis unless the recipient's bio uses them. No markdown.
- Sign off with the student's first name (or "[Your name]" if missing).

Return JSON with keys: subject (string, under 8 words) and body (string, under 110 words).\
"""


def _build_user_prompt(professional: dict, student: dict, goal: str, variation: int) -> str:
    student_blurb = "\n".join(filter(None, [
        student.get("full_name") and f"Name: {student['full_name']}",
        student.get("college") and f"College: {student['college']}",
        student.get("major") and f"Major: {student['major']}",
        student.get("grad_year") and f"Class of {student['grad_year']}",
    ])) or "(student has not filled out their profile yet)"

    variant_hint = f"Use a slightly different angle than before (variation #{variation})." if variation else ""

    return f"""\
RECIPIENT
Name: {professional.get('full_name', '')}
Role: {professional.get('role', '')} at {professional.get('company', '')}
Field: {professional.get('field', '')}
Bio: {professional.get('bio') or '(no bio)'}

STUDENT
{student_blurb}

GOAL
{goal or 'Learn about their career path and get advice on breaking into the field.'}

{variant_hint}""".strip()


async def draft_outreach(professional: dict, student: dict, goal: str = "", variation: int = 0) -> dict:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your_openai_key_here":
        return _fallback_draft(professional, student)

    client = openai.AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(professional, student, goal, variation)},
        ],
        response_format={"type": "json_object"},
        temperature=0.8,
    )
    import json
    payload = json.loads(response.choices[0].message.content or "{}")
    if not payload.get("body"):
        return {"error": "No draft returned"}
    return {"subject": payload.get("subject", ""), "body": payload["body"]}


def _fallback_draft(professional: dict, student: dict) -> dict:
    name = professional.get("full_name", "there")
    first = (student.get("full_name") or "[Your name]").split()[0]
    company = professional.get("company", "your company")
    role = professional.get("role", "your work")
    return {
        "subject": f"Quick question from a student",
        "body": (
            f"Hi {name},\n\n"
            f"I came across your profile and was really impressed by your experience as {role} at {company}. "
            f"I'm a student exploring this field and would love to hear about your path and any advice you'd share. "
            f"Would you be open to a quick 15-minute chat?\n\n"
            f"Thanks so much,\n{first}"
        ),
    }
