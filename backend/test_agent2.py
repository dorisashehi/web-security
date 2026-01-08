"""Test file for Agent 2: Log Analyzer."""

from event_bus.event_bus import EventBus
from agents.agent2_log_analyzer import LogAnalyzer


def test_agent():
    """Test the log analyzer agent."""
    event_bus = EventBus()
    alerts_received = []

    def alert_handler(event):
        alerts_received.append(event)
        print(f"\n🚨 ALERT RECEIVED:")
        print(f"Type: {event['type']}")
        print(f"Data: {event['data']}")
        print(f"Time: {event['timestamp']}\n")

    event_bus.subscribe(alert_handler)

    agent = LogAnalyzer(event_bus)

    print("Testing Agent 2: Log Analyzer\n")
    print("=" * 50)

    print("\nTest 1: Normal logs (should not alert)")
    agent.process_log(
        "2026-01-05 14:20:01: User 'john' successfully logged in from IP 192.168.1.10",
        "auth"
    )
    agent.process_log(
        "2026-01-05 14:21:05: User 'mary' accessed /home page",
        "access"
    )

    print("\nTest 2: Repeated failed logins (should alert)")
    for i in range(5):
        agent.process_log(
            f"2026-01-05 14:22:{i:02d}: Failed login attempt for user 'admin' from IP 123.45.67.89",
            "auth"
        )

    print("\nTest 3: Privilege escalation attempt (should alert)")
    agent.process_log(
        "2026-01-05 14:23:10: User 'guest' tried to escalate privileges to 'editor'",
        "auth"
    )
    agent.process_log(
        "2026-01-05 14:23:15: User 'guest' attempted to access /admin/settings",
        "error"
    )

    print("\nTest 4: Permission denied errors (should alert)")
    agent.process_log(
        "2026-01-05 14:24:01: Permission denied for user 'test' accessing /admin/settings",
        "error"
    )
    agent.process_log(
        "2026-01-05 14:24:05: Unauthorized access attempt to /api/admin/users",
        "error"
    )

    print("\n" + "=" * 50)
    print(f"\nTotal alerts received: {len(alerts_received)}")

    if alerts_received:
        print("\nAlert Summary:")
        for idx, alert in enumerate(alerts_received, 1):
            data = alert['data']
            print(f"\n{idx}. Severity: {data['severity']}")
            print(f"   Log Type: {data['log_type']}")
            print(f"   Entry: {data['log_entry'][:80]}...")
            if data.get('failed_login_count', 0) > 0:
                print(f"   Failed Logins: {data['failed_login_count']}")
            print(f"   Summary: {data['summary'][:100]}...")


if __name__ == "__main__":
    test_agent()

