"""
Search for professionals via SerpAPI (Google search, site:linkedin.com/in/).

Returns a list of dicts with the fields the frontend expects:
  full_name, role, company, field, location, bio, linkedin_url, avatar_seed
"""
import os
import re
from serpapi import GoogleSearch


def _build_query(role: str, company: str, field: str) -> str:
    parts = ["site:linkedin.com/in/"]
    if role:
        parts.append(role)
    if company:
        parts.append(company)
    if field:
        parts.append(field)
    if len(parts) == 1:
        parts.append("professional")
    return " ".join(parts)


def _parse_result(result: dict) -> dict:
    """Map a SerpAPI organic result to a professional dict."""
    title = result.get("title", "")
    snippet = result.get("snippet", "")
    link = result.get("link", "")

    # LinkedIn title format: "Name - Role at Company | LinkedIn"
    name, role, company = "", "", ""
    title_clean = re.sub(r"\s*\|\s*LinkedIn.*$", "", title).strip()
    if " - " in title_clean:
        parts = title_clean.split(" - ", 1)
        name = parts[0].strip()
        role_company = parts[1].strip()
        if " at " in role_company:
            rc = role_company.split(" at ", 1)
            role = rc[0].strip()
            company = rc[1].strip()
        else:
            role = role_company

    return {
        "full_name": name or title_clean,
        "role": role,
        "company": company,
        "field": "",          # enriched by caller or left blank
        "location": None,
        "bio": snippet or None,
        "linkedin_url": link or None,
        "avatar_seed": name.lower().replace(" ", "_") if name else None,
    }


async def search_professionals(role: str = "", company: str = "", field: str = "") -> list[dict]:
    api_key = os.getenv("SERPAPI_KEY", "")
    if not api_key or api_key == "your_serpapi_key_here":
        # Return empty list rather than crash when key is not configured yet
        return []

    params = {
        "engine": "google",
        "q": _build_query(role, company, field),
        "num": 30,
        "api_key": api_key,
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    organic = results.get("organic_results", [])

    professionals = []
    for r in organic:
        parsed = _parse_result(r)
        if parsed["full_name"]:  # skip results we couldn't parse
            if field:
                parsed["field"] = field
            elif role:
                parsed["field"] = role
            professionals.append(parsed)

    return professionals
