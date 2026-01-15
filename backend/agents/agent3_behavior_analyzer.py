"""
Agent 3: User Behavior Analyzer
Detects suspicious user behavior patterns and emits alerts with cooldown.
"""

from typing import TypedDict, Annotated
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


# -------------------- STATE --------------------

class BehaviorState(TypedDict):
    user_id: str
    route: str
    action: str
    timestamp: str
    location: str

    # Derived
    clicks_per_minute: float
    is_sensitive_route: bool
    is_bot_like: bool
    is_odd_hour: bool
    impossible_travel: bool
    deviates_from_baseline: bool
    needs_ai: bool
    classification: str
    reasoning: str

    session_actions: Annotated[list, operator.add]
    alerts: Annotated[list, operator.add]


# -------------------- AGENT --------------------

class BehaviorAnalyzer:
    """Analyzes user behavior and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

        self.llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )

        # Stateful memory
        self.user_sessions = defaultdict(list)
        self.user_locations = defaultdict(list)
        self.user_baselines = {}

        # Alert deduplication
        self.alerted_users: set[str] = set()
        self.last_alert_time: dict[str, datetime] = {}
        self.alert_cooldown = timedelta(minutes=10)

        self.sensitive_routes = {
            "/admin",
            "/settings",
            "/api/admin",
            "/transfer",
            "/delete",
        }

        self.graph = self.build_graph()

    # -------------------- GRAPH --------------------

    def build_graph(self):
        workflow = StateGraph(BehaviorState)

        workflow.add_node("collect", self.collect_action)
        workflow.add_node("analyze", self.analyze_behavior)
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

    def collect_action(self, state: BehaviorState) -> BehaviorState:
        """Collect user action and maintain rolling session."""
        now = datetime.now()

        user_id = state["user_id"]

        action_data = {
            "route": state["route"],
            "action": state.get("action", ""),
            "timestamp": state["timestamp"],
            "location": state.get("location", ""),
        }

        self.user_sessions[user_id].append(action_data)
        if len(self.user_sessions[user_id]) > 20:
            self.user_sessions[user_id].pop(0)

        if state.get("location"):
            self.user_locations[user_id].append({
                "location": state["location"],
                "timestamp": state["timestamp"],
            })
            if len(self.user_locations[user_id]) > 10:
                self.user_locations[user_id].pop(0)

        # Cleanup expired alert cooldowns
        for uid, last_time in list(self.last_alert_time.items()):
            if now - last_time > self.alert_cooldown:
                self.alerted_users.discard(uid)
                del self.last_alert_time[uid]

        state["session_actions"] = [action_data]
        return state

    def analyze_behavior(self, state: BehaviorState) -> BehaviorState:
        """Analyze behavior heuristics."""
        user_id = state["user_id"]
        route = state["route"]
        location = state.get("location", "")

        session = self.user_sessions[user_id]
        recent_actions = session[-10:]

        # --- Time-based checks ---
        try:
            timestamp = datetime.fromisoformat(state["timestamp"])
            hour = timestamp.hour
        except Exception:
            hour = datetime.now().hour

        is_odd_hour = hour < 6 or hour > 22
        is_sensitive_route = route in self.sensitive_routes

        # --- API-safe behavior checks ---
        is_high_click_rate = len(recent_actions) >= 8
        is_bot_like = len(recent_actions) >= 5 and is_sensitive_route

        # --- Impossible travel ---
        impossible_travel = False
        if location and len(self.user_locations[user_id]) >= 2:
            prev = self.user_locations[user_id][-2]
            try:
                prev_time = datetime.fromisoformat(prev["timestamp"])
                curr_time = datetime.fromisoformat(state["timestamp"])
                minutes = (curr_time - prev_time).total_seconds() / 60
                if prev["location"] != location and minutes < 30:
                    impossible_travel = True
            except Exception:
                pass

        # --- Baseline logic ---
        baseline = self.user_baselines.get(user_id)
        if baseline is None:
            deviates_from_baseline = True
        else:
            deviates_from_baseline = (
                route not in baseline.get("normal_routes", []) or is_odd_hour
            )

        state.update({
            "clicks_per_minute": float(len(recent_actions)),
            "is_sensitive_route": is_sensitive_route,
            "is_bot_like": is_bot_like,
            "is_odd_hour": is_odd_hour,
            "impossible_travel": impossible_travel,
            "deviates_from_baseline": deviates_from_baseline,
            "needs_ai": (
                is_bot_like
                or impossible_travel
                or (is_sensitive_route and deviates_from_baseline)
            ),
        })

        return state

    def should_classify(self, state: BehaviorState) -> str:
        return "classify" if state.get("needs_ai") else "skip"

    def classify_with_ai(self, state: BehaviorState) -> BehaviorState:
        """AI classification."""
        user_id = state["user_id"]
        recent = self.user_sessions[user_id][-5:]

        session_summary = "\n".join(
            f"- {a['route']} at {a['timestamp']}" for a in recent
        )

        prompt = f"""
Analyze this user behavior and classify it as 'normal' or 'suspicious'.

User ID: {user_id}

Recent Actions:
{session_summary}

Flags:
- Sensitive route: {state['is_sensitive_route']}
- Bot-like behavior: {state['is_bot_like']}
- Odd hour: {state['is_odd_hour']}
- Impossible travel: {state['impossible_travel']}
- Baseline deviation: {state['deviates_from_baseline']}

Respond with JSON only:
{{
  "classification": "normal" or "suspicious",
  "reasoning": "brief explanation"
}}
"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            content = response.content.lower()

            state["reasoning"] = response.content
            state["classification"] = (
                "suspicious" if "suspicious" in content else "normal"
            )

        except Exception as e:
            state["classification"] = "unknown"
            state["reasoning"] = f"AI error: {str(e)}"

        return state

    def emit_alert(self, state: BehaviorState) -> BehaviorState:
        """Emit alert once per user within cooldown."""
        user_id = state["user_id"]

        if (
            state.get("classification") == "suspicious"
            and user_id not in self.alerted_users
        ):
            self.alerted_users.add(user_id)
            self.last_alert_time[user_id] = datetime.now()

            alert_data = {
                "agent": "behavior_analyzer",
                "severity": "high"
                if state.get("impossible_travel") or state.get("is_bot_like")
                else "medium",
                "user_id": user_id,
                "route": state["route"],
                "reasoning": state.get("reasoning", ""),
                "recommended_action": "Temporarily lock account / Investigate",
            }

            self.event_bus.emit("behavior_alert", alert_data)
            state["alerts"] = [alert_data]

        return state

    # -------------------- PUBLIC API --------------------

    def process_action(
        self,
        user_id: str,
        route: str,
        action: str = "",
        location: str = "",
    ):
        initial_state: BehaviorState = {
            "user_id": user_id,
            "route": route,
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "location": location,
            "session_actions": [],
            "alerts": [],
        }

        return self.graph.invoke(initial_state)

    def set_baseline(
        self,
        user_id: str,
        normal_routes: list,
        normal_times: list,
        normal_location: str,
    ):
        self.user_baselines[user_id] = {
            "normal_routes": normal_routes,
            "normal_times": normal_times,
            "normal_location": normal_location,
        }
