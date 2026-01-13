"""Agent 1: Network Traffic Monitor - Detects suspicious traffic patterns."""

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

    # Derived values
    requests_last_min: int
    needs_ai: bool
    classification: str
    reason: str

    alerts: Annotated[list, operator.add]


# -------------------- AGENT --------------------

class TrafficMonitor:
    """Monitors network traffic and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus, sensitive_routes: list[str]):
        self.event_bus = event_bus
        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )

        # Stateful, cross-request memory
        self.request_counts = defaultdict[Any, defaultdict[Any, int]](
            lambda: defaultdict(int)
        )

        # Track which IP+route already triggered alerts
        self.alerted_keys: set[tuple[str, str]] = set()
        self.last_seen: dict[tuple[str, str], datetime] = {}

        self.sensitive_routes = sensitive_routes
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

        # Cleanup old alerts (cooldown reset)
        cooldown = timedelta(minutes=5)
        for k, last in list(self.last_seen.items()):
            if now - last > cooldown:
                self.alerted_keys.discard(k)
                del self.last_seen[k]

        return state

    def analyze_traffic(self, state: TrafficState) -> TrafficState:
        ip = state["ip"]
        route = state["route"]
        key = (ip, route)

        now = datetime.now()
        minute_key = now.replace(second=0, microsecond=0)
        requests_last_min = self.request_counts[ip][minute_key]

        is_sensitive = route in self.sensitive_routes
        threshold = 10 if is_sensitive else 50

        crossed_threshold = (
            requests_last_min >= threshold
            and key not in self.alerted_keys
        )

        state["requests_last_min"] = requests_last_min
        state["needs_ai"] = crossed_threshold

        return state

    def should_classify(self, state: TrafficState) -> str:
        if state.get("needs_ai", False):
            return "classify"
        return "skip"

    def classify_with_ai(self, state: TrafficState) -> TrafficState:
        ip = state["ip"]
        route = state["route"]

        prompt = f"""
Analyze this network traffic pattern and classify it as 'normal' or 'suspicious'.

IP: {ip}
Route: {route}
Requests in last minute: {state['requests_last_min']}
User Agent: {state.get('user_agent', '')}
Location: {state.get('geo', '')}

Respond with JSON only:
{{
  "classification": "normal" or "suspicious",
  "reason": "brief explanation"
}}
"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            result = response.content.lower()

            if "suspicious" in result:
                state["classification"] = "suspicious"
            else:
                state["classification"] = "normal"

            state["reason"] = response.content

        except Exception as e:
            state["classification"] = "unknown"
            state["reason"] = f"AI error: {str(e)}"

        return state

    def emit_alert(self, state: TrafficState) -> TrafficState:
        if state.get("classification") == "suspicious":
            key = (state["ip"], state["route"])
            self.alerted_keys.add(key)

            alert_data = {
                "agent": "traffic_monitor",
                "severity": "medium",
                "ip": state["ip"],
                "route": state["route"],
                "requests_per_minute": state["requests_last_min"],
                "reason": state.get("reason", ""),
                "recommended_action": "Block IP / Investigate",
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
            "alerts": [],
        }

        return self.graph.invoke(initial_state)
