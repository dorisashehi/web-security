"""Test Agent 3 via API endpoints."""

import requests
import json
import time

BASE_URL = "http://localhost:8000"


def test_behavior_agent():
    """Test behavior analyzer agent via API."""
    print("Testing Agent 3: Behavior Analyzer via API\n")
    print("=" * 50)

    print("\nStep 1: Set baseline for user")
    response = requests.post(
        f"{BASE_URL}/api/agent3/baseline",
        json={
            "user_id": "user123",
            "normal_routes": ["/home", "/profile", "/shop"],
            "normal_times": ["08:00-18:00"],
            "normal_location": "New York"
        }
    )
    print(f"Baseline set: {response.status_code}")
    time.sleep(0.1)

    print("\nTest 1: Normal behavior (should not alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent3/behavior",
        json={
            "user_id": "user123",
            "route": "/home",
            "action": "click",
            "location": "New York"
        }
    )
    print(f"Normal behavior: {response.status_code}")
    time.sleep(0.1)

    print("\nTest 2: High click rate / Bot-like behavior (should alert)")
    for i in range(10):
        response = requests.post(
            f"{BASE_URL}/api/agent3/behavior",
            json={
                "user_id": "user456",
                "route": "/admin",
                "action": "click",
                "location": "US"
            }
        )

        result = response.json()
        print(f"\nResponse: {json.dumps(result, indent=2)}")
        time.sleep(0.1)

    print("\nTest 3: Accessing sensitive routes (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent3/behavior",
        json={
            "user_id": "user123",
            "route": "/admin",
            "action": "access",
            "location": "New York"
        }
    )
    result = response.json()
    print(f"\nResponse: {json.dumps(result, indent=2)}")
    time.sleep(0.1)

    print("\nTest 4: Impossible travel pattern (should alert)")
    response = requests.post(
        f"{BASE_URL}/api/agent3/behavior",
        json={
            "user_id": "user999",
            "route": "/login",
            "action": "login",
            "location": "New York"
        }
    )
    response = requests.post(
        f"{BASE_URL}/api/agent3/behavior",
        json={
            "user_id": "user999",
            "route": "/home",
            "action": "access",
            "location": "Paris"
        }
    )
    result = response.json()
    print(f"\nResponse: {json.dumps(result, indent=2)}")

    print("\n" + "=" * 50)
    print("Test completed! Check database for saved alerts.")


if __name__ == "__main__":
    test_behavior_agent()

