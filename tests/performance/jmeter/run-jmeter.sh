#!/bin/sh
set -eu

output_dir=""
log_file=""
prev=""

for arg in "$@"; do
  if [ "$prev" = "-o" ]; then
    output_dir="$arg"
    prev=""
    continue
  fi
  if [ "$prev" = "-j" ]; then
    log_file="$arg"
    prev=""
    continue
  fi

  case "$arg" in
    -o)
      prev="-o"
      ;;
    -j)
      prev="-j"
      ;;
  esac
done

if [ -n "$output_dir" ]; then
  rm -rf "$output_dir"
  mkdir -p "$output_dir"
fi

if [ -z "$log_file" ]; then
  if [ -n "$output_dir" ]; then
    log_file="${JMETER_LOG_FILE:-reports/jmeter/jmeter.log}"
  else
    log_file="${JMETER_LOG_FILE:-reports/jmeter/jmeter.log}"
  fi
fi

log_dir=$(dirname "$log_file")
mkdir -p "$log_dir"

exec jmeter \
  -j "$log_file" \
  -JbaseHost="${JMETER_BASE_HOST:-backend}" \
  -JbasePort="${JMETER_BASE_PORT:-8000}" \
  -Jprotocol="${JMETER_PROTOCOL:-http}" \
  -JseedUserEmail="${JMETER_SEED_USER_EMAIL:-admin@projecttrace.dev}" \
  -JseedUserPassword="${JMETER_SEED_USER_PASSWORD:-ProjectTrace123!}" \
  "$@"
