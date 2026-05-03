#!/bin/sh
set -eu

: "${K6_BASE_URL:=http://backend:8000/api}"
: "${K6_SERVICE_BASE_URL:=http://backend:8000}"
: "${K6_REPORT_DIR:=reports/k6/latest}"
: "${K6_WEB_DASHBOARD:=true}"
: "${K6_WEB_DASHBOARD_PORT:=-1}"
: "${K6_WEB_DASHBOARD_PERIOD:=250ms}"
: "${K6_WEB_DASHBOARD_EXPORT:=reports/k6/latest/index.html}"
: "${K6_SEED_USER_EMAIL:=admin@projecttrace.dev}"
: "${K6_SEED_USER_PASSWORD:=ProjectTrace123!}"

export \
  K6_BASE_URL \
  K6_SERVICE_BASE_URL \
  K6_REPORT_DIR \
  K6_WEB_DASHBOARD \
  K6_WEB_DASHBOARD_PORT \
  K6_WEB_DASHBOARD_PERIOD \
  K6_WEB_DASHBOARD_EXPORT \
  K6_SEED_USER_EMAIL \
  K6_SEED_USER_PASSWORD

rm -rf "$K6_REPORT_DIR"
mkdir -p "$K6_REPORT_DIR"

exec k6 "$@"
