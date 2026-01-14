"""Event bus handler for saving alerts to database."""

from datetime import datetime
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from database.models import Alert
from database.db import SessionLocal
import logging
import json

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
            data = event.get("data", {})
            timestamp = event.get("timestamp", datetime.now().isoformat())

            created_at = self.parse_timestamp(timestamp)

            reason_text = data.get("reason") or data.get("reasoning") or data.get("summary", "")
            classification, reason = self.parse_classification_and_reason(reason_text)

            alert = Alert(
                agent=data.get("agent", "unknown"),
                severity=data.get("severity", "medium"),
                ip=data.get("ip"),
                route=data.get("route"),
                requests_per_minute=data.get("requests_per_minute"),
                classification=classification,
                reason=reason,
                recommended_action=data.get("recommended_action", ""),
                created_at=created_at
            )

            db.add(alert)
            db.commit()
            db.refresh(alert)

            logger.info(f"Alert saved: ID={alert.id}, Agent={alert.agent}, Severity={alert.severity}")

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save alert: {str(e)}", exc_info=True)
            raise
        finally:
            db.close()

    def parse_timestamp(self, timestamp) -> datetime:
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

    def parse_classification_and_reason(self, reason_text: str) -> Tuple[Optional[str], str]:
        """Parse JSON to extract classification and reason separately."""
        if not reason_text:
            return None, ""

        try:
            parsed = json.loads(reason_text)
            if isinstance(parsed, dict):
                classification = parsed.get("classification")
                reason = parsed.get("reason", "")
                return classification, reason
        except (json.JSONDecodeError, TypeError):
            pass

        return None, reason_text


