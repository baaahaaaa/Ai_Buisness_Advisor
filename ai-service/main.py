from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.orchestrator import router as orchestrator_router


app = FastAPI(
    title="AI Business Advisor - Agents Service",
    description="Service Python multi-agents pour assurance automobile",
    version="2.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    orchestrator_router,
    prefix="/api"
)



@app.get("/")
def root():

    return {
        "status": "AI Service is running",
        "agents": 10,
        "version": "2.0"
    }



@app.get("/health")
def health():

    return {
        "status": "healthy"
    }