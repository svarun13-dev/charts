"""AstroTrader API - Main FastAPI Application"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import planets, signals, market, moon, system, insights


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown"""
    # Startup
    print(f"🌟 Starting {settings.app_name} v{settings.app_version}")
    print("✨ Planetary calculation engine initialized")
    yield
    # Shutdown
    print("🌙 Shutting down AstroTrader...")


app = FastAPI(
    title=settings.app_name,
    description="Zodiac & Planetary Position Trading Platform - Combining Western and Vedic astrology with market analysis",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    planets.router,
    prefix=f"{settings.api_v1_prefix}/planets",
    tags=["Planets"],
)

app.include_router(
    moon.router,
    prefix=f"{settings.api_v1_prefix}/moon",
    tags=["Moon"],
)

app.include_router(
    signals.router,
    prefix=f"{settings.api_v1_prefix}/signals",
    tags=["Signals"],
)

app.include_router(
    market.router,
    prefix=f"{settings.api_v1_prefix}/market",
    tags=["Market"],
)

app.include_router(
    system.router,
    prefix=f"{settings.api_v1_prefix}/system",
    tags=["System"],
)

app.include_router(
    insights.router,
    prefix=f"{settings.api_v1_prefix}/insights",
    tags=["Insights"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "Zodiac & Planetary Position Trading Platform",
        "docs": "/docs",
        "systems": ["western", "vedic"],
        "markets": ["crypto", "stocks", "commodities"],
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": settings.app_name}
