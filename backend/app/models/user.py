"""TravelSphere user model."""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID stored as string
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="customer", nullable=False)
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp
    updated_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp
