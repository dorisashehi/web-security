# Asynchronous Multi-Agent Cybersecurity Monitor

## Project Overview

**Goal:** A system where independent AI agents run asynchronously, listen to events, and react only when something suspicious happens.

**Key Principles:**

- No turn-taking. No fixed loop.
- Just event-driven intelligence.
- Each agent runs independently and uses AI only when needed.

## High-Level Architecture

```
[ Network Events ] ──▶ Agent 1 (Traffic Monitor)
[ System Logs ]   ──▶ Agent 2 (Log Analyzer)
[ User Actions ]  ──▶ Agent 3 (Behavior Analyzer)

           ↓ (events / alerts)
        Event Bus (Redis / Kafka / WebSockets)

           ↓
     Dashboard + Alerts
```

### Architecture Components

- **Event Bus**: Central communication hub (Redis / Kafka / WebSockets)
- **Dashboard**: Real-time visualization of alerts and system status

### Agent Characteristics

Each agent:

- Runs independently
- Listens for specific events
- Uses AI only when needed
- Emits alerts asynchronously

---

## Agents Breakdown

### 🕵️ Agent 1 — Network Traffic Monitor

A watchdog for your website's traffic that constantly monitors who's visiting, what they're doing, and how often.

#### What it Listens To

Captures incoming request metadata:

| Data             | Example                   | Why it matters                                                      |
| ---------------- | ------------------------- | ------------------------------------------------------------------- |
| IP address       | `192.168.1.10`            | Detect if multiple requests come from the same IP (possible attack) |
| Route / Endpoint | `/login` or `/checkout`   | Detect suspicious access to sensitive pages                         |
| Frequency / Rate | `300 requests per minute` | Detect spikes in traffic or unusual load                            |

#### What it Detects

- **Request spikes**: Sudden traffic increases (e.g., 50 req/min → 500 req/min on `/login`)
- **Suspicious IP patterns**: Multiple requests from a single IP targeting sensitive routes
- **Possible DDoS / brute force**: Overwhelming traffic or repeated login attempts

#### AI Usage

Instead of simple thresholds, AI classifies traffic patterns:

**Input to AI:**

```json
{
  "IP": "123.45.67.89",
  "route": "/login",
  "requests_last_min": 350,
  "user_agent": "Mozilla/5.0",
  "geo": "China"
}
```

**AI Output:**

```json
{
  "classification": "suspicious",
  "reason": "High request rate from unusual location targeting /login endpoint"
}
```

**Why AI is useful:**

- Detects patterns that simple rules miss (e.g., low-rate attacks spread across many IPs)
- Provides reasoning for alerts
- Identifies bot-like behavior

#### Example Flow

1. User visits `/login` → Agent logs IP, route, frequency
2. Requests spike from a single IP → Agent detects abnormal rate
3. AI classifies this as suspicious
4. Alert sent to dashboard → Admin sees:
   ```
   🚨 Suspicious traffic detected
   IP: 123.45.67.89
   Endpoint: /login
   Requests per minute: 350
   Recommended Action: Block IP / Investigate
   ```

**Optional automation:**

- Block IP automatically
- Temporarily rate-limit requests
- Log for further investigation

**💡 Analogy:** Think of Agent 1 as a security guard at your website's door. It watches everyone coming in, notices if someone is acting strangely (too many requests, wrong area), and alerts you — sometimes even stopping them automatically.

---

### 📄 Agent 2 — System Log Analyzer

A watchdog reading your website's internal activity logs. While Agent 1 watches traffic from outside, this one looks inside the system to catch suspicious behavior.

#### What it Listens To

Reads system and application logs:

| Log Type            | Example Entry                                                                     | Why it matters                                               |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Auth logs           | `2026-01-05 14:22:01: Failed login attempt for user 'admin' from IP 123.45.67.89` | Detect repeated failed login attempts (possible brute force) |
| Error logs          | `2026-01-05 14:23:10: Permission denied for accessing /admin/settings`            | Shows unauthorized attempts or misconfigurations             |
| Permission failures | `User 'guest' tried to escalate privileges to 'editor'`                           | Could indicate an attacker trying to gain higher access      |

#### What it Detects

- **Repeated failed logins**: Multiple failed attempts in short time (e.g., admin failed login 10 times in 2 minutes)
- **Unexpected privilege escalations**: Users attempting to access admin routes or modify roles
- **Other anomalies**:
  - Multiple login attempts from new countries
  - Access to sensitive endpoints at odd hours

#### AI Usage (LLM)

AI reads, summarizes, and reasons about logs:

**Input to AI:**

```
Logs:
1. Failed login for user admin from IP 123.45.67.89
2. User guest attempted to access /admin/settings
3. Failed login for admin from IP 123.45.67.89
4. User guest tried to escalate privileges to editor
```

**AI Output:**

```json
{
  "anomalies": [
    {
      "type": "Repeated failed logins",
      "details": "Admin account failed login 2 times from same IP in short period",
      "severity": "medium"
    },
    {
      "type": "Unauthorized privilege escalation",
      "details": "Guest account tried to access admin routes and escalate privileges",
      "severity": "high"
    }
  ],
  "summary": "Suspicious activity detected: possible brute-force on admin and privilege escalation attempts by guest."
}
```

**Why this is powerful:**

- Summarizes hundreds of logs in seconds
- Reasons about patterns instead of just counting events
- Provides human-readable explanations for dashboards

#### Example Flow

1. Website generates logs (login, permission changes, errors)
2. Logs are streamed to the System Log Analyzer (API hook or backend integration)
3. Agent 2 runs AI analysis:
   - Detect repeated failed logins
   - Detect privilege escalation attempts
4. Alert generated → sent to dashboard:
   ```
   🚨 ALERT: High severity
   - Guest tried to escalate privileges
   - Admin account targeted by multiple failed logins
   - Recommended actions: lock guest account, investigate IP
   ```

**💡 Analogy:** Agent 1 is the front door security guard (monitors outside traffic). Agent 2 is the security guard inside the building (reads activity logs, sees what people are trying to do inside). Together, they give full coverage: outside + inside threats.

---

### 👤 Agent 3 — User Behavior Analyzer

Monitors what users are doing on your website. While Agent 1 watches traffic and Agent 2 watches system logs, Agent 3 focuses on human behavior patterns.

Think of it as a behavioral watchdog.

#### What it Listens To

Monitors user actions and patterns:

| Input                  | Example                                          | Why it matters                                                                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Clicks                 | User clicks "Transfer Funds" or "Delete Account" | Detect unusual sequences of actions                                                |
| Routes / Pages visited | `/login` → `/admin` → `/settings`                | Detect access patterns that deviate from normal usage                              |
| Time of access         | 3 AM access for admin account                    | Detect unusual activity time                                                       |
| Geolocation            | NY, EU, or IP location                           | Detect impossible travel patterns (account logged in from NY then EU in 5 minutes) |
| Session duration       | Spends 1 second on page, 100 pages in 2 minutes  | Detect bot-like behavior                                                           |

#### What it Detects

- **Behavior deviations**: User suddenly starts visiting admin pages when normally they only browse products
- **Impossible travel**: User logs in from New York, then 10 minutes later from Paris
- **Bot-like activity**: 500 clicks per minute, very short page durations

#### AI Usage

AI compares current behavior against a baseline profile of each user:

**Baseline profile:** "normal behavior"

- User A usually logs in from NY between 9 AM–6 PM
- User clicks: Browse → Cart → Checkout

**AI Task:** Detect deviations from baseline

**Input:**

```json
{
  "user_id": "user123",
  "session_actions": [
    { "route": "/login", "timestamp": "2026-01-05T03:12:00Z" },
    { "route": "/admin", "timestamp": "2026-01-05T03:15:00Z" },
    { "route": "/settings", "timestamp": "2026-01-05T03:16:00Z" }
  ],
  "locations": ["New York", "Paris"],
  "baseline_profile": {
    "normal_routes": ["/home", "/profile", "/shop"],
    "normal_times": ["08:00-18:00"],
    "normal_location": "New York"
  }
}
```

**AI Output:**

```json
{
  "classification": "suspicious",
  "reasoning": "User session deviates from baseline. Accessed admin pages at 3 AM from NY, then logged in from Paris in 10 minutes. Likely account compromise or bot activity."
}
```

**Why AI is useful:**

- Detects subtle anomalies that rules alone cannot catch
- Compares temporal and behavioral patterns
- Provides human-readable explanation for alerts

#### Example Flow

1. User logs in → performs actions
2. Agent 3 collects all session events
3. AI compares session against baseline profile
4. If deviation detected → sends alert to dashboard

**Alert Example:**

```
🚨 ALERT: Suspicious user behavior
- User: user123
- Deviation: Accessed admin pages outside normal hours
- Impossible travel detected: NY → Paris in 10 minutes
- Recommendation: Temporarily lock account, investigate
```

**💡 Analogy:**

- Agent 1 = front door security (monitors traffic)
- Agent 2 = inside security cameras (monitors system events)
- Agent 3 = security guard observing people's behavior (detects suspicious actions)

---

## How to Provide Data to Agents

### Option C: API Hook

The agent exposes a REST or WebSocket endpoint, and your website sends traffic info to the agent.

**Example (Node.js):**

```javascript
fetch("http://localhost:8000/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ip: req.ip,
    route: req.path,
    timestamp: Date.now(),
  }),
});
```

### The API Hook on the Agent Side

Your agent exposes a simple REST API (or WebSocket) endpoint that can receive traffic events from any website:

**Example (Python/FastAPI):**

```python
from fastapi import FastAPI, Request
from agent import traffic_agent

app = FastAPI()

@app.post("/agent")
async def receive_event(req: Request):
    event = await req.json()
    result = traffic_agent(event)
    return result
```

Any website (real or simulated) can now send requests to this API. This is exactly how you'd integrate it in the future for real websites.

---

## Demo Setup for Presentation

Since you don't have a real site, here's how you can demonstrate it convincingly:

1. **Run your agent server** with `/agent` endpoint
2. **Run the traffic generator** (simulates visitors on different websites)
3. **Watch the dashboard update in real-time**:
   - Alerts triggered for "suspicious traffic"
   - Normal traffic passes through without alerts

---

## Future Enhancements

You can add:

- **Memory per agent**: Agents remember past events for better pattern detection
- **Confidence scoring**: Each alert includes a confidence level
- **Auto-response**: Automatic actions like blocking IPs or locking accounts
- **Simulation mode**: Built-in demo mode for presentations

---

## Project Structure

```
security_detection/
├── agents/
│   ├── agent1_traffic_monitor.py
│   ├── agent2_log_analyzer.py
│   └── agent3_behavior_analyzer.py
├── dashboard/
│   └── dashboard.py
├── event_bus/
│   └── event_bus.py
├── traffic_generator/
│   └── simulator.py
└── README.md
```

---

## Getting Started

1. **Install dependencies** (requirements.txt)
2. **Set up event bus** (Redis/Kafka/WebSockets)
3. **Configure agents** with API keys for AI services
4. **Start agents** (each runs independently)
5. **Launch dashboard** (real-time monitoring)
6. **Run traffic generator** (for demo/testing)

---

## License

[Add your license here]

---

## Contributing

[Add contribution guidelines here]
