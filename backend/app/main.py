import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

from app.config import settings
from app.db import Base, engine
import app.models.portfolio  # noqa: F401 — register models with Base.metadata
from app.routes import history, portfolio, prices
from app.ws.manager import ConnectionManager
from app.ws.price_stream import price_broadcast_loop

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    manager = ConnectionManager()
    app.state.ws_manager = manager
    task = asyncio.create_task(price_broadcast_loop(manager))
    logger.info("Started price broadcast task")
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Market dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices.router, prefix="/api", tags=["prices"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(portfolio.router, prefix="/api", tags=["portfolio"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws/prices")
async def ws_prices(websocket: WebSocket) -> None:
    manager: ConnectionManager = websocket.app.state.ws_manager
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
