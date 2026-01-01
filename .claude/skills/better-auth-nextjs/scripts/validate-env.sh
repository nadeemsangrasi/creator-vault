#!/bin/bash

# Better Auth Environment Validation Script
# Checks for required environment variables and their format

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating Better Auth Environment..."
echo ""

ERRORS=0
WARNINGS=0

# Load .env.local if it exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Loaded .env.local"
else
    echo "${RED}❌ .env.local file not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📋 Checking Required Variables..."
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "${RED}❌ DATABASE_URL is not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo "${GREEN}✅ DATABASE_URL is set${NC}"

    # Validate PostgreSQL format
    if [[ $DATABASE_URL == postgresql://* ]] || [[ $DATABASE_URL == postgres://* ]]; then
        echo "   Format: Valid PostgreSQL connection string"
    else
        echo "${YELLOW}⚠️  DATABASE_URL may not be a valid PostgreSQL connection string${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check BETTER_AUTH_SECRET
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "${RED}❌ BETTER_AUTH_SECRET is not set${NC}"
    echo "   Generate with: openssl rand -base64 32"
    ERRORS=$((ERRORS + 1))
else
    echo "${GREEN}✅ BETTER_AUTH_SECRET is set${NC}"

    # Check length (should be at least 32 characters)
    if [ ${#BETTER_AUTH_SECRET} -lt 32 ]; then
        echo "${YELLOW}⚠️  BETTER_AUTH_SECRET is shorter than recommended (32 chars)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   Length: Good (${#BETTER_AUTH_SECRET} chars)"
    fi
fi

# Check BETTER_AUTH_URL
if [ -z "$BETTER_AUTH_URL" ]; then
    echo "${RED}❌ BETTER_AUTH_URL is not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo "${GREEN}✅ BETTER_AUTH_URL is set${NC}"
    echo "   URL: $BETTER_AUTH_URL"

    # Validate URL format
    if [[ $BETTER_AUTH_URL == http://* ]] || [[ $BETTER_AUTH_URL == https://* ]]; then
        echo "   Format: Valid URL"
    else
        echo "${YELLOW}⚠️  BETTER_AUTH_URL should start with http:// or https://${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""
echo "🔐 Checking OAuth Providers..."
echo ""

# Google OAuth
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "${GREEN}✅ Google OAuth configured${NC}"
elif [ -n "$GOOGLE_CLIENT_ID" ] || [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "${YELLOW}⚠️  Google OAuth partially configured (need both CLIENT_ID and CLIENT_SECRET)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   Google OAuth: Not configured (optional)"
fi

# GitHub OAuth
if [ -n "$GITHUB_CLIENT_ID" ] && [ -n "$GITHUB_CLIENT_SECRET" ]; then
    echo "${GREEN}✅ GitHub OAuth configured${NC}"
elif [ -n "$GITHUB_CLIENT_ID" ] || [ -n "$GITHUB_CLIENT_SECRET" ]; then
    echo "${YELLOW}⚠️  GitHub OAuth partially configured (need both CLIENT_ID and CLIENT_SECRET)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   GitHub OAuth: Not configured (optional)"
fi

echo ""
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "${GREEN}✅ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    exit 0
else
    echo "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
