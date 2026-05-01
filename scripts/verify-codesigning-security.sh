#!/usr/bin/env bash
# Security verification script for Apple code-signing on macOS CI host.
# Run as the CI service account on the target macOS host.
# Outputs PASS/FAIL for each ANU-407 checklist item.

set -euo pipefail

PASS=0
FAIL=0
FINDINGS=()

log_pass() { echo "[PASS] $1"; PASS=$((PASS + 1)); }
log_fail() { echo "[FAIL] $1"; FAIL=$((FAIL + 1)); FINDINGS+=("$1"); }
log_info() { echo "[INFO] $1"; }

echo "========================================"
echo "  ANU-407 Code-Signing Security Audit"
echo "  Host: $(hostname)"
echo "  Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  User: $(whoami)"
echo "========================================"
echo

# ── 1. Apple Developer Certificates ─────────────────────────────────────────
echo "--- CHECK 1: Developer Certificates ---"

# Confirm certs are in the System keychain, NOT login keychain or flat files
SYSTEM_CERTS=$(security find-certificate -a /Library/Keychains/System.keychain 2>/dev/null | grep -c "Apple Distribution\|iPhone Distribution\|Developer ID\|Apple Development" || true)
LOGIN_CERTS=$(security find-certificate -a ~/Library/Keychains/login.keychain-db 2>/dev/null | grep -c "Apple Distribution\|iPhone Distribution\|Developer ID\|Apple Development" || true)

if [ "$SYSTEM_CERTS" -gt 0 ]; then
  log_pass "Found $SYSTEM_CERTS signing cert(s) in System keychain"
else
  log_fail "No signing certs found in System keychain — must not live in login keychain or flat files"
fi

if [ "$LOGIN_CERTS" -gt 0 ]; then
  log_fail "Found $LOGIN_CERTS signing cert(s) in login keychain — must move to System keychain"
else
  log_pass "No signing certs in login keychain"
fi

# Check for .p12/.cer files on disk (should not exist outside controlled temp paths)
P12_FILES=$(find /Users /tmp /var/folders -name "*.p12" -o -name "*.cer" 2>/dev/null | grep -v "\.Trash" || true)
if [ -n "$P12_FILES" ]; then
  log_fail "Loose certificate files found on disk: $P12_FILES"
else
  log_pass "No loose .p12/.cer files found on disk"
fi

# Verify System keychain is locked to CI service account (not world-readable)
KEYCHAIN_PERMS=$(ls -la /Library/Keychains/System.keychain 2>/dev/null | awk '{print $1}')
if [[ "$KEYCHAIN_PERMS" == *"rw-------"* ]] || [[ "$KEYCHAIN_PERMS" == *"rw-r-----"* ]]; then
  log_pass "System keychain permissions are restricted: $KEYCHAIN_PERMS"
else
  log_fail "System keychain permissions may be too permissive: $KEYCHAIN_PERMS"
fi

echo

# ── 2. Provisioning Profiles ─────────────────────────────────────────────────
echo "--- CHECK 2: Provisioning Profiles ---"

PROFILE_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILE_DIR" ]; then
  PROFILE_COUNT=$(ls "$PROFILE_DIR"/*.mobileprovision 2>/dev/null | wc -l | tr -d ' ')
  log_info "Found $PROFILE_COUNT provisioning profile(s) in standard location"

  # Profiles should either come from App Store Connect API (managed) or a tracked encrypted repo.
  # Manually hand-installed profiles should be flagged.
  # We check if any profile's creation date is suspicious (pre-dates CI setup).
  STALE_PROFILES=$(find "$PROFILE_DIR" -name "*.mobileprovision" -older "/etc/paperclip-ci-setup-marker" 2>/dev/null || true)
  if [ -n "$STALE_PROFILES" ]; then
    log_fail "Potentially hand-installed profiles pre-date CI setup: $STALE_PROFILES"
  else
    log_pass "All provisioning profiles created after CI setup marker — likely managed"
  fi
else
  log_info "No provisioning profiles directory found (may use App Store Connect API at build time)"
  log_pass "Provisioning profiles directory absent — consistent with API-managed flow"
fi

echo

# ── 3. App Store Connect API Keys (.p8) ──────────────────────────────────────
echo "--- CHECK 3: App Store Connect API Keys ---"

# .p8 files must NOT be on disk; they should be injected at runtime from CI secrets / Vault
P8_FILES=$(find / -name "*.p8" -not -path "*/proc/*" 2>/dev/null | grep -v "^/System\|^/usr/lib\|^/private/var/db" || true)
if [ -n "$P8_FILES" ]; then
  log_fail "Found .p8 file(s) on disk (must live only in CI secrets store): $P8_FILES"
else
  log_pass "No .p8 API key files found on disk"
fi

# Check for AuthKey_ prefix files (Apple's naming convention for .p8 keys)
AUTHKEY_FILES=$(find / -name "AuthKey_*.p8" 2>/dev/null | grep -v "^/System\|^/usr/lib" || true)
if [ -n "$AUTHKEY_FILES" ]; then
  log_fail "AuthKey .p8 files found on disk: $AUTHKEY_FILES"
else
  log_pass "No AuthKey .p8 files found on disk"
fi

echo

# ── 4. Keychain Password Handling ────────────────────────────────────────────
echo "--- CHECK 4: Keychain Password ---"

# Scan CI build scripts for hardcoded keychain passwords
SCRIPT_DIRS=("/etc/ci" "/opt/ci" "/var/ci" "/Users/ci/scripts" "$HOME/scripts")
HARDCODED_PASS=()

for dir in "${SCRIPT_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    HITS=$(grep -rl "security unlock-keychain" "$dir" 2>/dev/null || true)
    for f in $HITS; do
      if grep -q "security unlock-keychain -p ['\"]" "$f" 2>/dev/null; then
        HARDCODED_PASS+=("$f")
      fi
    done
  fi
done

if [ ${#HARDCODED_PASS[@]} -gt 0 ]; then
  log_fail "Hardcoded keychain password detected in: ${HARDCODED_PASS[*]}"
else
  log_pass "No hardcoded keychain passwords found in CI scripts"
fi

# Also check for plaintext password in environment (it should not be visible without Vault injection)
if env | grep -qi "KEYCHAIN_PASSWORD\s*="; then
  log_info "KEYCHAIN_PASSWORD env var is set (verify it came from CI secrets, not a startup script)"
else
  log_pass "KEYCHAIN_PASSWORD not exported in current environment (expected outside build context)"
fi

echo

# ── 5. Access Audit ───────────────────────────────────────────────────────────
echo "--- CHECK 5: Account Access Audit ---"

log_info "Local user accounts on this host:"
dscl . list /Users | grep -v "^_" | grep -v "^daemon\|^nobody\|^root\|^com\." | while read -r u; do
  HOME_DIR=$(dscl . read /Users/"$u" NFSHomeDirectory 2>/dev/null | awk '{print $2}' || echo "unknown")
  log_info "  user=$u home=$HOME_DIR"
done

# Check for generic/shared accounts (common patterns)
GENERIC_USERS=$(dscl . list /Users | grep -iE "^(admin|shared|test|build|temp|ci$)" || true)
if [ -n "$GENERIC_USERS" ]; then
  log_fail "Generic/shared account(s) detected: $GENERIC_USERS — verify against allowed-users list"
else
  log_pass "No obviously generic accounts found"
fi

# SSH authorized_keys audit
log_info "SSH authorized keys across user accounts:"
for HOME in /Users/*; do
  USER=$(basename "$HOME")
  AUTH_KEYS="$HOME/.ssh/authorized_keys"
  if [ -f "$AUTH_KEYS" ]; then
    KEY_COUNT=$(wc -l < "$AUTH_KEYS")
    log_info "  $USER: $KEY_COUNT key(s) in authorized_keys"
  fi
done

# Sudoers — flag any NOPASSWD entries
NOPASSWD=$(grep -h "NOPASSWD" /etc/sudoers /etc/sudoers.d/* 2>/dev/null || true)
if [ -n "$NOPASSWD" ]; then
  log_fail "NOPASSWD sudo entries found — review carefully: $NOPASSWD"
else
  log_pass "No NOPASSWD sudo entries found"
fi

echo

# ── 6. Credential Rotation Plan Verification ────────────────────────────────
echo "--- CHECK 6: Credential Rotation ---"

# Check cert expiry — flag anything expiring within 60 days
security find-certificate -a /Library/Keychains/System.keychain 2>/dev/null | \
  grep "labl" | awk -F '"' '{print $4}' | while read -r cert_name; do
  EXPIRY=$(security find-certificate -c "$cert_name" /Library/Keychains/System.keychain 2>/dev/null | \
    openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || true)
  if [ -n "$EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null || date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -lt 60 ]; then
      log_fail "Certificate '$cert_name' expires in $DAYS_LEFT days ($EXPIRY)"
    else
      log_pass "Certificate '$cert_name' has $DAYS_LEFT days remaining"
    fi
  fi
done

echo

# ── Summary ───────────────────────────────────────────────────────────────────
echo "========================================"
echo "  SUMMARY"
echo "  PASS: $PASS  FAIL: $FAIL"
echo "========================================"

if [ ${#FINDINGS[@]} -gt 0 ]; then
  echo
  echo "FINDINGS REQUIRING REMEDIATION:"
  for f in "${FINDINGS[@]}"; do
    echo "  - $f"
  done
  exit 1
fi

exit 0
