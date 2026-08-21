"""TravelSphere transport option model."""

from sqlalchemy import Boolean, Column, Float, Integer, String, Text

from app.db import Base


class TransportOption(Base):
    __tablename__ = "transport_options"
    
    id = Column(String, primary_key=True)  # UUID stored as string
    mode = Column(String, nullable=False)  # bus, train, flight, car, cab, bike, metro
    provider = Column(String, nullable=False)  # provider name
    service_name = Column(String, nullable=False)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure = Column(String, nullable=False)  # ISO time string
    arrival = Column(String, nullable=False)  # ISO time string
    duration = Column(Integer, nullable=False)  # minutes
    distance = Column(Float, nullable=False)  # km
    price = Column(Float, nullable=False)  # in INR
    currency = Column(String, default="INR")
    travelers = Column(Integer, default=1)
    stops = Column(Integer, default=0)
    availability = Column(String, default="Available")
    comfort = Column(Float)  # 1-10
    convenience = Column(Float)  # 1-10
    fuel_cost = Column(Float, default=0.0)  # in INR
    toll_cost = Column(Float, default=0.0)  # in INR
    booking_url = Column(Text, nullable=True)
    booking_support = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    data_source = Column(String, default="mock_demo")