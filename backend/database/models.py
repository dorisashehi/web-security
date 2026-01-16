"""Database models for security alerts."""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
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
    failed_login_count = Column(Integer, nullable=True)  # For Agent 2: number of failed logins that triggered alert
    classification = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    # Agent 1 (Traffic Monitor) specific fields
    user_agent = Column(String(255), nullable=True)  # Browser/client info
    geo = Column(String(100), nullable=True)  # Geographic location
    detection_timestamp = Column(DateTime, nullable=True)  # Exact request time when detected


class AdminUser(Base):
    """Admin user model for authentication."""

    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

