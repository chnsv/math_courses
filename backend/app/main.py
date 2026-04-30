from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, topics, tasks, stats, admin, sympy
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Math Courses API",
    description="API для web-сайта подготовительных курсов по математике",
    version="1.0.0"
)

# Настройка CORS — РАЗРЕШАЕМ ВСЁ ДЛЯ РАЗРАБОТКИ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (включая OPTIONS)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Подключение роутеров
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Аутентификация"])
app.include_router(topics.router, prefix="/api/v1/topics", tags=["Учебный контент"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Задачи"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Статистика"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Администрирование"])
app.include_router(sympy.router, prefix="/api/v1/sympy", tags=["SymPy (уникальные функции)"])

@app.get("/")
def root():
    return {
        "message": "Math Courses API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}