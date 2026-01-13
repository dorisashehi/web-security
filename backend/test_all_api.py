"""Test all agents via API endpoints."""

import requests
import json

BASE_URL = "http://localhost:8000"


def test_all_agents():
    """Test all three agents via API."""
    print("Testing All Agents via API\n")
    print("=" * 60)

    print("\n1. Testing Agent 1: Traffic Monitor")
    response = requests.post(
        f"{BASE_URL}/api/agent1/traffic",
        json={
            "ip": "123.45.67.89",
            "route": "/login",
            "user_agent": "Mozilla/5.0",
            "geo": "China"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Alerts: {len(result.get('alerts', []))}")

    print("\n2. Testing Agent 2: Log Analyzer")
    response = requests.post(
        f"{BASE_URL}/api/agent2/logs",
        json={
            "log_entry": "Failed login attempt for user 'admin' from IP 123.45.67.89",
            "log_type": "auth"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Alerts: {len(result.get('alerts', []))}")

    print("\n3. Testing Agent 3: Behavior Analyzer")
    response = requests.post(
        f"{BASE_URL}/api/agent3/baseline",
        json={
            "user_id": "test_user",
            "normal_routes": ["/home", "/shop"],
            "normal_times": ["09:00-17:00"],
            "normal_location": "US"
        }
    )
    print(f"Baseline Status: {response.status_code}")

    response = requests.post(
        f"{BASE_URL}/api/agent3/behavior",
        json={
            "user_id": "test_user",
            "route": "/admin",
            "action": "access",
            "location": "US"
        }
    )
    print(f"Behavior Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Alerts: {len(result.get('alerts', []))}")

    print("\n" + "=" * 60)
    print("All tests completed! Check database for saved alerts.")


if __name__ == "__main__":
    test_all_agents()

