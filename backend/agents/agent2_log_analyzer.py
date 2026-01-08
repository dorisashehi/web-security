"""Agent 2: System Log Analyzer - Detects suspicious activity in system logs."""

from typing import TypedDict, Annotated
from datetime import datetime, timedelta
from collections import defaultdict
import operator
import os
import re
from dotenv import load_dotenv
from langchain_groq import ChatGroq

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

from event_bus.event_bus import EventBus

load_dotenv()


class LogState(TypedDict):
    """State for log analysis agent."""
    log_entry: str
    log_type: str
    timestamp: str
    log_buffer: Annotated[list, operator.add]
    alerts: Annotated[list, operator.add]


class LogAnalyzer:
    """Analyzes system logs and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        api_key = os.getenv("GROQ_API_KEY")
        self.llm = ChatGroq(model_name="llama-3.1-8b-instant", groq_api_key=api_key)
        self.failed_logins = defaultdict(lambda: defaultdict(int))
        self.log_buffer = []
        self.buffer_size = 10
        self.graph = self.build_graph()

    def build_graph(self):
        """Build the LangGraph workflow."""
        workflow = StateGraph(LogState)

        workflow.add_node("collect", self.collect_log)
        workflow.add_node("analyze", self.analyze_patterns)
        workflow.add_node("classify", self.classify_with_ai)
        workflow.add_node("alert", self.emit_alert)

        workflow.set_entry_point("collect")
        workflow.add_edge("collect", "analyze")
        workflow.add_conditional_edges(
            "analyze",
            self.should_classify,
            {
                "classify": "classify",
                "skip": END
            }
        )
        workflow.add_edge("classify", "alert")
        workflow.add_edge("alert", END)

        return workflow.compile()

    def collect_log(self, state: LogState) -> LogState:
        """Collect incoming log entry."""
        log_data = {
            "entry": state["log_entry"],
            "type": state["log_type"],
            "timestamp": state["timestamp"]
        }

        self.log_buffer.append(log_data)
        if len(self.log_buffer) > self.buffer_size:
            self.log_buffer.pop(0)

        state["log_buffer"] = [log_data]
        print(self.log_buffer)
        return state

    def analyze_patterns(self, state: LogState) -> LogState:
        """Analyze log patterns for anomalies."""
        log_entry = state["log_entry"].lower()
        log_type = state["log_type"]
        now = datetime.now()
        window_start = now - timedelta(minutes=2)

        has_failed_login = "failed login" in log_entry or "login failed" in log_entry
        has_privilege_escalation = "escalate" in log_entry or "privilege" in log_entry
        has_permission_denied = "permission denied" in log_entry or "unauthorized" in log_entry

        failed_login_count = 0
        if has_failed_login:
            user = self.extract_user(log_entry)
            ip = self.extract_ip(log_entry)
            if user and ip:
                key = f"{user}:{ip}"
                self.failed_logins[key][now] += 1
                failed_login_count = sum(
                    count for timestamp, count in self.failed_logins[key].items()
                    if timestamp >= window_start
                )

        state["has_failed_login"] = has_failed_login
        state["has_privilege_escalation"] = has_privilege_escalation
        state["has_permission_denied"] = has_permission_denied
        state["failed_login_count"] = failed_login_count
        state["needs_ai"] = (
            failed_login_count >= 3 or
            has_privilege_escalation or
            (has_permission_denied and log_type == "error")
        )

        return state

    def extract_user(self, log_entry: str) -> str:
        """Extract username from log entry."""
        patterns = [
            r"user\s+['\"]?(\w+)['\"]?",
            r"for\s+user\s+['\"]?(\w+)['\"]?",
            r"user\s+['\"]?(\w+)['\"]?\s+",
        ]
        for pattern in patterns:
            match = re.search(pattern, log_entry, re.IGNORECASE)
            if match:
                return match.group(1)
        return ""

    def extract_ip(self, log_entry: str) -> str:
        """Extract IP address from log entry."""
        ip_pattern = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
        match = re.search(ip_pattern, log_entry)
        if match:
            return match.group(0)
        return ""

    def should_classify(self, state: LogState) -> str:
        """Decide if AI classification is needed."""
        if state.get("needs_ai", False):
            return "classify"
        return "skip"

    def classify_with_ai(self, state: LogState) -> LogState:
        """Use AI to analyze and classify log patterns."""
        if not self.llm:
            state["classification"] = "unknown"
            state["summary"] = "AI not configured"
            return state

        recent_logs = self.log_buffer[-5:]
        logs_text = "\n".join([
            f"{i+1}. [{log['type']}] {log['entry']}"
            for i, log in enumerate(recent_logs)
        ])

        prompt = f"""Analyze these system logs and identify security anomalies.

Logs:
{logs_text}

Respond with JSON only:
{{
    "anomalies": [
        {{
            "type": "anomaly type",
            "details": "description",
            "severity": "low/medium/high"
        }}
    ],
    "summary": "brief summary of suspicious activity"
}}"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            result = response.content

            state["summary"] = result

            if "high" in result.lower() or "suspicious" in result.lower():
                state["classification"] = "suspicious"
                state["severity"] = "high" if "high" in result.lower() else "medium"
            else:
                state["classification"] = "normal"
                state["severity"] = "low"

        except Exception as e:
            state["classification"] = "unknown"
            state["summary"] = f"AI error: {str(e)}"
            state["severity"] = "low"

        return state

    def emit_alert(self, state: LogState) -> LogState:
        """Emit alert if suspicious activity detected."""
        if state.get("classification") == "suspicious":
            alert_data = {
                "agent": "log_analyzer",
                "severity": state.get("severity", "medium"),
                "log_type": state["log_type"],
                "log_entry": state["log_entry"],
                "summary": state.get("summary", ""),
                "failed_login_count": state.get("failed_login_count", 0),
                "recommended_action": "Investigate user account / Review access logs"
            }

            self.event_bus.emit("log_alert", alert_data)
            state["alerts"] = [alert_data]

        return state

    def process_log(self, log_entry: str, log_type: str = "auth"):
        """Process a log entry."""
        initial_state = {
            "log_entry": log_entry,
            "log_type": log_type,
            "timestamp": datetime.now().isoformat(),
            "log_buffer": [],
            "alerts": []
        }

        result = self.graph.invoke(initial_state)
        return result
