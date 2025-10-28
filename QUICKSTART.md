# Quick Deployment Guide

This guide provides a quick overview for deploying the Environmental Monitoring System on Ubuntu with nginx.

## 📋 Overview

The system will be deployed with:
- **Frontend**: `envn.celinaisd.tech` (React app)
- **API/Backend**: `enapi.celinaisd.tech` (Express server + WebSocket)

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required software
sudo apt install -y nginx mysql-server git build-essential

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 2. Clone Repository

```bash
sudo mkdir -p /var/www/envn
sudo chown -R $USER:$USER /var/www/envn
cd /var/www/envn
git clone https://github.com/HamzaQaz/envn.celinaisd.tech.git .
```

### 3. Setup Database

```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE envnmoniter CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'envnuser'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON envnmoniter.* TO 'envnuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Import schema
mysql -u envnuser -p envnmoniter < data.sql
```

### 4. Configure Environment

**Backend** (`.env` in root):
```env
DB_HOST=localhost
DB_USER=envnuser
DB_PASS=your_strong_password
DB_NAME=envnmoniter
PORT=3000
SESSION_SECRET=generate_random_secret_here
CLIENT_URL=https://envn.celinaisd.tech
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=https://enapi.celinaisd.tech
```

Generate a strong session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Build Application

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build
npm run build
```

### 6. Setup PM2

```bash
# Create log directory
sudo mkdir -p /var/log/envn
sudo chown -R $USER:$USER /var/log/envn

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configure Nginx

```bash
# Copy nginx configs
sudo cp nginx/enapi.celinaisd.tech /etc/nginx/sites-available/
sudo cp nginx/envn.celinaisd.tech /etc/nginx/sites-available/

# Enable sites
sudo ln -s /etc/nginx/sites-available/enapi.celinaisd.tech /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/envn.celinaisd.tech /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Setup SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d enapi.celinaisd.tech
sudo certbot --nginx -d envn.celinaisd.tech
```

### 9. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 10. Verify Deployment

```bash
# Check backend status
pm2 status
pm2 logs envn-backend

# Test API
curl https://enapi.celinaisd.tech/health

# Open in browser
# https://envn.celinaisd.tech
```

## 📦 Using the Automated Script

Alternatively, use the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will guide you through the deployment process.

## 🔄 Updating

```bash
cd /var/www/envn
git pull origin main
npm install
cd client && npm install && cd ..
npm run build
pm2 restart envn-backend
```

## 📚 Documentation

- **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Application README**: See [README.md](./README.md)

## 🆘 Common Issues

### Backend won't start
```bash
# Check logs
pm2 logs envn-backend

# Verify .env file
cat .env

# Test database connection
mysql -u envnuser -p envnmoniter
```

### 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check nginx error log: `sudo tail -f /var/log/nginx/error.log`
- Verify PORT in .env matches nginx proxy_pass

### WebSocket not connecting
- Check browser console for errors
- Verify nginx WebSocket configuration
- Check CORS settings in backend .env

## 📞 Support

For detailed troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For issues, open a GitHub issue: https://github.com/HamzaQaz/envn.celinaisd.tech/issues
