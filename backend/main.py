"""FastAPI application for security detection agents."""

from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from typing import Optional

from event_bus.event_bus import EventBus
from agents.agent1_traffic_monitor import TrafficMonitor
from agents.agent2_log_analyzer import LogAnalyzer
from agents.agent3_behavior_analyzer import BehaviorAnalyzer
from database.alert_handler import AlertHandler
from database.db import init_db, SessionLocal, get_db
from database.models import Alert, AdminUser
from auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_user_by_email,
    get_user_by_username,
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

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
    # Create default admin user if no users exist
    db = SessionLocal()
    try:
        user_count = db.query(AdminUser).count()
        if user_count == 0:
            default_user = AdminUser(
                username="admin",
                email="admin@security.local",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print("Default admin user created: username='admin', password='admin123'")
    except Exception as e:
        print(f"Error creating default admin user: {e}")
    finally:
        db.close()


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


class AdminRegisterRequest(BaseModel):
    """Request model for admin registration."""
    username: str
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    """Request model for admin login."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Response model for authentication token."""
    access_token: str
    token_type: str = "bearer"


class AdminInfo(BaseModel):
    """Response model for admin user data."""
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool
    created_at: str


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


@app.get("/api/alerts")
async def get_all_alerts():
    """
    Get all alerts from the database.

    This endpoint retrieves all security alerts stored in the database,
    orders them by creation date (newest first), and returns them as JSON.
    The frontend dashboard uses this endpoint to display alerts to users.
    """
    db = SessionLocal()

    try:
        all_alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()

        alerts_list = []

        for alert in all_alerts:
            alert_dict = {
                "id": alert.id,
                "agent": alert.agent,
                "severity": alert.severity,
                "ip": alert.ip,
                "route": alert.route,
                "requests_per_minute": alert.requests_per_minute,
                "failed_login_count": alert.failed_login_count,
                "classification": alert.classification,
                "reason": alert.reason,
                "recommended_action": alert.recommended_action,
                "created_at": alert.created_at.isoformat() if alert.created_at else None
            }
            alerts_list.append(alert_dict)

        return {
            "success": True,
            "alerts": alerts_list,
            "count": len(alerts_list)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

    finally:
        db.close()


@app.get("/api/alerts/{alert_id}/related")
async def get_related_alerts(alert_id: int):
    """
    Get related alerts for a specific alert.

    Returns alerts that are related by:
    - Same IP address
    - Same agent
    - Recent alerts (within last 24 hours)
    """
    db = SessionLocal()

    try:
        current_alert = db.query(Alert).filter(Alert.id == alert_id).first()

        if not current_alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        twenty_four_hours_ago = datetime.now() - timedelta(hours=24)

        related_alerts_query = db.query(Alert).filter(
            Alert.id != alert_id
        ).filter(
            or_(
                and_(Alert.ip.isnot(None), Alert.ip == current_alert.ip),
                Alert.agent == current_alert.agent,
                Alert.created_at >= twenty_four_hours_ago
            )
        ).order_by(Alert.created_at.desc()).limit(10).all()

        related_alerts_list = []

        for alert in related_alerts_query:
            alert_dict = {
                "id": alert.id,
                "agent": alert.agent,
                "severity": alert.severity,
                "ip": alert.ip,
                "route": alert.route,
                "requests_per_minute": alert.requests_per_minute,
                "failed_login_count": alert.failed_login_count,
                "classification": alert.classification,
                "reason": alert.reason,
                "recommended_action": alert.recommended_action,
                "created_at": alert.created_at.isoformat() if alert.created_at else None
            }
            related_alerts_list.append(alert_dict)

        return {
            "success": True,
            "related_alerts": related_alerts_list,
            "count": len(related_alerts_list)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching related alerts: {str(e)}")

    finally:
        db.close()


@app.post("/api/auth/register", response_model=TokenResponse)
async def register_user(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new admin user.

    This endpoint allows creating a new admin user account.
    Username and email must be unique.
    After successful registration, returns a JWT token for immediate authentication.
    """
    # Check if username already exists
    if get_user_by_username(db, payload.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    # Check if email already exists
    if get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Validate password length
    if len(payload.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )

    # Create new user
    hashed_password = get_password_hash(payload.password)
    new_user = AdminUser(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token with user ID
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id)}, expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@app.post("/api/auth/login", response_model=TokenResponse)
async def login_user(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint for admin users.

    Returns a JWT access token that can be used for authenticated requests.
    """
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with user ID
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@app.get("/api/auth/me", response_model=AdminInfo)
async def get_current_user_info(
    current_user: AdminUser = Depends(get_current_admin)
):
    """
    Get current authenticated user information.

    Requires a valid JWT token in the Authorization header.
    """
    return AdminInfo(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at.isoformat() if current_user.created_at else ""
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

