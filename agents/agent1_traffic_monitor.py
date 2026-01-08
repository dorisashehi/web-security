"""Agent 1: Network Traffic Monitor - Detects suspicious traffic patterns."""

from typing import Any, TypedDict, Annotated
from datetime import datetime, timedelta
from collections import defaultdict
import operator
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

from event_bus.event_bus import EventBus

load_dotenv()
class TrafficState(TypedDict):
    """State for traffic monitoring agent."""
    ip: str
    route: str
    user_agent: str
    geo: str
    timestamp: str
    request_history: Annotated[list, operator.add]
    alerts: Annotated[list, operator.add]


class TrafficMonitor:
    """Monitors network traffic and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus, sensitive_routes: list[str]):
        self.event_bus = event_bus
        self.llm = ChatGroq(model_name="llama-3.1-8b-instant",groq_api_key=os.getenv("GROQ_API_KEY"))
        self.request_counts = defaultdict[Any, defaultdict[Any, int]](lambda: defaultdict(int))
        self.sensitive_routes = sensitive_routes
        self.graph = self.build_graph()

    def build_graph(self):
        """Build the LangGraph workflow."""
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
                "skip": END
            }
        )
        workflow.add_edge("classify", "alert")
        workflow.add_edge("alert", END)

        return workflow.compile()

    def collect_request(self, state: TrafficState) -> TrafficState:
        """Collect incoming request data."""
        now = datetime.now()
        minute_key = now.replace(second=0, microsecond=0)

        request_data = {
            "ip": state["ip"],
            "route": state["route"],
            "timestamp": state["timestamp"],
            "user_agent": state.get("user_agent", ""),
            "geo": state.get("geo", "")
        }

        self.request_counts[state["ip"]][minute_key] += 1

        state["request_history"] = [request_data]
        print(self.request_counts)
        return state

    def analyze_traffic(self, state: TrafficState) -> TrafficState:
        """Analyze traffic patterns for anomalies."""
        ip = state["ip"]
        route = state["route"]
        now = datetime.now()
        minute_key = now.replace(second=0, microsecond=0)

        requests_last_min = self.request_counts[ip][minute_key]

        is_sensitive = route in self.sensitive_routes
        is_high_rate = requests_last_min > 50

        state["requests_last_min"] = requests_last_min
        state["is_sensitive"] = is_sensitive
        state["is_high_rate"] = is_high_rate
        state["needs_ai"] = is_high_rate or (is_sensitive and requests_last_min > 10)

        return state

    def should_classify(self, state: TrafficState) -> str:
        """Decide if AI classification is needed."""
        if state.get("needs_ai", False):
            return "classify"
        return "skip"

    def classify_with_ai(self, state: TrafficState) -> TrafficState:
        """Use AI to classify traffic patterns."""
        if not self.llm:
            state["classification"] = "unknown"
            state["reason"] = "AI not configured"
            return state

        ip = state["ip"]
        route = state["route"]
        requests = state.get("requests_last_min", 0)
        user_agent = state.get("user_agent", "")
        geo = state.get("geo", "")

        prompt = f"""Analyze this network traffic pattern and classify it as 'normal' or 'suspicious'.

IP: {ip}
Route: {route}
Requests in last minute: {requests}
User Agent: {user_agent}
Location: {geo}

Respond with JSON only:
{{
    "classification": "normal" or "suspicious",
    "reason": "brief explanation"
}}"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            result = response.content

            if "suspicious" in result.lower():
                state["classification"] = "suspicious"
            else:
                state["classification"] = "normal"

            state["reason"] = result
        except Exception as e:
            state["classification"] = "unknown"
            state["reason"] = f"AI error: {str(e)}"

        return state

    def emit_alert(self, state: TrafficState) -> TrafficState:
        """Emit alert if traffic is suspicious."""
        if state.get("classification") == "suspicious":
            alert_data = {
                "agent": "traffic_monitor",
                "severity": "medium",
                "ip": state["ip"],
                "route": state["route"],
                "requests_per_minute": state.get("requests_last_min", 0),
                "reason": state.get("reason", ""),
                "recommended_action": "Block IP / Investigate"
            }

            self.event_bus.emit("traffic_alert", alert_data)
            state["alerts"] = [alert_data]

        return state

    def process_request(self, ip: str, route: str, user_agent: str = "", geo: str = ""):
        """Process an incoming request."""
        initial_state = {
            "ip": ip,
            "route": route,
            "user_agent": user_agent,
            "geo": geo,
            "timestamp": datetime.now().isoformat(),
            "request_history": [],
            "alerts": []
        }

        result = self.graph.invoke(initial_state)
        return result

