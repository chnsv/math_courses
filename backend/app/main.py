from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, topics, tasks, stats, admin, sympy, users, courses, teacher
from .database import engine, Base

# Создание таблиц
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Math Courses API", version="1.0.0")

# НАСТРОЙКА CORS — РАЗРЕШАЕМ ВСЁ ДЛЯ РАЗРАБОТКИ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Подключение роутеров
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