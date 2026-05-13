from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import secrets
from .. import schemas, models, services
from ..database import get_db
from ..utils.email import send_verification_email

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя с отправкой подтверждения на email"""

    # Проверка существующего пользователя
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Хеширование пароля
    hashed_password = services.auth_service.hash_password(user_data.password)

    # Генерируем токен для подтверждения email
    verification_token = secrets.token_urlsafe(32)

    # Определяем роль
    user_role = user_data.role if hasattr(user_data, 'role') and user_data.role else "student"

    # Создание нового пользователя
    new_user = models.User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        class_name=user_data.class_name,
        role=user_role,
        verification_token=verification_token,
        email_verified=False,
        xp=0,
        level=1
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Отправляем письмо с подтверждением (после сохранения в БД)
    email_sent = send_verification_email(user_data.email, verification_token)

    if not email_sent:
        print(f"Предупреждение: не удалось отправить письмо на {user_data.email}")

    return new_user


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Подтверждение email по токену"""

    # Ищем пользователя по токену
    user = db.query(models.User).filter(
        models.User.verification_token == token
    ).first()

    if not user:
        # Проверяем, может быть пользователь уже подтверждён?
        already_verified = db.query(models.User).filter(
            models.User.email_verified == True,
            models.User.verification_token.is_(None)
        ).first()

        if already_verified:
            return {"message": "Email already verified", "redirect": "/profile"}

        raise HTTPException(status_code=400, detail="Invalid verification token")

    # Если пользователь уже подтверждён
    if user.email_verified:
        return {"message": "Email already verified", "redirect": "/profile"}

    # Подтверждаем пользователя
    user.email_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "Email successfully verified", "redirect": "/profile"}

@router.post("/login")
def login(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Вход в систему"""

    user = db.query(models.User).filter(
        models.User.email == form_data.email
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not services.auth_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Проверка, подтверждён ли email
    if not user.email_verified:
        raise HTTPException(status_code=401, detail="Email not verified. Please check your email.")

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