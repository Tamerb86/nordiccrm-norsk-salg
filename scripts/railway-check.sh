#!/bin/bash

# Railway Deployment Pre-flight Check Script

echo "🚀 Norwegian CRM - Railway Deployment Checklist"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check if .env.example exists
echo "1. Checking configuration files..."
if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
else
    check_fail ".env.example not found"
    exit 1
fi

# 2. Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile exists"
else
    check_fail "Dockerfile not found"
    exit 1
fi

# 3. Check if railway.json exists
if [ -f "railway.json" ]; then
    check_pass "railway.json exists"
else
    check_warn "railway.json not found (optional)"
fi

# 4. Check if .dockerignore exists
if [ -f ".dockerignore" ]; then
    check_pass ".dockerignore exists"
else
    check_warn ".dockerignore not found (recommended)"
fi

echo ""
echo "2. Checking package.json scripts..."

# 5. Check if build script exists
if grep -q '"build":' package.json; then
    check_pass "Build script configured"
else
    check_fail "Build script not found"
    exit 1
fi

# 6. Check if start script exists
if grep -q '"start":' package.json; then
    check_pass "Start script configured"
else
    check_fail "Start script not found"
    exit 1
fi

echo ""
echo "3. Checking dependencies..."

# 7. Check if node_modules exists
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "Dependencies not installed. Run: npm install"
    exit 1
fi

# 8. Check for security vulnerabilities
echo ""
echo "4. Running security audit..."
npm audit --production > /dev/null 2>&1
AUDIT_EXIT_CODE=$?
if [ $AUDIT_EXIT_CODE -eq 0 ]; then
    check_pass "No critical vulnerabilities found"
else
    check_warn "Security vulnerabilities detected. Run: npm audit"
fi

echo ""
echo "5. Testing build process..."

# 9. Try to build the project
npm run build > /dev/null 2>&1
BUILD_EXIT_CODE=$?
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    check_pass "Build successful"
else
    check_fail "Build failed. Run: npm run build"
    exit 1
fi

# 10. Check if dist folder was created
if [ -d "dist" ]; then
    check_pass "Build output (dist/) created"
else
    check_fail "Build output not found"
    exit 1
fi

echo ""
echo "6. Checking environment variable template..."

# 11. Check for required environment variables in .env.example
required_vars=("NODE_ENV" "PORT" "JWT_SECRET" "API_KEY_SALT")
for var in "${required_vars[@]}"; do
    if grep -q "$var" .env.example; then
        check_pass "$var defined in .env.example"
    else
        check_warn "$var not found in .env.example"
    fi
done

echo ""
echo "7. Docker validation..."

# 12. Check if Docker is available
if command -v docker &> /dev/null; then
    check_pass "Docker is installed"
    
    # Try to build Docker image
    echo ""
    echo "   Building Docker image (this may take a moment)..."
    docker build -t norwegian-crm-test . > /dev/null 2>&1
    DOCKER_BUILD_EXIT_CODE=$?
    if [ $DOCKER_BUILD_EXIT_CODE -eq 0 ]; then
        check_pass "Docker image builds successfully"
        # Clean up test image
        docker rmi norwegian-crm-test > /dev/null 2>&1
    else
        check_fail "Docker build failed"
        exit 1
    fi
else
    check_warn "Docker not installed (optional for local testing)"
fi

echo ""
echo "================================================"
echo ""
echo "✅ Pre-flight checks completed!"
echo ""
echo "📋 Next Steps:"
echo "   1. Review RAILWAY_DEPLOYMENT.md for detailed instructions"
echo "   2. Set up environment variables in Railway dashboard"
echo "   3. Connect your Git repository to Railway"
echo "   4. Deploy and monitor the application"
echo ""
echo "🔐 Security Reminder:"
echo "   Generate strong secrets for production:"
echo "   - JWT_SECRET: openssl rand -base64 32"
echo "   - API_KEY_SALT: openssl rand -base64 32"
echo "   - WEBHOOK_SECRET: openssl rand -hex 32"
echo ""
echo "📚 Documentation:"
echo "   - Deployment Guide: RAILWAY_DEPLOYMENT.md"
echo "   - Environment Variables: .env.example"
echo ""
