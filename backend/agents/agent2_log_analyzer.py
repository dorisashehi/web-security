"""
Agent 2: System Log Analyzer
Detects suspicious activity in system logs with alert deduplication + cooldown.
"""

from typing import TypedDict, Annotated, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import operator
import os
import re
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from event_bus.event_bus import EventBus

load_dotenv()


# -------------------- STATE --------------------

class LogState(TypedDict):
    log_entry: str
    log_type: str
    timestamp: str

    # Derived
    failed_login_count: int
    needs_ai: bool
    classification: str
    severity: str
    reason: str
    alert_key: Optional[tuple]  # Added for alert deduplication
    ip: Optional[str]  # IP address from log entry

    alerts: Annotated[list, operator.add]


# -------------------- AGENT --------------------

class LogAnalyzer:
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )

        # failed_logins[(user, ip)][minute_bucket] = count
        self.failed_logins = defaultdict(lambda: defaultdict(int))

        # Deduplication (same pattern as Agent 1)
        self.alerted_keys: set[tuple] = set()
        self.last_seen: dict[tuple, datetime] = {}

        self.graph = self.build_graph()

    # -------------------- GRAPH --------------------

    def build_graph(self):
        workflow = StateGraph(LogState)

        workflow.add_node("analyze", self.analyze_patterns)
        workflow.add_node("classify", self.classify_with_ai)
        workflow.add_node("alert", self.emit_alert)

        workflow.set_entry_point("analyze")

        workflow.add_conditional_edges(
            "analyze",
            self.should_classify,
            {
                "classify": "classify",
                "skip": END,
            },
        )

        workflow.add_edge("classify", "alert")
        workflow.add_edge("alert", END)

        return workflow.compile()

    # -------------------- CORE LOGIC --------------------

    def analyze_patterns(self, state: LogState) -> LogState:
        log = state["log_entry"].lower()
        log_type = state["log_type"]

        now = datetime.now()
        minute_bucket = now.replace(second=0, microsecond=0)
        window_start = now - timedelta(minutes=2)

        # Cleanup cooldown
        cooldown = timedelta(minutes=5)
        for key, last in list(self.last_seen.items()):
            if now - last > cooldown:
                self.alerted_keys.discard(key)
                del self.last_seen[key]

        has_failed_login = "failed login" in log or "login failed" in log
        has_privilege = "privilege" in log or "escalate" in log
        has_permission_denied = "permission denied" in log or "unauthorized" in log

        failed_login_count = 0
        alert_key = None
        ip = self.extract_ip(state["log_entry"])

        if has_failed_login:
            user = self.extract_user(state["log_entry"])

            if user and ip:
                key = (user, ip)
                self.failed_logins[key][minute_bucket] += 1

                failed_login_count = sum(
                    count
                    for ts, count in self.failed_logins[key].items()
                    if ts >= window_start
                )

                alert_key = ("failed_login", user, ip)

        elif has_privilege:
            user = self.extract_user(state["log_entry"])
            alert_key = ("privilege_escalation", user)

        elif has_permission_denied and log_type == "error":
            user = self.extract_user(state["log_entry"])
            alert_key = ("permission_denied", user)

        needs_ai = (
            failed_login_count >= 3
            or has_privilege
            or (has_permission_denied and log_type == "error")
        )

        # Suppress duplicate alerts
        if alert_key and alert_key in self.alerted_keys:
            needs_ai = False

        state["failed_login_count"] = failed_login_count
        state["needs_ai"] = needs_ai
        state["alert_key"] = alert_key
        state["ip"] = ip

        if needs_ai:
            state["classification"] = "suspicious"
            state["severity"] = "high"
            state["reason"] = "Security rule threshold exceeded"
        else:
            state["classification"] = "normal"
            state["severity"] = "low"
            state["reason"] = "No anomaly detected"

        return state

    def should_classify(self, state: LogState) -> str:
        return "classify" if state["needs_ai"] else "skip"

    # -------------------- AI ENRICHMENT --------------------

    def classify_with_ai(self, state: LogState) -> LogState:
        prompt = f"""
Analyze this system log and assess security risk.

Log:
{state["log_entry"]}

Respond with JSON only:
{{
  "classification": "normal" or "suspicious",
  "severity": "low" | "medium" | "high",
  "reason": "brief explanation"
}}
"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            text = response.content.lower()

            if "suspicious" in text:
                state["classification"] = "suspicious"
            if "high" in text:
                state["severity"] = "high"
            elif "medium" in text:
                state["severity"] = "medium"

            state["reason"] = response.content

        except Exception as e:
            state["reason"] = f"AI error: {e}"

        return state

    # -------------------- ALERT --------------------

    def emit_alert(self, state: LogState) -> LogState:
        if state["classification"] != "suspicious":
            return state

        key = state.get("alert_key")
        if not key:
            return state

        self.alerted_keys.add(key)
        self.last_seen[key] = datetime.now()

        # Extract username from log entry
        username = self.extract_user(state["log_entry"])

        # Parse log timestamp from log entry
        log_timestamp = self.extract_log_timestamp(state["log_entry"])

        # Generate alert pattern description
        alert_pattern = self.generate_alert_pattern(state["failed_login_count"])

        alert = {
            "agent": "log_analyzer",
            "severity": state["severity"],
            "log_type": state["log_type"],
            "log_entry": state["log_entry"],
            "failed_login_count": state["failed_login_count"],
            "ip": state.get("ip"),  # Include IP address in alert
            "username": username,
            "log_timestamp": log_timestamp.isoformat() if log_timestamp else None,
            "alert_pattern": alert_pattern,
            "reason": state["reason"],
            "recommended_action": "Investigate user activity and access logs",
            "timestamp": datetime.now().isoformat(),
        }

        self.event_bus.emit("log_alert", alert)

        # Assign new list for LangGraph to merge (using operator.add)
        # This prevents duplicates that occur when appending to existing list
        state["alerts"] = [alert]

        return state

    # -------------------- HELPERS --------------------

    def extract_user(self, log: str) -> str:
        """Extract username from log entry."""
        # Try various patterns: user 'admin', user admin, for user 'admin', etc.
        patterns = [
            r"user\s+'?(\w+)'?",
            r"for\s+user\s+'?(\w+)'?",
            r"user\s+(\w+)",
            r"username\s+'?(\w+)'?",
        ]
        for pattern in patterns:
            match = re.search(pattern, log, re.IGNORECASE)
            if match:
                return match.group(1)
        return ""

    def extract_ip(self, log: str) -> Optional[str]:
        """Extract IP address from log entry."""
        # Match IPv4 addresses
        ip_pattern = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
        match = re.search(ip_pattern, log)
        return match.group(0) if match else None

    def extract_log_timestamp(self, log: str) -> Optional[datetime]:
        """Extract timestamp from log entry."""
        # Try various timestamp formats
        patterns = [
            r"(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})",  # 2026-01-05 14:22:15
            r"(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})",  # 01/05/2026 14:22:15
            r"(\w+\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})",  # Jan 5 14:22:15
        ]

        for pattern in patterns:
            match = re.search(pattern, log)
            if match:
                timestamp_str = match.group(1)
                try:
                    # Try ISO format first
                    return datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    try:
                        # Try US format
                        return datetime.strptime(timestamp_str, "%m/%d/%Y %H:%M:%S")
                    except ValueError:
                        try:
                            # Try abbreviated month format
                            return datetime.strptime(timestamp_str, "%b %d %H:%M:%S")
                        except ValueError:
                            pass
        return None

    def generate_alert_pattern(self, failed_login_count: int) -> str:
        """Generate alert pattern description based on failed login count."""
        if failed_login_count == 0:
            return "No failed login pattern detected"
        elif failed_login_count == 1:
            return "1 failed attempt detected"
        elif failed_login_count == 2:
            return "2 failed attempts in 2 minutes"
        elif failed_login_count >= 3:
            return f"{failed_login_count} failed attempts in 2 minutes"
        else:
            return "Multiple failed login attempts detected"


    # -------------------- PUBLIC API --------------------

    def process_log(self, log_entry: str, log_type: str = "auth"):
        initial_state: LogState = {
            "log_entry": log_entry,
            "log_type": log_type,
            "timestamp": datetime.now().isoformat(),
            "failed_login_count": 0,
            "needs_ai": False,
            "classification": "normal",
            "severity": "low",
            "reason": "",
            "alert_key": None,
            "ip": None,
            "alerts": [],
        }

        return self.graph.invoke(initial_state)
