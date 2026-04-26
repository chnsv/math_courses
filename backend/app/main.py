from fastapi import FastAPI
from .routers import auth

app = FastAPI(title="Math Courses API", version="1.0.0")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "Math Courses API is running", "status": "ok"}