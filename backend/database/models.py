"""Database models for security alerts."""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class Alert(Base):
    """Alert model for storing security alerts."""

    __tablename__ = "alerts"

    # -------------------- Core Fields --------------------

    id = Column(Integer, primary_key=True, index=True)

    agent = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)

    classification = Column(
        String(20),
        nullable=False,
        index=True,
        comment="normal | suspicious | unknown"
    )

    reason = Column(
        Text,
        nullable=True,
        comment="Plain text explanation only. DO NOT store JSON."
    )

    recommended_action = Column(
        Text,
        nullable=True,
        comment="Plain text remediation steps only. DO NOT store JSON."
    )

    created_at = Column(
        DateTime,
        default=func.now(),
        nullable=False,
        index=True
    )

    # -------------------- Traffic Monitor (Agent 1) --------------------

    ip = Column(String(45), nullable=True, index=True)
    route = Column(String(255), nullable=True)
    requests_per_minute = Column(Integer, nullable=True)
    user_agent = Column(String(255), nullable=True)
    geo = Column(String(100), nullable=True)
    detection_timestamp = Column(DateTime, nullable=True)

    # -------------------- Log Analyzer (Agent 2) --------------------

    failed_login_count = Column(Integer, nullable=True)
    log_entry = Column(Text, nullable=True)
    log_type = Column(String(50), nullable=True)
    username = Column(String(100), nullable=True)
    log_timestamp = Column(DateTime, nullable=True)

    # -------------------- Behavior Analyzer (Agent 3) --------------------

    user_id = Column(String(100), nullable=True)
    action = Column(String(100), nullable=True)
    behavior_location = Column(String(100), nullable=True)
    clicks_per_minute = Column(String(50), nullable=True)

    is_sensitive_route = Column(Boolean, nullable=True)
    is_bot_like = Column(Boolean, nullable=True)
    is_odd_hour = Column(Boolean, nullable=True)
    impossible_travel = Column(Boolean, nullable=True)
    deviates_from_baseline = Column(Boolean, nullable=True)
    behavior_timestamp = Column(DateTime, nullable=True)


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
    updated_at = Column(
        DateTime,
        default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
