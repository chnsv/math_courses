from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./math_courses.db"
    SECRET_KEY: str = "supersecretkey_for_jwt_2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SMTP_HOST: str = "smtp.yandex.ru"
    SMTP_PORT: int = 465
    SMTP_USER: str = "chernyshova.nika0303@yandex.ru"
    SMTP_PASSWORD: str = "knqiynlveeabwboc"

    FRONTEND_URL: str = "http://localhost:5173"

settings = Settings()