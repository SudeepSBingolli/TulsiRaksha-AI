#!/usr/bin/env sh
set -e

# Appflow expects gradlew at repository root.
# Run from the Android project directory so Gradle resolves settings/build files.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/android"
exec ./gradlew "$@"
