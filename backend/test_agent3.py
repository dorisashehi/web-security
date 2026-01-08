"""Test file for Agent 3: Behavior Analyzer."""

from event_bus.event_bus import EventBus
from agents.agent3_behavior_analyzer import BehaviorAnalyzer


def test_agent():
    """Test the behavior analyzer agent."""
    event_bus = EventBus()
    alerts_received = []

    def alert_handler(event):
        alerts_received.append(event)
        print(f"\n🚨 ALERT RECEIVED:")
        print(f"Type: {event['type']}")
        print(f"Data: {event['data']}")
        print(f"Time: {event['timestamp']}\n")

    event_bus.subscribe(alert_handler)

    agent = BehaviorAnalyzer(event_bus)

    print("Testing Agent 3: Behavior Analyzer\n")
    print("=" * 50)

    print("\nTest 1: Normal behavior (should not alert)")
    agent.set_baseline(
        "user123",
        normal_routes=["/home", "/profile", "/shop"],
        normal_times=["08:00-18:00"],
        normal_location="New York"
    )
    agent.process_action("user123", "/home", "click", "New York")
    agent.process_action("user123", "/shop", "click", "New York")
    agent.process_action("user123", "/profile", "click", "New York")

    print("\nTest 2: High click rate / Bot-like behavior (should alert)")
    for i in range(60):
        agent.process_action("user456", f"/page{i}", "click", "US")

    print("\nTest 3: Accessing sensitive routes at odd hours (should alert)")
    agent.set_baseline(
        "user789",
        normal_routes=["/home", "/shop"],
        normal_times=["09:00-17:00"],
        normal_location="California"
    )
    agent.process_action("user789", "/admin", "access", "California")
    agent.process_action("user789", "/settings", "access", "California")
    agent.process_action("user789", "/api/admin/users", "access", "California")

    print("\nTest 4: Impossible travel pattern (should alert)")
    agent.set_baseline(
        "user999",
        normal_routes=["/home"],
        normal_times=["08:00-18:00"],
        normal_location="New York"
    )
    from datetime import datetime, timedelta
    base_time = datetime.now()
    agent.process_action("user999", "/login", "login", "New York")
    agent.process_action("user999", "/home", "access", "Paris")

    print("\nTest 5: Behavior deviation from baseline (should alert)")
    agent.process_action("user123", "/admin", "access", "New York")
    agent.process_action("user123", "/settings", "access", "New York")

    print("\n" + "=" * 50)
    print(f"\nTotal alerts received: {len(alerts_received)}")

    if alerts_received:
        print("\nAlert Summary:")
        for idx, alert in enumerate(alerts_received, 1):
            data = alert['data']
            print(f"\n{idx}. User: {data['user_id']}")
            print(f"   Severity: {data['severity']}")
            print(f"   Route: {data['route']}")
            print(f"   Clicks/min: {data.get('clicks_per_minute', 0)}")
            if data.get('impossible_travel'):
                print(f"   ⚠️  Impossible travel detected!")
            if data.get('bot_like'):
                print(f"   ⚠️  Bot-like behavior detected!")
            print(f"   Reasoning: {data['reasoning'][:100]}...")


if __name__ == "__main__":
    test_agent()

