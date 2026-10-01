from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from app.database import Base, engine
from app.routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FitBuddy",
    description="AI-Powered Personalized 7-Day Workout & Nutrition Planner with Gemini",
    version="1.0.0"
)

os.makedirs("app/static/images", exist_ok=True)
if os.path.exists("app/static"):
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
