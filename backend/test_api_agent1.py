"""Test Agent 1 via API endpoints."""

import requests
import json
import time

BASE_URL = "http://localhost:8000"


def test_traffic_agent():
    """Test traffic monitoring agent via API."""
    print("Testing Agent 1: Traffic Monitor via API\n")
    print("=" * 50)

    # print("\nTest 1: Normal traffic (should not alert)")
    # for i in range(5):
    #     response = requests.post(
    #         f"{BASE_URL}/api/agent1/traffic",
    #         json={
    #             "ip": "192.168.1.10",
    #             "route": "/home",
    #             "user_agent": "Mozilla/5.0",
    #             "geo": "US"
    #         }
    #     )
    #     print(f"Request {i+1}: {response.status_code}")

    # print("\nTest 2: High rate traffic on sensitive route (should alert)")
    # for i in range(60):
    #     response = requests.post(
    #         f"{BASE_URL}/api/agent1/traffic",
    #         json={
    #             "ip": "123.45.67.89",
    #             "route": "/login",
    #             "user_agent": "Mozilla/5.0",
    #             "geo": "China"
    #         }
    #     )
    #     if i % 10 == 0:
    #         result = response.json()
    #         if result.get("alerts"):
    #             print(f"Alert detected at request {i+1}")

    print("\nTest 3: Multiple requests to admin route (should alert)")
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
        if i == 14:
            result = response.json()
            print(f"\nFinal response: {json.dumps(result, indent=2)}")

    print("\n" + "=" * 50)
    print("Test completed! Check database for saved alerts.")


if __name__ == "__main__":
    test_traffic_agent()

