from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.profiles import EmployerProfile, SeekerProfile


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Email verified (e.g. via institution domain for seekers, or admin for employers)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    seeker_profile: Mapped[Optional["SeekerProfile"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    employer_profile: Mapped[Optional["EmployerProfile"]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
