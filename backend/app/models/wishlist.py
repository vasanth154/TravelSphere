"""TravelSphere wishlist item model.

A saved item the user wants to keep for later (transport, hotel, activity,
food or place). Matches the `wishlist_items` Alembic migration schema.
"""

from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID stored as string
    user_id: Mapped[str] = mapped_column(String, index=True, nullable=False)
    item_type: Mapped[str] = mapped_column(String, nullable=False)  # transport|hotel|activity|food|place
    name: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str | None] = mapped_column(String)
    image: Mapped[str | None] = mapped_column(String)
    rating: Mapped[float | None] = mapped_column(Float)
    price: Mapped[float | None] = mapped_column(Float)
    category: Mapped[str | None] = mapped_column(String)
    reference_id: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp
