from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from .. import schemas, models, services
from ..database import get_db

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя с сохранением в БД"""

    # Проверка, существует ли пользователь с таким email
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Хеширование пароля
    hashed_password = services.auth_service.hash_password(user_data.password)

    # Создание нового пользователя в БД
    # Берём роль из user_data.role, если не передана — по умолчанию "student"
    user_role = user_data.role if hasattr(user_data, 'role') and user_data.role else "student"

    new_user = models.User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        class_name=user_data.class_name,
        role=user_role,
        xp=0,
        level=1
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Вход в систему с проверкой по БД"""

    # Поиск пользователя в БД
    user = db.query(models.User).filter(
        models.User.email == form_data.email
    ).first()

    # Проверка: существует ли пользователь и правильный ли пароль
    if not user or not services.auth_service.verify_password(
            form_data.password, user.password_hash
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Генерация JWT-токенов
    access_token = services.auth_service.create_access_token(user.id)
    refresh_token = services.auth_service.create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 900,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "class_name": user.class_name,
            "role": user.role,
            "xp": user.xp,
            "level": user.level,
            "created_at": user.created_at
        }
    }