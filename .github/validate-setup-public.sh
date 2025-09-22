#!/bin/bash
# Public version of deployment validation script
# This script checks the deployment setup without exposing sensitive information

echo "=== GitHub Actions Deployment Setup Validation ==="

# Check if GitHub secrets are properly configured
echo "1. Checking required GitHub secrets..."
echo "   Please verify these secrets are set in GitHub repository settings > Secrets and variables > Actions:"
echo "   - DEPLOY_HOST (your server IP address)"
echo "   - DEPLOY_USER (deployment user, typically 'deployer')"
echo "   - DEPLOY_PORT (SSH port, typically '22')"
echo "   - DEPLOY_KEY (SSH private key for authentication)"

# Check deployment scripts
echo ""
echo "2. Checking deployment scripts on server..."
SCRIPTS_DIR="/home/deployer/scripts"
REQUIRED_SCRIPTS=("deploy-frontend.sh" "deploy-backend.sh" "status.sh" "show-logs.sh")

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$SCRIPTS_DIR/$script" ]; then
        if [ -x "$SCRIPTS_DIR/$script" ]; then
            echo "   ✓ $script exists and is executable"
        else
            echo "   ⚠️  $script exists but is not executable - run: chmod +x $SCRIPTS_DIR/$script"
        fi
    else
        echo "   ❌ $script is missing from $SCRIPTS_DIR"
    fi
done

# Check directory structure
echo ""
echo "3. Checking directory structure..."
REQUIRED_DIRS=(
    "/home/deployer/apps/movietok/frontend"
    "/home/deployer/apps/movietok/backend" 
    "/var/www/movietok"
    "/var/log/movietok"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✓ $dir exists"
    else
        echo "   ⚠️  $dir does not exist - will be created during deployment"
    fi
done

# Check services
echo ""
echo "4. Checking system services..."

# Check PM2
if command -v pm2 &> /dev/null; then
    echo "   ✓ PM2 is installed"
    echo "   PM2 status:"
    pm2 status 2>/dev/null | head -5
else
    echo "   ❌ PM2 is not installed"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo "   ✓ Nginx is running"
else
    echo "   ⚠️  Nginx is not running"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✓ Node.js is installed: $NODE_VERSION"
    if [[ $NODE_VERSION == v18* ]]; then
        echo "   ✓ Node.js version 18 (matches GitHub Actions)"
    else
        echo "   ⚠️  Node.js version does not match GitHub Actions (v18)"
    fi
else
    echo "   ❌ Node.js is not installed"
fi

# Check disk space
echo ""
echo "5. Checking system resources..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "   ✓ Disk usage: ${DISK_USAGE}% (healthy)"
else
    echo "   ⚠️  Disk usage: ${DISK_USAGE}% (high)"
fi

# Check memory
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 85 ]; then
    echo "   ✓ Memory usage: ${MEMORY_USAGE}% (healthy)"
else
    echo "   ⚠️  Memory usage: ${MEMORY_USAGE}% (high)"
fi

echo ""
echo "=== Validation Complete ==="
echo ""
echo "Next steps:"
echo "1. Commit and push the .github/workflows files to your repository"
echo "2. Ensure your self-hosted runner is properly registered"
echo "3. Configure the required GitHub secrets"
echo "4. Test deployment by pushing to main branch or using manual dispatch"
echo "5. Monitor the Actions tab in GitHub for deployment status"