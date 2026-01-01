#!/bin/bash

# Generate secure JWT secret key
# Usage: ./generate-secrets.sh [--length 32]

set -e

LENGTH=${1:-32}

echo "Generating ${LENGTH}-character JWT secret..."

# Generate random secret
SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c $LENGTH)

echo ""
echo "Generated JWT Secret:"
echo "====================="
echo "$SECRET"
echo ""
echo "Add this to both frontend and backend .env files:"
echo ""
echo "Frontend (.env.local):"
echo "  BETTER_AUTH_SECRET=$SECRET"
echo ""
echo "Backend (.env):"
echo "  JWT_SECRET_KEY=$SECRET"
echo ""
echo "IMPORTANT: Use the same value in both services!"
