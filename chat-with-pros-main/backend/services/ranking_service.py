"""
Rank professionals by networking value for a student.

Scoring weights (max ~22 points):
  +5  exact role match in parsed role field
  +3  role keyword appears anywhere in bio
  +4  field match in field or bio
  +4  shared school mention in bio
  +3  company match
  +2  has a full name (first + last)
  +1  has a bio (approachability signal)
  +2  approachability keywords in bio (mentor, chat, happy, advice, dm, open)
  -1  bio missing (harder to personalise message)

Labels:
  18+  -> Best Match
  13+  -> High Response Chance
   8+  -> Strong Fit
   <8  -> Good Backup
"""

import re

_APPROACHABLE = re.compile(
    r"\b(mentor|mentoring|chat|happy to|open to|dm me|advice|coffee|love to|reach out)\b",
    re.IGNORECASE,
)


def _score(pro: dict, role: str, field: str, company: str, student: dict) -> tuple[int, str]:
    s = 0
    reasons: list[str] = []

    bio = (pro.get("bio") or "").lower()
    pro_role = (pro.get("role") or "").lower()
    pro_field = (pro.get("field") or "").lower()
    pro_company = (pro.get("company") or "").lower()

    # --- name completeness ---
    if pro.get("full_name") and " " in pro["full_name"]:
        s += 2

    # --- bio presence ---
    if bio:
        s += 1
    else:
        s -= 1

    # --- role match ---
    if role:
        role_l = role.lower()
        if role_l in pro_role:
            s += 5
            reasons.append("strong role match")
        elif role_l in bio:
            s += 3
            reasons.append("role mentioned in profile")

    # --- field match ---
    if field:
        field_l = field.lower()
        if field_l in pro_field or field_l in bio:
            s += 4
            reasons.append("field alignment")

    # --- company match ---
    if company:
        company_l = company.lower()
        if company_l in pro_company:
            s += 3
            reasons.append("target company match")

    # --- shared school ---
    college = (student.get("college") or "").lower()
    if college and len(college) > 3 and college in bio:
        s += 4
        reasons.append("shared school background")

    # --- approachability ---
    if bio and _APPROACHABLE.search(bio):
        s += 2
        reasons.append("likely approachable profile")

    # --- major / field alignment ---
    major = (student.get("major") or "").lower()
    if major and len(major) > 3:
        if major in bio or major in pro_field:
            s += 2
            reasons.append("major aligns with their work")

    return s, reasons


def _label(score: int) -> str:
    if score >= 18:
        return "Best Match"
    if score >= 13:
        return "High Response Chance"
    if score >= 8:
        return "Strong Fit"
    return "Good Backup"


def _reason_text(reasons: list[str], score: int) -> str:
    if not reasons:
        return "Relevant result worth considering"
    if len(reasons) == 1:
        return reasons[0].capitalize()
    return f"{reasons[0].capitalize()} and {reasons[1]}"


def rank_professionals(
    professionals: list[dict],
    role: str = "",
    field: str = "",
    company: str = "",
    student: dict | None = None,
) -> list[dict]:
    student = student or {}
    scored = []
    for pro in professionals:
        score, reasons = _score(pro, role, field, company, student)
        pro["priority_score"] = score
        pro["priority_label"] = _label(score)
        pro["priority_reason"] = _reason_text(reasons, score)
        scored.append((score, pro))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored]
