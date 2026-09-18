#!/bin/sh
# Copia gli hook versionati dentro .git/hooks (cartella non versionata).
ROOT=$(git rev-parse --show-toplevel)
cp "$ROOT/scripts/hooks/pre-push" "$ROOT/.git/hooks/pre-push"
chmod +x "$ROOT/.git/hooks/pre-push"
echo "✅ Hook pre-push installato. Per saltarlo una volta: git push --no-verify"
