#!/bin/bash
# filepath: /Users/kianavega/codetrackr/fetch_commit.sh

# Usage: ./fetch_commit.sh <commit-SHA>
if [ -z "$1" ]; then
  echo "Please provide a commit SHA."
  exit 1
fi

COMMIT_SHA=$1
REPO_URL="https://github.com/KianaVega/codetrackr.git"

# Fetch the specific commit
git fetch $REPO_URL $COMMIT_SHA

# Check out the commit
git checkout $COMMIT_SHA