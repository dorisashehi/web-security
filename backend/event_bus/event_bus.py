"""Simple event bus for emitting alerts from agents."""


class EventBus:
    """Handles event emission for agent alerts."""

    def __init__(self):
        self.subscribers = []

    def subscribe(self, callback):
        """Subscribe a callback to receive events."""
        self.subscribers.append(callback)

    def emit(self, event_type, data):
        """Emit an event to all subscribers."""
        event = {"type": event_type, "data": data, "timestamp": self._get_timestamp()}
        for callback in self.subscribers:
            callback(event)

    def _get_timestamp(self):
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()

