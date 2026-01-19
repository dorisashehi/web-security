from datetime import datetime
from sqlalchemy.orm import Session
from database.models import Alert
from database.db import SessionLocal
import logging

logger = logging.getLogger(__name__)


class AlertHandler:
    def __call__(self, event: dict):
        try:
            self.save_alert(event)
        except Exception as e:
            logger.error(f"Error saving alert: {e}", exc_info=True)

    def save_alert(self, event: dict):
        db: Session = SessionLocal()
        try:
            data = event.get("data", {})
            timestamp = event.get("timestamp")

            alert = Alert(
                agent=data.get("agent", "unknown"),
                severity=data.get("severity", "medium"),
                ip=data.get("ip"),
                route=data.get("route"),
                requests_per_minute=data.get("requests_per_minute"),

                classification=data.get("classification", "unknown"),
                reason=data.get("reason", ""),
                recommended_action=data.get("recommended_action", ""),

                user_agent=data.get("user_agent"),
                geo=data.get("geo"),
                detection_timestamp=self.parse_timestamp(
                    data.get("detection_timestamp")
                ),
                created_at=self.parse_timestamp(timestamp),
            )

            db.add(alert)
            db.commit()
            db.refresh(alert)

            logger.info(f"Alert saved: id={alert.id}")

        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    @staticmethod
    def parse_timestamp(value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                pass
        return datetime.now()
