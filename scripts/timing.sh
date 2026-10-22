#!/usr/bin/env bash
# Phase timing for the Git gates. `timed` appends one JSON line per phase to
# CHECK_TIMINGS_FILE when it is set; scripts/check-timings.mjs renders the runs.

timed() {
  local name=$1 start=$EPOCHREALTIME status=0
  shift
  "$@" || status=$?
  if [[ -n "${CHECK_TIMINGS_FILE:-}" ]]; then
    printf '{"group":"%s","step":"%s","start":%s,"end":%s,"status":%d}\n' \
      "${CHECK_TIMINGS_GROUP:-}" "$name" "$start" "$EPOCHREALTIME" "$status" >>"$CHECK_TIMINGS_FILE"
  fi
  return "$status"
}
