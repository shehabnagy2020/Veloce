from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.storage_path, "photos").mkdir(parents=True, exist_ok=True)
    Path(settings.storage_path, "voice_notes").mkdir(parents=True, exist_ok=True)
    Path(settings.storage_path, "documents").mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="Veloce",
    description="Car Marketplace API for the Egyptian market",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

storage_dir = Path(settings.storage_path)
storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(storage_dir)), name="storage")

# Mount Socket.IO ASGI app
from app.websocket.chat import sio
import socketio

asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

from app.api import auth, listings, messaging, admin, quiz  # noqa: E402
from app.api.deps import get_db  # noqa: E402
from app.api.vin import router as vin_router  # noqa: E402

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["listings"])
app.include_router(vin_router, prefix="/api/v1/vin", tags=["vin"])
app.include_router(messaging.router, prefix="/api/v1/conversations", tags=["messaging"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["quiz"])