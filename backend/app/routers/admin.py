from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.auth_service import get_current_user, hash_password

router = APIRouter()

print("ADMIN.PY is being loaded!")


@router.get("/users")
def get_users(
        role: Optional[str] = Query(None),
        class_name: Optional[str] = Query(None),
        limit: int = 50,
        offset: int = 0,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Получение списка пользователей"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(models.User)

    if role:
        query = query.filter(models.User.role == role)
    if class_name:
        query = query.filter(models.User.class_name == class_name)

    total = query.count()
    users = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "class_name": u.class_name,
                "role": u.role,
                "xp": u.xp,
                "level": u.level,
                "created_at": u.created_at
            }
            for u in users
        ]
    }


@router.post("/users")
def create_user(
        user_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Создание нового пользователя"""
    print(f"Создание пользователя: {user_data}")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    existing_user = db.query(models.User).filter(models.User.email == user_data.get("email")).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = hash_password(user_data.get("password", "default123"))

    new_user = models.User(
        email=user_data.get("email"),
        password_hash=hashed_pwd,
        full_name=user_data.get("full_name", ""),
        class_name=user_data.get("class_name", ""),
        role=user_data.get("role", "student"),
        xp=0,
        level=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(f"Пользователь создан: id={new_user.id}, email={new_user.email}")

    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "class_name": new_user.class_name,
        "role": new_user.role
    }


@router.delete("/users/{user_id}")
def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Удаление пользователя"""
    print(f"Удаление пользователя с id={user_id}")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    print(f"Пользователь {user.email} удален")

    return {"message": "User deleted"}


@router.put("/users/{user_id}/block")
def block_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Блокировка пользователя"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "blocked"
    db.commit()

    return {"message": f"User {user.email} has been blocked"}


@router.get("/export")
def export_users(
        class_name: Optional[str] = Query(None),
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """Экспорт пользователей"""
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = db.query(models.User).filter(models.User.role == "student")
    if class_name:
        query = query.filter(models.User.class_name == class_name)

    students = query.all()

    return [
        {
            "full_name": s.full_name or s.email,
            "email": s.email,
            "class_name": s.class_name,
            "xp": s.xp,
            "level": s.level
        }
        for s in students
    ]

@router.get("/test")
def test_admin():
    return {"status": "admin router works"}