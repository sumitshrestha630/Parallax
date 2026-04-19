from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.serpapi_service import search_professionals
from services.ranking_service import rank_professionals
from services.draft_service import draft_outreach

load_dotenv()

app = FastAPI(title="Chat with Pros API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- health ----------

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------- professionals search ----------

class StudentContext(BaseModel):
    college: str = ""
    major: str = ""
    grad_year: str = ""


class SearchRequest(BaseModel):
    role: str = ""
    company: str = ""
    field: str = ""
    limit: int = 20
    student: StudentContext = StudentContext()


@app.post("/api/professionals/search")
async def professionals_search(req: SearchRequest):
    raw = await search_professionals(role=req.role, company=req.company, field=req.field)
    ranked = rank_professionals(
        raw,
        role=req.role,
        field=req.field,
        company=req.company,
        student=req.student.model_dump(),
    )
    return {"professionals": ranked[: req.limit]}


# ---------- message drafting ----------

class DraftRequest(BaseModel):
    professional: dict
    student: dict
    goal: str = ""
    variation: int = 0


@app.post("/api/draft")
async def draft(req: DraftRequest):
    result = await draft_outreach(
        professional=req.professional,
        student=req.student,
        goal=req.goal,
        variation=req.variation,
    )
    return result
