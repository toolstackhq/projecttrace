import logging
import time
from collections.abc import Callable

from fastapi import Request, Response


def setup_logging(level: str) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


async def request_logging_middleware(
    request: Request, call_next: Callable[[Request], Response]
) -> Response:
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    logging.getLogger("projecttrace.request").info(
        "%s %s %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.2f}"
    return response

