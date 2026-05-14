from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas
from ..database import get_db
from ..services.auth_service import get_current_user

router = APIRouter()


@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "class_name": current_user.class_name,
        "role": current_user.role,
        "xp": current_user.xp,
        "level": current_user.level,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at
    }


@router.put("/me")
def update_current_user(
        user_data: dict,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    allowed_fields = ["full_name", "class_name", "avatar_url"]

    for key, value in user_data.items():
        if key in allowed_fields and hasattr(current_user, key):
            setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "class_name": current_user.class_name,
        "role": current_user.role,
        "xp": current_user.xp,
        "level": current_user.level,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at
    }


@router.get("/")
def get_users(
        role: Optional[str] = None,
        class_name: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"]:
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
                "level": u.level
            }
            for u in users
        ]
    }


@router.get("/{user_id}")
def get_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "admin"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "class_name": user.class_name,
        "role": user.role,
        "xp": user.xp,
        "level": user.level,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at
    }


@router.put("/{user_id}/block")
def block_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "blocked"
    db.commit()

    return {"message": f"User {user.email} has been blocked"}


@router.put("/{user_id}/unblock")
def unblock_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = "student"
    db.commit()

    return {"message": f"User {user.email} has been unblocked"}


@router.delete("/{user_id}")
def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": f"User {user.email} has been deleted"}