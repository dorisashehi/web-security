"""Test Agent 2 via API endpoints."""

import requests
import json
import time
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
    if response.status_code == 200:
        result = response.json()
        if result.get("alerts"):
            for alert in result["alerts"]:
                print(f"  - Agent: {alert.get('agent')}")
                print(f"  - Reason: {alert.get('reason')}")
                print(f"  - Severity: {alert.get('severity')}")
        else:
            print(f"Normal log: {response.status_code}: {response.text}")
    time.sleep(0.1)

    print("\nTest 2: Repeated failed logins (should alert)")
    for i in range(5):
        response = requests.post(
            f"{BASE_URL}/api/agent2/logs",
            json={
                "log_entry": f"2026-01-05 14:22:{i:02d}: Failed login attempt for user 'admin' from IP 123.45.67.89",
                "log_type": "auth"
            }
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("alerts"):
                print(f"\n🚨 ALERT DETECTED at request {i+1}:")
                for alert in result["alerts"]:
                    print(f"  - Agent: {alert.get('agent')}")
                    print(f"  - Reason: {alert.get('reason')}")
                    print(f"  - Severity: {alert.get('severity')}")
        else:
            print(f"Request {i+1} failed with status {response.status_code}: {response.text}")

        # Small delay to allow processing
        time.sleep(0.1)


    print("\nTest 3: Privilege escalation attempt (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "2026-01-05 14:23:10: User 'guest' tried to escalate privileges to 'editor'",
            "log_type": "auth"
        }
    )
    if response.status_code == 200:
        result = response.json()
        if result.get("alerts"):
            for alert in result["alerts"]:
                print(f"  - Agent: {alert.get('agent')}")
                print(f"  - Reason: {alert.get('reason')}")
                print(f"  - Severity: {alert.get('severity')}")
    else:
        print(f"Request failed with status {response.status_code}: {response.text}")

    time.sleep(0.1)

    print("\nTest 4: Permission denied errors (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "2026-01-05 14:24:01: Permission denied for user 'test' accessing /admin/settings",
            "log_type": "error"
        }
    )
    if response.status_code == 200:
        result = response.json()
        if result.get("alerts"):
            for alert in result["alerts"]:
                print(f"  - Agent: {alert.get('agent')}")
                print(f"  - Reason: {alert.get('reason')}")
                print(f"  - Severity: {alert.get('severity')}")
    else:
        print(f"Request failed with status {response.status_code}: {response.text}")


if __name__ == "__main__":
    test_log_agent()

