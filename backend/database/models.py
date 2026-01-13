"""Database models for security alerts."""

from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()


class AlertStatus(enum.Enum):
    """Alert status enumeration."""
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class AlertSeverity(enum.Enum):
    """Alert severity enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Alert(Base):
    """Alert model for storing security alerts."""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    agent_type = Column(String(50), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    severity = Column(SQLEnum(AlertSeverity), nullable=False, index=True)
    status = Column(SQLEnum(AlertStatus), default=AlertStatus.NEW, index=True)

    ip_address = Column(String(45), nullable=True, index=True)
    user_id = Column(String(100), nullable=True, index=True)
    route = Column(String(255), nullable=True)

    classification = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)

    alert_metadata = Column(JSON, nullable=True)

    recommended_action = Column(Text, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

