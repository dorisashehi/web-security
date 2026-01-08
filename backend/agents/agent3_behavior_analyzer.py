"""Agent 3: User Behavior Analyzer - Detects suspicious user behavior patterns."""

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


class BehaviorState(TypedDict):
    """State for behavior analysis agent."""
    user_id: str
    route: str
    action: str
    timestamp: str
    location: str
    session_actions: Annotated[list, operator.add]
    alerts: Annotated[list, operator.add]


class BehaviorAnalyzer:
    """Analyzes user behavior and detects suspicious patterns."""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        api_key = os.getenv("GROQ_API_KEY")
        self.llm = ChatGroq(model_name="llama-3.1-8b-instant", groq_api_key=api_key)
        self.user_sessions = defaultdict(list)
        self.user_baselines = {}
        self.user_locations = defaultdict(list)
        self.graph = self.build_graph()

    def build_graph(self):
        """Build the LangGraph workflow."""
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
                "skip": END
            }
        )
        workflow.add_edge("classify", "alert")
        workflow.add_edge("alert", END)

        return workflow.compile()

    def collect_action(self, state: BehaviorState) -> BehaviorState:
        """Collect user action data."""
        action_data = {
            "route": state["route"],
            "action": state.get("action", ""),
            "timestamp": state["timestamp"],
            "location": state.get("location", "")
        }

        user_id = state["user_id"]
        self.user_sessions[user_id].append(action_data)

        if state.get("location"):
            location_entry = {
                "location": state["location"],
                "timestamp": state["timestamp"]
            }
            self.user_locations[user_id].append(location_entry)
            if len(self.user_locations[user_id]) > 10:
                self.user_locations[user_id].pop(0)

        if len(self.user_sessions[user_id]) > 50:
            self.user_sessions[user_id].pop(0)

        state["session_actions"] = [action_data]
        print(self.user_sessions[user_id])
        return state

    def analyze_behavior(self, state: BehaviorState) -> BehaviorState:
        """Analyze behavior patterns for anomalies."""
        user_id = state["user_id"]
        route = state["route"]
        timestamp_str = state["timestamp"]
        location = state.get("location", "")

        try:
            timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            hour = timestamp.hour
        except Exception:
            hour = datetime.now().hour

        session = self.user_sessions[user_id]
        recent_actions = session[-10:] if len(session) >= 10 else session

        action_count = len(recent_actions)
        time_diff = 0
        if len(recent_actions) >= 2:
            try:
                first_time = datetime.fromisoformat(recent_actions[0]["timestamp"].replace("Z", "+00:00"))
                last_time = datetime.fromisoformat(recent_actions[-1]["timestamp"].replace("Z", "+00:00"))
                time_diff = (last_time - first_time).total_seconds()
            except Exception:
                pass

        clicks_per_minute = (action_count / max(time_diff / 60, 0.1)) if time_diff > 0 else 0

        is_odd_hour = hour < 6 or hour > 22
        is_sensitive_route = route in ["/admin", "/settings", "/api/admin", "/transfer", "/delete"]
        is_high_click_rate = clicks_per_minute > 100
        is_bot_like = clicks_per_minute > 50 and len(recent_actions) > 5

        impossible_travel = False
        if location and len(self.user_locations[user_id]) >= 2:
            last_location = self.user_locations[user_id][-2]["location"]
            last_time = datetime.fromisoformat(
                self.user_locations[user_id][-2]["timestamp"].replace("Z", "+00:00")
            )
            current_time = timestamp
            time_diff_minutes = (current_time - last_time).total_seconds() / 60

            if last_location != location and time_diff_minutes < 30:
                impossible_travel = True

        baseline = self.user_baselines.get(user_id, {})
        deviates_from_baseline = False
        if baseline:
            normal_routes = baseline.get("normal_routes", [])
            normal_times = baseline.get("normal_times", [])
            if route not in normal_routes or is_odd_hour:
                deviates_from_baseline = True

        state["clicks_per_minute"] = clicks_per_minute
        state["is_odd_hour"] = is_odd_hour
        state["is_sensitive_route"] = is_sensitive_route
        state["is_high_click_rate"] = is_high_click_rate
        state["is_bot_like"] = is_bot_like
        state["impossible_travel"] = impossible_travel
        state["deviates_from_baseline"] = deviates_from_baseline
        state["needs_ai"] = (
            is_high_click_rate or
            is_bot_like or
            impossible_travel or
            (is_sensitive_route and deviates_from_baseline) or
            (is_odd_hour and is_sensitive_route)
        )

        return state

    def should_classify(self, state: BehaviorState) -> str:
        """Decide if AI classification is needed."""
        if state.get("needs_ai", False):
            return "classify"
        return "skip"

    def classify_with_ai(self, state: BehaviorState) -> BehaviorState:
        """Use AI to classify behavior patterns."""
        if not self.llm:
            state["classification"] = "unknown"
            state["reasoning"] = "AI not configured"
            return state

        user_id = state["user_id"]
        session = self.user_sessions[user_id]
        recent_actions = session[-10:] if len(session) >= 10 else session

        baseline = self.user_baselines.get(user_id, {
            "normal_routes": ["/home", "/profile", "/shop"],
            "normal_times": ["08:00-18:00"],
            "normal_location": "Unknown"
        })

        locations = [loc["location"] for loc in self.user_locations[user_id][-5:]] if user_id in self.user_locations else []

        session_summary = "\n".join([
            f"{i+1}. {action['route']} at {action['timestamp']}"
            for i, action in enumerate(recent_actions[-5:])
        ])

        prompt = f"""Analyze this user behavior and classify it as 'normal' or 'suspicious'.

User ID: {user_id}
Recent Actions:
{session_summary}

Current Action:
- Route: {state['route']}
- Time: {state['timestamp']}
- Location: {state.get('location', 'Unknown')}
- Clicks per minute: {state.get('clicks_per_minute', 0):.1f}

Baseline Profile:
- Normal routes: {baseline.get('normal_routes', [])}
- Normal times: {baseline.get('normal_times', [])}
- Normal location: {baseline.get('normal_location', 'Unknown')}

Recent locations: {locations}

Flags detected:
- Odd hour access: {state.get('is_odd_hour', False)}
- Sensitive route: {state.get('is_sensitive_route', False)}
- High click rate: {state.get('is_high_click_rate', False)}
- Bot-like behavior: {state.get('is_bot_like', False)}
- Impossible travel: {state.get('impossible_travel', False)}
- Deviates from baseline: {state.get('deviates_from_baseline', False)}

Respond with JSON only:
{{
    "classification": "normal" or "suspicious",
    "reasoning": "brief explanation of why this behavior is normal or suspicious"
}}"""

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            result = response.content

            state["reasoning"] = result

            if "suspicious" in result.lower():
                state["classification"] = "suspicious"
            else:
                state["classification"] = "normal"

        except Exception as e:
            state["classification"] = "unknown"
            state["reasoning"] = f"AI error: {str(e)}"

        return state

    def emit_alert(self, state: BehaviorState) -> BehaviorState:
        """Emit alert if suspicious behavior detected."""
        if state.get("classification") == "suspicious":
            alert_data = {
                "agent": "behavior_analyzer",
                "severity": "high" if state.get("impossible_travel") or state.get("is_bot_like") else "medium",
                "user_id": state["user_id"],
                "route": state["route"],
                "clicks_per_minute": round(state.get("clicks_per_minute", 0), 1),
                "impossible_travel": state.get("impossible_travel", False),
                "bot_like": state.get("is_bot_like", False),
                "reasoning": state.get("reasoning", ""),
                "recommended_action": "Temporarily lock account / Investigate"
            }

            self.event_bus.emit("behavior_alert", alert_data)
            state["alerts"] = [alert_data]

        return state

    def process_action(self, user_id: str, route: str, action: str = "", location: str = ""):
        """Process a user action."""
        initial_state = {
            "user_id": user_id,
            "route": route,
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "location": location,
            "session_actions": [],
            "alerts": []
        }

        result = self.graph.invoke(initial_state)
        return result

    def set_baseline(self, user_id: str, normal_routes: list, normal_times: list, normal_location: str):
        """Set baseline behavior profile for a user."""
        self.user_baselines[user_id] = {
            "normal_routes": normal_routes,
            "normal_times": normal_times,
            "normal_location": normal_location
        }

