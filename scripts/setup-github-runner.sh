#!/usr/bin/env bash
# setup-github-runner.sh
# Installs a GitHub Actions self-hosted runner on macOS and registers it as a launchd service.
#
# Usage:
#   export GITHUB_TOKEN="<runner-registration-token>"   # from repo/org Settings → Actions → Runners → New runner
#   export GITHUB_REPO_URL="https://github.com/anubisland/Student-Class-Management-"
#   bash scripts/setup-github-runner.sh
#
# Optionally override defaults:
#   RUNNER_NAME   - display name in GitHub UI  (default: hostname)
#   RUNNER_LABELS - comma-separated labels      (default: self-hosted,macOS,ios,xcode)
#   RUNNER_DIR    - installation directory      (default: ~/actions-runner)
#   RUNNER_USER   - user to run service as      (default: current user)

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
GITHUB_REPO_URL="${GITHUB_REPO_URL:?Must set GITHUB_REPO_URL}"
GITHUB_TOKEN="${GITHUB_TOKEN:?Must set GITHUB_TOKEN}"
RUNNER_NAME="${RUNNER_NAME:-$(hostname -s)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,macOS,ios,xcode}"
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
RUNNER_USER="${RUNNER_USER:-$(whoami)}"

# ── Detect latest runner version ───────────────────────────────────────────────
echo "==> Detecting latest GitHub Actions runner version..."
RUNNER_VERSION=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest \
  | grep '"tag_name"' | sed 's/.*"v\([^"]*\)".*/\1/')
echo "    Runner version: ${RUNNER_VERSION}"

RUNNER_PKG="actions-runner-osx-x64-${RUNNER_VERSION}.tar.gz"
# Use arm64 package on Apple Silicon
if [[ "$(uname -m)" == "arm64" ]]; then
  RUNNER_PKG="actions-runner-osx-arm64-${RUNNER_VERSION}.tar.gz"
fi
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_PKG}"

# ── Create installation directory ──────────────────────────────────────────────
echo "==> Installing runner to ${RUNNER_DIR}..."
mkdir -p "${RUNNER_DIR}"
cd "${RUNNER_DIR}"

# ── Download and extract ───────────────────────────────────────────────────────
echo "==> Downloading ${RUNNER_PKG}..."
curl -fsSL -o runner.tar.gz "${RUNNER_URL}"
tar xzf runner.tar.gz
rm runner.tar.gz

# ── Install macOS runner dependencies ─────────────────────────────────────────
echo "==> Installing runner dependencies..."
./bin/installdependencies.sh 2>/dev/null || true

# ── Configure the runner ───────────────────────────────────────────────────────
echo "==> Configuring runner..."
./config.sh \
  --url "${GITHUB_REPO_URL}" \
  --token "${GITHUB_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${RUNNER_LABELS}" \
  --work "_work" \
  --unattended \
  --replace

# ── Install as launchd service (survives reboots) ──────────────────────────────
echo "==> Installing as launchd service..."
sudo ./svc.sh install "${RUNNER_USER}"
sudo ./svc.sh start

# ── Verify service is running ──────────────────────────────────────────────────
echo ""
echo "==> Checking service status..."
sudo ./svc.sh status

echo ""
echo "✅ Setup complete!"
echo "   Runner '${RUNNER_NAME}' is registered and running."
echo "   Labels: ${RUNNER_LABELS}"
echo "   Verify at: ${GITHUB_REPO_URL%/}/settings/actions/runners"
echo ""
echo "   To stop the service:  sudo ${RUNNER_DIR}/svc.sh stop"
echo "   To uninstall:         sudo ${RUNNER_DIR}/svc.sh uninstall && ${RUNNER_DIR}/config.sh remove --token <TOKEN>"
