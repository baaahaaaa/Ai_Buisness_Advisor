from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.orchestrator import router as orchestrator_router


app = FastAPI(
    title="AI Business Advisor",
    description="Multi-agent AI decision support system for automotive insurance",
    version="2.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:4200",
        "http://localhost:80",
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


app.include_router(
    orchestrator_router,
    prefix="/api",
)


@app.get("/")
def root():
    return {
        "status": "AI Business Advisor API is running",
        "service": "multi-agent-ai",
        "version": "2.1.0",
        "agents": 9,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-service",
    }