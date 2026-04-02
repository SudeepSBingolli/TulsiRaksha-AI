#!/usr/bin/env sh
set -e

# Appflow expects gradlew at repository root.
# Run from the Android project directory so Gradle resolves settings/build files.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Regenerate Capacitor Android Gradle includes when CI checks out without synced native artifacts.
if [ ! -f "$SCRIPT_DIR/android/capacitor.settings.gradle" ] || [ ! -f "$SCRIPT_DIR/android/app/capacitor.build.gradle" ]; then
	(cd "$SCRIPT_DIR" && npx cap update android)
fi

cd "$SCRIPT_DIR/android"
exec ./gradlew "$@"
