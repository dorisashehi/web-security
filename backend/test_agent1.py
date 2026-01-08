"""Test file for Agent 1: Traffic Monitor."""

import os
from event_bus.event_bus import EventBus
from agents.agent1_traffic_monitor import TrafficMonitor


def test_agent():
    """Test the traffic monitor agent."""
    event_bus = EventBus()
    alerts_received = []

    def alert_handler(event):
        alerts_received.append(event)
        print(f"\n🚨 ALERT RECEIVED:")
        print(f"Type: {event['type']}")
        print(f"Data: {event['data']}")
        print(f"Time: {event['timestamp']}\n")

    event_bus.subscribe(alert_handler)

    sensitive_routes = ["/login", "/admin", "/checkout", "/api/auth"]
    agent = TrafficMonitor(event_bus, sensitive_routes)

    print("Testing Agent 1: Traffic Monitor\n")
    print("=" * 50)

    print("\nTest 1: Normal traffic (should not alert)")
    for i in range(5):
        agent.process_request(
            ip="192.168.1.10",
            route="/home",
            user_agent="Mozilla/5.0",
            geo="US"
        )

    print("\nTest 2: High rate traffic on sensitive route (should alert)")
    for i in range(60):
        agent.process_request(
            ip="123.45.67.89",
            route="/login",
            user_agent="Mozilla/5.0",
            geo="China"
        )

    print("\nTest 3: Multiple requests to admin route (should alert)")
    for i in range(15):
        agent.process_request(
            ip="10.0.0.5",
            route="/admin",
            user_agent="curl/7.0",
            geo="Unknown"
        )

    print("\n" + "=" * 50)
    print(f"\nTotal alerts received: {len(alerts_received)}")

    if alerts_received:
        print("\nAlert Summary:")
        for idx, alert in enumerate(alerts_received, 1):
            data = alert['data']
            print(f"\n{idx}. IP: {data['ip']}")
            print(f"   Route: {data['route']}")
            print(f"   Requests/min: {data['requests_per_minute']}")
            print(f"   Reason: {data['reason'][:100]}...")


if __name__ == "__main__":
    test_agent()

