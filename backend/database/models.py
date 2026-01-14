"""Database models for security alerts."""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class Alert(Base):
    """Alert model for storing security alerts."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    agent = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    ip = Column(String(45), nullable=True, index=True)
    route = Column(String(255), nullable=True)
    requests_per_minute = Column(Integer, nullable=True)
    classification = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)

