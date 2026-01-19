from typing import Any, TypedDict, Annotated
from datetime import datetime, timedelta
from collections import defaultdict
import operator
import os
import json

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

from event_bus.event_bus import EventBus

load_dotenv()


# -------------------- STATE --------------------

class TrafficState(TypedDict):
    ip: str
    route: str
    user_agent: str
    geo: str
    timestamp: str

    requests_last_min: int
    needs_ai: bool
    classification: str
    reason: str
    recommended_action: str

    alerts: Annotated[list, operator.add]


# -------------------- AGENT --------------------

class TrafficMonitor:
    """Monitors network traffic and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus, sensitive_routes: list[str]):
        self.event_bus = event_bus
        self.sensitive_routes = sensitive_routes

        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )

        # request counts per IP per minute
        self.request_counts = defaultdict[Any, defaultdict[Any, int]](
            lambda: defaultdict(int)
        )

        # alert cooldown tracking
        self.alerted_keys: set[tuple[str, str]] = set()
        self.last_seen: dict[tuple[str, str], datetime] = {}

        self.graph = self.build_graph()

    # -------------------- GRAPH --------------------

    def build_graph(self):
        workflow = StateGraph(TrafficState)

        workflow.add_node("collect", self.collect_request)
        workflow.add_node("analyze", self.analyze_traffic)
        workflow.add_node("classify", self.classify_with_ai)
        workflow.add_node("alert", self.emit_alert)

        workflow.set_entry_point("collect")
        workflow.add_edge("collect", "analyze")
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

    # -------------------- NODES --------------------

    def collect_request(self, state: TrafficState) -> TrafficState:
        now = datetime.now()
        minute_key = now.replace(second=0, microsecond=0)

        key = (state["ip"], state["route"])

        self.request_counts[state["ip"]][minute_key] += 1
        self.last_seen[key] = now

        # cooldown cleanup
        cooldown = timedelta(minutes=5)
        for k, last in list(self.last_seen.items()):
            if now - last > cooldown:
                self.alerted_keys.discard(k)
                del self.last_seen[k]

        return state

    def analyze_traffic(self, state: TrafficState) -> TrafficState:
        ip = state["ip"]
        route = state["route"]

        now = datetime.now()
        minute_key = now.replace(second=0, microsecond=0)
        rpm = self.request_counts[ip][minute_key]

        is_sensitive = route in self.sensitive_routes
        threshold = 10 if is_sensitive else 50

        state["requests_last_min"] = rpm
        state["needs_ai"] = (
            rpm >= threshold and (ip, route) not in self.alerted_keys
        )

        return state

    def should_classify(self, state: TrafficState) -> str:
        return "classify" if state.get("needs_ai") else "skip"

    def classify_with_ai(self, state: TrafficState) -> TrafficState:
        ip = state["ip"]
        route = state["route"]
        rpm = state["requests_last_min"]
        user_agent = state.get("user_agent", "Unknown")
        geo = state.get("geo", "Unknown")

        is_sensitive = route in self.sensitive_routes
        threshold = 10 if is_sensitive else 50

        prompt = f"""
    You are a security analysis system.

    Analyze the following network traffic and respond with JSON ONLY.
    Do not include markdown, explanations, or extra text.
    Do not include placeholders, variables, or curly braces in values.

    The response MUST be valid JSON and MUST follow this exact schema:

    {{
    "classification": "normal or suspicious",
    "reason": "Short plain-text explanation of why the traffic is normal or suspicious.",
    "recommended_action": "Plain-text remediation steps. Keep the formatting with newlines, numbered lists, and headings (PRIORITY LEVEL, PRIMARY ACTION, WHY, STEPS, ALTERNATIVE ACTION, VERIFICATION, CONSIDERATIONS, RELATED ACTIONS)."
    }}

    TRAFFIC DETAILS:
    IP Address: {ip}
    Route: {route}
    Requests in last minute: {rpm}
    Threshold: {threshold} requests per minute
    Route sensitivity: {"Sensitive" if is_sensitive else "Normal"}
    User Agent: {user_agent}
    Geographic Location: {geo}
    """

        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()

        try:
            # Extract JSON safely
            json_str = content[content.find("{"): content.rfind("}") + 1]
            parsed = json.loads(json_str)

            state["classification"] = str(parsed.get("classification", "unknown")).lower().strip()
            state["reason"] = str(parsed.get("reason", "")).strip()

            # Preserve the formatting exactly as returned by AI
            recommended_action = parsed.get("recommended_action", "")
            # Remove any extra leading/trailing whitespace
            state["recommended_action"] = recommended_action.strip()

            # Safety guard against braces inside content
            if "{" in state["reason"] or "}" in state["reason"]:
                raise ValueError("Unsafe braces detected in reason")
            if "{" in state["recommended_action"] or "}" in state["recommended_action"]:
                raise ValueError("Unsafe braces detected in recommended_action")

        except Exception as e:
            state["classification"] = "unknown"
            state["reason"] = f"AI parsing error: {e}"
            state["recommended_action"] = ""

        return state

    def emit_alert(self, state: TrafficState) -> TrafficState:
        if state["classification"] != "suspicious":
            return state

        key = (state["ip"], state["route"])
        self.alerted_keys.add(key)

        alert_data = {
            "agent": "traffic_monitor",
            "severity": "medium",
            "ip": state["ip"],
            "route": state["route"],
            "requests_per_minute": state["requests_last_min"],
            "classification": state["classification"],
            "reason": state["reason"],
            "recommended_action": state["recommended_action"],
            "user_agent": state.get("user_agent"),
            "geo": state.get("geo"),
            "detection_timestamp": state["timestamp"],
        }

        self.event_bus.emit("traffic_alert", alert_data)
        state["alerts"] = [alert_data]

        return state

    # -------------------- PUBLIC API --------------------

    def process_request(
        self,
        ip: str,
        route: str,
        user_agent: str = "",
        geo: str = "",
    ):
        initial_state: TrafficState = {
            "ip": ip,
            "route": route,
            "user_agent": user_agent,
            "geo": geo,
            "timestamp": datetime.now().isoformat(),
            "requests_last_min": 0,
            "needs_ai": False,
            "classification": "",
            "reason": "",
            "recommended_action": "",
            "alerts": [],
        }

        return self.graph.invoke(initial_state)
