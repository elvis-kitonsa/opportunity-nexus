from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.profiles import SeekerProfile


class Institution(Base):
    """A university or technical institution onboarded via the Django admin."""

    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    # Email domain used to auto-verify student accounts, e.g. "mak.ac.ug"
    email_domain: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    seekers: Mapped[list["SeekerProfile"]] = relationship(back_populates="institution")
