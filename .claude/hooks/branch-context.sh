#!/bin/bash
# Injects current git branch into Claude's context on every prompt.
# This lets Claude check branch state without a tool call.

BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null)

if [ -z "$BRANCH" ]; then
  exit 0
fi

echo "Current git branch: $BRANCH"
