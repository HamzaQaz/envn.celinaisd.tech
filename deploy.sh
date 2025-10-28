#!/bin/bash
#
# Deployment Helper Script for Environmental Monitoring System
# This script helps automate the deployment process
#

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/var/www/envn"

echo "=================================="
echo "Environment Monitoring Deployment"
echo "=================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists nginx; then
    echo "❌ nginx is not installed. Please install nginx first."
    exit 1
fi

if ! command_exists mysql; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Check if running in project directory
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

# Function to build the project
build_project() {
    echo "Building the project..."
    
    # Install dependencies
    echo "Installing root dependencies..."
    npm install
    
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
    
    # Build
    echo "Building backend..."
    npm run build:server
    
    echo "Building frontend..."
    npm run build:client
    
    echo "✅ Build completed successfully"
}

# Function to setup environment files
setup_env() {
    echo "Setting up environment files..."
    
    if [ ! -f .env ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env with your database credentials and settings"
    else
        echo "✅ .env already exists"
    fi
    
    if [ ! -f client/.env ]; then
        echo "Creating client/.env..."
        echo "VITE_API_URL=https://enapi.celinaisd.tech" > client/.env
        echo "✅ Created client/.env with production API URL"
    else
        echo "✅ client/.env already exists"
    fi
}

# Function to setup database
setup_database() {
    echo ""
    echo "Database setup required:"
    echo "1. Create database: CREATE DATABASE envnmoniter;"
    echo "2. Create user: CREATE USER 'envnuser'@'localhost' IDENTIFIED BY 'password';"
    echo "3. Grant privileges: GRANT ALL PRIVILEGES ON envnmoniter.* TO 'envnuser'@'localhost';"
    echo "4. Import schema: mysql -u envnuser -p envnmoniter < data.sql"
    echo ""
    read -p "Have you completed the database setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please complete the database setup first"
        exit 1
    fi
}

# Function to setup PM2
setup_pm2() {
    if ! command_exists pm2; then
        echo "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    echo "Starting application with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "Setting up PM2 to start on boot..."
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
    
    echo "✅ PM2 setup completed"
}

# Function to setup nginx
setup_nginx() {
    echo "Setting up nginx configuration..."
    
    # Copy nginx configs
    if [ -f nginx/enapi.celinaisd.tech ]; then
        sudo cp nginx/enapi.celinaisd.tech /etc/nginx/sites-available/
        sudo ln -sf /etc/nginx/sites-available/enapi.celinaisd.tech /etc/nginx/sites-enabled/
        echo "✅ API nginx config installed"
    fi
    
    if [ -f nginx/envn.celinaisd.tech ]; then
        sudo cp nginx/envn.celinaisd.tech /etc/nginx/sites-available/
        sudo ln -sf /etc/nginx/sites-available/envn.celinaisd.tech /etc/nginx/sites-enabled/
        echo "✅ Frontend nginx config installed"
    fi
    
    # Test nginx config
    if sudo nginx -t; then
        echo "✅ Nginx configuration is valid"
        sudo systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx configuration has errors"
        exit 1
    fi
}

# Function to setup SSL
setup_ssl() {
    if ! command_exists certbot; then
        echo "Installing certbot..."
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    echo ""
    echo "Setting up SSL certificates..."
    echo "This will obtain certificates for:"
    echo "  - enapi.celinaisd.tech"
    echo "  - envn.celinaisd.tech"
    echo ""
    read -p "Continue with SSL setup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d enapi.celinaisd.tech
        sudo certbot --nginx -d envn.celinaisd.tech
        echo "✅ SSL certificates installed"
    else
        echo "⚠️  Skipping SSL setup. You can run it manually later with:"
        echo "   sudo certbot --nginx -d enapi.celinaisd.tech"
        echo "   sudo certbot --nginx -d envn.celinaisd.tech"
    fi
}

# Function to create log directory
setup_logs() {
    echo "Setting up log directory..."
    sudo mkdir -p /var/log/envn
    sudo chown -R $USER:$USER /var/log/envn
    echo "✅ Log directory created"
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Ask what to do
    echo "What would you like to do?"
    echo "1) Full deployment (first time setup)"
    echo "2) Update existing deployment"
    echo "3) Build only"
    echo "4) Setup nginx only"
    echo "5) Setup SSL only"
    read -p "Enter choice [1-5]: " choice
    
    case $choice in
        1)
            echo "Starting full deployment..."
            setup_env
            setup_database
            setup_logs
            build_project
            setup_pm2
            setup_nginx
            setup_ssl
            echo ""
            echo "🎉 Deployment completed!"
            echo ""
            echo "Next steps:"
            echo "1. Edit .env with your database credentials"
            echo "2. Restart backend: pm2 restart envn-backend"
            echo "3. Check status: pm2 status"
            echo "4. View logs: pm2 logs envn-backend"
            ;;
        2)
            echo "Updating existing deployment..."
            git pull origin main
            build_project
            pm2 restart envn-backend
            echo "✅ Update completed!"
            ;;
        3)
            build_project
            ;;
        4)
            setup_nginx
            ;;
        5)
            setup_ssl
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main
