#!/bin/bash

# Phase 4B-1 Verification Script
# Checks all files are in place and ready for deployment

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  PEPETOR Miner - Phase 4B-1 Verification  ║"
echo "╚══════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $1 (MISSING)"
        ((FAIL++))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 contains '$2'"
        ((PASS++))
    else
        echo -e "${RED}❌${NC} $1 missing '$2'"
        ((FAIL++))
    fi
}

echo "1️⃣  Checking New Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "chrome-extension/services/StorageService.js"
check_file "chrome-extension/services/AnalyticsService.js"
check_file "chrome-extension/pages/analytics.html"
check_file "chrome-extension/pages/analytics.js"
check_file "chrome-extension/pages/analytics.css"
echo ""

echo "2️⃣  Checking Updated Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_content "chrome-extension/background.js" "recordSession"
check_content "chrome-extension/background.js" "storageService"
check_content "chrome-extension/popup.html" "openAnalyticsBtn"
check_content "chrome-extension/popup.js" "openAnalyticsBtn"
check_content "chrome-extension/manifest.json" "pages/\*"
echo ""

echo "3️⃣  Checking File Integrity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check StorageService
if grep -q "class StorageService" chrome-extension/services/StorageService.js; then
    echo -e "${GREEN}✅${NC} StorageService class definition"
    ((PASS++))
else
    echo -e "${RED}❌${NC} StorageService class not found"
    ((FAIL++))
fi

# Check AnalyticsService
if grep -q "class AnalyticsService" chrome-extension/services/AnalyticsService.js; then
    echo -e "${GREEN}✅${NC} AnalyticsService class definition"
    ((PASS++))
else
    echo -e "${RED}❌${NC} AnalyticsService class not found"
    ((FAIL++))
fi

# Check analytics.html structure
if grep -q "analytics-container" chrome-extension/pages/analytics.html; then
    echo -e "${GREEN}✅${NC} Analytics HTML structure"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Analytics HTML structure missing"
    ((FAIL++))
fi

# Check analytics.js functions
if grep -q "async function init()" chrome-extension/pages/analytics.js; then
    echo -e "${GREEN}✅${NC} Analytics JS initialization"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Analytics JS initialization missing"
    ((FAIL++))
fi

echo ""

echo "4️⃣  Checking Line Counts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check reasonable file sizes
STORAGE_LINES=$(wc -l < "chrome-extension/services/StorageService.js")
ANALYTICS_LINES=$(wc -l < "chrome-extension/services/AnalyticsService.js")
HTML_LINES=$(wc -l < "chrome-extension/pages/analytics.html")
JS_LINES=$(wc -l < "chrome-extension/pages/analytics.js")
CSS_LINES=$(wc -l < "chrome-extension/pages/analytics.css")

echo "StorageService.js: $STORAGE_LINES lines (expected: 250+)"
if [ "$STORAGE_LINES" -gt 250 ]; then
    echo -e "${GREEN}✅${NC} StorageService.js has sufficient code"
    ((PASS++))
else
    echo -e "${RED}❌${NC} StorageService.js may be incomplete"
    ((FAIL++))
fi

echo "AnalyticsService.js: $ANALYTICS_LINES lines (expected: 280+)"
if [ "$ANALYTICS_LINES" -gt 280 ]; then
    echo -e "${GREEN}✅${NC} AnalyticsService.js has sufficient code"
    ((PASS++))
else
    echo -e "${RED}❌${NC} AnalyticsService.js may be incomplete"
    ((FAIL++))
fi

echo "analytics.html: $HTML_LINES lines (expected: 120+)"
if [ "$HTML_LINES" -gt 120 ]; then
    echo -e "${GREEN}✅${NC} analytics.html has sufficient content"
    ((PASS++))
else
    echo -e "${RED}❌${NC} analytics.html may be incomplete"
    ((FAIL++))
fi

echo "analytics.js: $JS_LINES lines (expected: 350+)"
if [ "$JS_LINES" -gt 350 ]; then
    echo -e "${GREEN}✅${NC} analytics.js has sufficient code"
    ((PASS++))
else
    echo -e "${RED}❌${NC} analytics.js may be incomplete"
    ((FAIL++))
fi

echo "analytics.css: $CSS_LINES lines (expected: 350+)"
if [ "$CSS_LINES" -gt 350 ]; then
    echo -e "${GREEN}✅${NC} analytics.css has sufficient styles"
    ((PASS++))
else
    echo -e "${RED}❌${NC} analytics.css may be incomplete"
    ((FAIL++))
fi

echo ""

echo "5️⃣  Checking Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check manifest.json is valid JSON
if python3 -m json.tool chrome-extension/manifest.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} manifest.json is valid JSON"
    ((PASS++))
else
    echo -e "${RED}❌${NC} manifest.json has JSON errors"
    ((FAIL++))
fi

# Check version
if grep -q '"version": "1.0.0"' chrome-extension/manifest.json; then
    echo -e "${GREEN}✅${NC} Extension version: 1.0.0"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC}  Extension version may need update"
fi

echo ""

echo "6️⃣  Documentation Check..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "PHASE4B_DEPLOYMENT_GUIDE.md"
check_file "PHASE4B_TEST_SCRIPT.md"
check_file "PHASE4B_IMPLEMENTATION_SUMMARY.md"
echo ""

# Summary
echo "╔══════════════════════════════════════════╗"
echo "║              VERIFICATION RESULT          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo "Passed: $PASS / $TOTAL ($PERCENTAGE%)"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "Phase 4B-1 is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Open chrome://extensions/"
    echo "2. Click Reload button for PEPETOR Miner"
    echo "3. Click extension icon → 📈 Analytics"
    echo "4. Let extension run for 5+ minutes"
    echo "5. Refresh to see data populate"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Failed checks: $FAIL"
    echo "Please review the errors above before deploying."
    echo ""
    exit 1
fi