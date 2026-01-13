"""Test Agent 2 via API endpoints."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_log_agent():
    """Test log analyzer agent via API."""
    print("Testing Agent 2: Log Analyzer via API\n")
    print("=" * 50)

    print("\nTest 1: Normal logs (should not alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "2026-01-05 14:20:01: User 'john' successfully logged in from IP 192.168.1.10",
            "log_type": "auth"
        }
    )
    print(f"Normal log: {response.status_code}")

    print("\nTest 2: Repeated failed logins (should alert)")
    for i in range(5):
        response = requests.post(
            f"{BASE_URL}/api/agent2/logs",
            json={
                "log_entry": f"2026-01-05 14:22:{i:02d}: Failed login attempt for user 'admin' from IP 123.45.67.89",
                "log_type": "auth"
            }
        )
        if i == 4:
            result = response.json()
            print(f"\nResponse: {json.dumps(result, indent=2)}")

    print("\nTest 3: Privilege escalation attempt (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "2026-01-05 14:23:10: User 'guest' tried to escalate privileges to 'editor'",
            "log_type": "auth"
        }
    )
    result = response.json()
    print(f"\nResponse: {json.dumps(result, indent=2)}")

    print("\nTest 4: Permission denied errors (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "2026-01-05 14:24:01: Permission denied for user 'test' accessing /admin/settings",
            "log_type": "error"
        }
    )
    result = response.json()
    print(f"\nResponse: {json.dumps(result, indent=2)}")

    print("\n" + "=" * 50)
    print("Test completed! Check database for saved alerts.")


if __name__ == "__main__":
    test_log_agent()

