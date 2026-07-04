#!/bin/bash
set -e

UUID="crypto@abbasnaqdi.com"
INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"
SCHEMA_DIR="schemas"

echo "Building and compiling schemas..."
if command -v glib-compile-schemas &> /dev/null; then
  glib-compile-schemas "$SCHEMA_DIR"
else
  echo "glib-compile-schemas not found. Installing without local schema compilation..."
fi

echo "Installing extension to $INSTALL_DIR..."
# Remove old installation if exists for a clean update
if [ -d "$INSTALL_DIR" ]; then
  echo "Existing installation found. Updating..."
  rm -rf "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"
# Copy all contents to the extension directory
cp -r ./* "$INSTALL_DIR/"

# Also copy hidden files if necessary, although none are critical for the extension runtime
cp -r ./.[!.]* "$INSTALL_DIR/" 2>/dev/null || true

# Make sure schemas in target directory are properly compiled
if command -v glib-compile-schemas &> /dev/null; then
  glib-compile-schemas "$INSTALL_DIR/schemas/"
fi

echo "Activating extension..."
if command -v gnome-extensions &> /dev/null; then
  # Enable it
  gnome-extensions enable "$UUID" || echo "Note: gnome-extensions could not enable it right now. You may need to restart GNOME Shell (Alt+F2 -> r) or log out/in."
else
  echo "gnome-extensions tool not found. Please enable it via GNOME Extensions app."
fi

echo "Installation complete! To apply changes, you might need to restart GNOME Shell."
