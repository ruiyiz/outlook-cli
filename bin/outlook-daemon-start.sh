#!/usr/bin/env sh
PID_FILE="$HOME/.outlook-cli/daemon.pid"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "outlook-daemon already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

nohup outlook-daemon >> "$HOME/.outlook-cli/daemon.log" 2>&1 &
echo "outlook-daemon started (PID $!)"
