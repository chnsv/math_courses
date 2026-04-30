from jose import jwt
from datetime import datetime, timedelta
from ..config import settings

# ВРЕМЕННО: отключаем реальное хеширование паролей для отладки
def hash_password(password: str) -> str:
    """Временно возвращаем пароль как есть (без хеширования)"""
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Временно сравниваем пароли напрямую"""
    return plain_password == hashed_password

def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])