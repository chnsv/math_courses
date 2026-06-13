from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, topics, tasks, stats, admin, sympy, users, courses, teacher
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Math Courses API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:8083", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Аутентификация"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Пользователи"])
app.include_router(topics.router, prefix="/api/v1/topics", tags=["Учебный контент"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Задачи"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Статистика"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Администрирование"])
app.include_router(sympy.router, prefix="/api/v1/sympy", tags=["SymPy"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(teacher.router, prefix="/api/v1/teacher", tags=["Teacher"])

@app.get("/")
def root():
    return {"message": "Math Courses API is running", "docs": "/docs", "version": "1.0.0"}