import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.logging import request_logging_middleware, setup_logging
from app.models import *  # noqa: F401,F403
from app.routers import activity, auth, bugs, comments, epics, features, projects, requirements, stats, test_cases, test_runs, users

settings = get_settings()
setup_logging(settings.log_level)

app = FastAPI(title=settings.app_name, version="0.1.0", openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(request_logging_middleware)

app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(projects.router, prefix=settings.api_prefix)
app.include_router(epics.router, prefix=settings.api_prefix)
app.include_router(features.router, prefix=settings.api_prefix)
app.include_router(requirements.router, prefix=settings.api_prefix)
app.include_router(test_cases.router, prefix=settings.api_prefix)
app.include_router(test_runs.router, prefix=settings.api_prefix)
app.include_router(bugs.router, prefix=settings.api_prefix)
app.include_router(comments.router, prefix=settings.api_prefix)
app.include_router(activity.router, prefix=settings.api_prefix)
app.include_router(stats.router, prefix=settings.api_prefix)


@app.on_event("startup")
def startup() -> None:
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Database error", "error": str(exc.__class__.__name__)})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logging.exception("Unhandled application error on %s %s", request.method, request.url.path)
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(status_code=500, content={"detail": "Unexpected error"})
