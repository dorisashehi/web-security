"""FastAPI application for security detection agents."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from event_bus.event_bus import EventBus
from agents.agent1_traffic_monitor import TrafficMonitor
from agents.agent2_log_analyzer import LogAnalyzer
from agents.agent3_behavior_analyzer import BehaviorAnalyzer
from database.alert_handler import AlertHandler
from database.db import init_db

app = FastAPI(title="Security Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

event_bus = EventBus()
alert_handler = AlertHandler()
event_bus.subscribe(alert_handler)

sensitive_routes = ["/login", "/admin", "/checkout", "/api/auth"]

traffic_agent = TrafficMonitor(event_bus, sensitive_routes)
log_agent = LogAnalyzer(event_bus)
behavior_agent = BehaviorAnalyzer(event_bus)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


class TrafficRequest(BaseModel):
    """Request model for traffic monitoring."""
    ip: str
    route: str
    user_agent: Optional[str] = ""
    geo: Optional[str] = ""
    timestamp: Optional[int] = None


class LogRequest(BaseModel):
    """Request model for log analysis."""
    log_entry: str
    log_type: Optional[str] = "auth"


class BehaviorRequest(BaseModel):
    """Request model for behavior analysis."""
    user_id: str
    route: str
    action: Optional[str] = ""
    location: Optional[str] = ""


class BaselineRequest(BaseModel):
    """Request model for setting user baseline."""
    user_id: str
    normal_routes: list[str]
    normal_times: list[str]
    normal_location: str


class AlertResponse(BaseModel):
    """Response model for alerts."""
    success: bool
    alerts: list
    message: Optional[str] = None


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Security Detection API", "version": "1.0.0"}


@app.post("/api/agent1/traffic", response_model=AlertResponse)
async def receive_traffic_event(request: TrafficRequest):
    """Receive traffic event and process with Agent 1."""
    try:
        result = traffic_agent.process_request(
            ip=request.ip,
            route=request.route,
            user_agent=request.user_agent,
            geo=request.geo
        )

        alerts = result.get("alerts", [])
        return AlertResponse(
            success=True,
            alerts=alerts,
            message="Traffic processed successfully" if not alerts else "Suspicious traffic detected"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent2/logs", response_model=AlertResponse)
async def receive_log_event(request: LogRequest):
    """Receive log event and process with Agent 2."""
    try:
        result = log_agent.process_log(
            log_entry=request.log_entry,
            log_type=request.log_type
        )

        alerts = result.get("alerts", [])
        return AlertResponse(
            success=True,
            alerts=alerts,
            message="Log processed successfully" if not alerts else "Suspicious activity detected"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent3/behavior", response_model=AlertResponse)
async def receive_behavior_event(request: BehaviorRequest):
    """Receive behavior event and process with Agent 3."""
    try:
        result = behavior_agent.process_action(
            user_id=request.user_id,
            route=request.route,
            action=request.action,
            location=request.location
        )

        alerts = result.get("alerts", [])
        return AlertResponse(
            success=True,
            alerts=alerts,
            message="Behavior processed successfully" if not alerts else "Suspicious behavior detected"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent3/baseline")
async def set_user_baseline(request: BaselineRequest):
    """Set baseline behavior profile for a user."""
    try:
        behavior_agent.set_baseline(
            request.user_id,
            request.normal_routes,
            request.normal_times,
            request.normal_location
        )
        return {"success": True, "message": f"Baseline set for user {request.user_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

