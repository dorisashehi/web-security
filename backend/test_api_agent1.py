"""Test Agent 1 via API endpoints."""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"


def test_traffic_agent():
    """Test traffic monitoring agent via API."""
    print("Testing Agent 1: Traffic Monitor via API\n")
    print("=" * 50)

    alerts_from_responses = []

    print("\nTest 1: Normal traffic (should not alert)")
    for i in range(5):
        response = requests.post(
            f"{BASE_URL}/api/agent1/traffic",
            json={
                "ip": "192.168.1.10",
                "route": "/home",
                "user_agent": "Mozilla/5.0",
                "geo": "US"
            }
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("alerts"):
                alerts_from_responses.extend(result["alerts"])
                print(f"\n🚨 ALERT DETECTED at request {i+1}:")
                for alert in result["alerts"]:
                    print(f"  - IP: {alert.get('ip')}")
                    print(f"  - Route: {alert.get('route')}")
                    print(f"  - Requests/min: {alert.get('requests_per_minute')}")
                    print(f"  - Severity: {alert.get('severity')}")
        else:
            print(f"Request {i+1} failed with status {response.status_code}: {response.text}")

        # Small delay to allow processing
        time.sleep(0.1)

    print("\nTest 2: High rate traffic on sensitive route (should alert)")
    for i in range(60):
        response = requests.post(
            f"{BASE_URL}/api/agent1/traffic",
            json={
                "ip": "123.45.67.89",
                "route": "/login",
                "user_agent": "Mozilla/5.0",
                "geo": "China"
            }
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("alerts"):
                alerts_from_responses.extend(result["alerts"])
                print(f"\n🚨 ALERT DETECTED at request {i+1}:")
                for alert in result["alerts"]:
                    print(f"  - IP: {alert.get('ip')}")
                    print(f"  - Route: {alert.get('route')}")
                    print(f"  - Requests/min: {alert.get('requests_per_minute')}")
                    print(f"  - Severity: {alert.get('severity')}")
        else:
            print(f"Request {i+1} failed with status {response.status_code}: {response.text}")

        # Small delay to allow processing
        time.sleep(0.1)

    print("\nTest 3: Multiple requests to admin route (should alert)")
    print("Sending 15 requests to /admin route...")

    for i in range(15):
        response = requests.post(
            f"{BASE_URL}/api/agent1/traffic",
            json={
                "ip": "10.0.0.5",
                "route": "/admin",
                "user_agent": "curl/7.0",
                "geo": "Unknown"
            }
        )

        if response.status_code == 200:
            result = response.json()
            if result.get("alerts"):
                alerts_from_responses.extend(result["alerts"])
                print(f"\n🚨 ALERT DETECTED at request {i+1}:")
                for alert in result["alerts"]:
                    print(f"  - IP: {alert.get('ip')}")
                    print(f"  - Route: {alert.get('route')}")
                    print(f"  - Requests/min: {alert.get('requests_per_minute')}")
                    print(f"  - Severity: {alert.get('severity')}")
        else:
            print(f"Request {i+1} failed with status {response.status_code}: {response.text}")

        # Small delay to allow processing
        time.sleep(0.1)

    # Wait a bit for async database operations
    print("\nWaiting for database operations to complete...")
    time.sleep(2)



if __name__ == "__main__":
    test_traffic_agent()

