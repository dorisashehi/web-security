"""Event bus handler for saving alerts to database."""

from datetime import datetime
from sqlalchemy.orm import Session
from database.models import Alert, AlertStatus, AlertSeverity
from database.db import SessionLocal
import logging

logger = logging.getLogger(__name__)


class AlertHandler:
    """Handles alert events and saves them to database."""

    def __init__(self):
        self.db: Session = None

    def __call__(self, event: dict):
        """Handle event from event bus."""
        try:
            self.save_alert(event)
        except Exception as e:
            logger.error(f"Error saving alert: {str(e)}", exc_info=True)

    def save_alert(self, event: dict):
        """Save alert to database."""
        db = SessionLocal()
        try:
            event_type = event.get("type", "")
            data = event.get("data", {})
            timestamp = event.get("timestamp", datetime.now().isoformat())

            agent_type = data.get("agent", "unknown")
            severity_str = data.get("severity", "medium").lower()

            try:
                severity = AlertSeverity[severity_str.upper()]
            except (KeyError, AttributeError):
                severity = AlertSeverity.MEDIUM

            created_at = self._parse_timestamp(timestamp)

            alert = Alert(
                agent_type=agent_type,
                event_type=event_type,
                severity=severity,
                status=AlertStatus.NEW,
                ip_address=data.get("ip"),
                user_id=data.get("user_id"),
                route=data.get("route"),
                classification=data.get("classification"),
                reason=data.get("reason"),
                summary=data.get("summary"),
                reasoning=data.get("reasoning"),
                recommended_action=data.get("recommended_action"),
                alert_metadata=self._extract_metadata(data),
                created_at=created_at
            )

            db.add(alert)
            db.commit()
            db.refresh(alert)

            logger.info(f"Alert saved: ID={alert.id}, Agent={agent_type}, Severity={severity_str}")

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save alert: {str(e)}", exc_info=True)
            raise
        finally:
            db.close()

    def _parse_timestamp(self, timestamp) -> datetime:
        """Parse timestamp string to datetime object."""
        if isinstance(timestamp, datetime):
            return timestamp

        if isinstance(timestamp, str):
            try:
                if timestamp.endswith("Z"):
                    timestamp = timestamp.replace("Z", "+00:00")
                return datetime.fromisoformat(timestamp)
            except ValueError:
                pass

        return datetime.now()

    def _extract_metadata(self, data: dict) -> dict:
        """Extract additional metadata from alert data."""
        metadata = {}

        exclude_fields = {
            "agent", "severity", "ip", "user_id", "route",
            "classification", "reason", "summary", "reasoning", "recommended_action"
        }

        for key, value in data.items():
            if key not in exclude_fields:
                metadata[key] = value

        return metadata

