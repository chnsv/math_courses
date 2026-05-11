from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import test_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_router.router, prefix="/api/v1/test", tags=["Test"])

@app.get("/")
def root():
    return {"message": "ok"}