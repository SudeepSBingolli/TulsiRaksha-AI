#!/usr/bin/env sh
set -e

# Appflow expects gradlew at repository root.
# Forward all arguments to the Android wrapper.
exec "$(dirname "$0")/android/gradlew" "$@"
