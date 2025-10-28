# Ubuntu Server Deployment Guide with Nginx

This guide will help you deploy the Environmental Monitoring System on an Ubuntu server using nginx as a reverse proxy.

## Architecture Overview

- **Frontend**: `envn.celinaisd.tech` - React application (static files)
- **API/Backend**: `enapi.celinaisd.tech` - Express server with WebSocket support
- **Database**: MySQL running on the same server or remotely

---

## Prerequisites

- Ubuntu Server 20.04+ (22.04 recommended)
- Root or sudo access
- Domain names configured:
  - `envn.celinaisd.tech` → Your server IP
  - `enapi.celinaisd.tech` → Your server IP
- Basic knowledge of Linux terminal

---

## Step 1: Initial Server Setup

### Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Required Software

```bash
# Install Node.js (using NodeSource repository for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server

# Install Git
sudo apt install -y git

# Install build essentials (for native modules)
sudo apt install -y build-essential

# Install PM2 globally (for process management)
sudo npm install -g pm2
```

### Verify Installations

```bash
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x
nginx -v          # Should show nginx version
mysql --version   # Should show MySQL version
```

---

## Step 2: MySQL Database Setup

### Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to set a root password and secure your installation.

### Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these commands in MySQL prompt
CREATE DATABASE envnmoniter CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'envnuser'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON envnmoniter.* TO 'envnuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Import Database Schema

```bash
# From your project directory
mysql -u envnuser -p envnmoniter < data.sql
```

---

## Step 3: Clone and Setup Application

### Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/envn
sudo chown -R $USER:$USER /var/www/envn

# Clone the repository
cd /var/www/envn
git clone https://github.com/HamzaQaz/envn.celinaisd.tech.git .
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

---

## Step 4: Configure Environment Variables

### Backend Configuration

Create `/var/www/envn/.env`:

```bash
nano .env
```

Add the following content (adjust values as needed):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=envnuser
DB_PASS=your_strong_password_here
DB_NAME=envnmoniter

# Server Configuration
PORT=3000
SESSION_SECRET=your_very_strong_secret_key_change_this_in_production

# Client URL (for CORS)
CLIENT_URL=https://envn.celinaisd.tech
```

**Important**: Generate a strong `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

Create `/var/www/envn/client/.env`:

```bash
cd /var/www/envn/client
nano .env
```

Add:

```env
VITE_API_URL=https://enapi.celinaisd.tech
```

---

## Step 5: Build the Application

```bash
# From the root directory /var/www/envn
npm run build

# This will:
# 1. Build the backend TypeScript → server/dist/
# 2. Build the frontend React app → client/dist/
```

Verify the build output:
```bash
ls -la server/dist/    # Should contain server.js and other files
ls -la client/dist/    # Should contain index.html, assets/, etc.
```

---

## Step 6: Configure PM2 (Process Manager)

### Create PM2 Ecosystem File

Create `/var/www/envn/ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [{
    name: 'envn-backend',
    script: './server/dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/envn/error.log',
    out_file: '/var/log/envn/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};
```

### Create Log Directory

```bash
sudo mkdir -p /var/log/envn
sudo chown -R $USER:$USER /var/log/envn
```

### Start Application with PM2

```bash
cd /var/www/envn
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Follow the instructions from `pm2 startup` to enable PM2 to start on system boot.

### PM2 Useful Commands

```bash
pm2 status              # Check application status
pm2 logs envn-backend   # View logs
pm2 restart envn-backend # Restart application
pm2 stop envn-backend   # Stop application
pm2 delete envn-backend # Remove from PM2
```

---

## Step 7: Configure Nginx

### API Server Configuration (enapi.celinaisd.tech)

Create `/etc/nginx/sites-available/enapi.celinaisd.tech`:

```bash
sudo nano /etc/nginx/sites-available/enapi.celinaisd.tech
```

Add the configuration from `nginx/enapi.celinaisd.tech` (see Step 8 below).

### Frontend Configuration (envn.celinaisd.tech)

Create `/etc/nginx/sites-available/envn.celinaisd.tech`:

```bash
sudo nano /etc/nginx/sites-available/envn.celinaisd.tech
```

Add the configuration from `nginx/envn.celinaisd.tech` (see Step 8 below).

### Enable Sites

```bash
# Enable API configuration
sudo ln -s /etc/nginx/sites-available/enapi.celinaisd.tech /etc/nginx/sites-enabled/

# Enable frontend configuration
sudo ln -s /etc/nginx/sites-available/envn.celinaisd.tech /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

---

## Step 8: SSL/TLS Certificates with Let's Encrypt

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificates

```bash
# For API domain
sudo certbot --nginx -d enapi.celinaisd.tech

# For frontend domain
sudo certbot --nginx -d envn.celinaisd.tech
```

Follow the prompts. Certbot will automatically configure nginx for HTTPS.

### Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Certificates will auto-renew before expiration.

---

## Step 9: Configure Firewall

```bash
# Allow SSH (important!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 10: Verify Deployment

### Check Backend Service

```bash
pm2 status
pm2 logs envn-backend --lines 50
```

### Test API Endpoint

```bash
curl https://enapi.celinaisd.tech/api/check-auth
```

### Test Frontend

Open browser and navigate to:
- `https://envn.celinaisd.tech`

The application should load and connect to the WebSocket server.

---

## Updating the Application

### Pull Latest Changes

```bash
cd /var/www/envn
git pull origin main
```

### Rebuild and Restart

```bash
# Install any new dependencies
npm install
cd client && npm install && cd ..

# Rebuild
npm run build

# Restart backend
pm2 restart envn-backend

# Nginx serves static files, so frontend updates are immediate
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs envn-backend

# Check if port 3000 is already in use
sudo lsof -i :3000

# Restart backend
pm2 restart envn-backend
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u envnuser -p envnmoniter

# Check .env file
cat /var/www/envn/.env

# Restart backend after fixing
pm2 restart envn-backend
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### WebSocket Connection Fails

- Ensure nginx configuration includes WebSocket upgrade headers
- Check that PM2 process is running: `pm2 status`
- Verify CORS settings in backend `.env` file
- Check browser console for errors

### 502 Bad Gateway

- Backend service is not running → `pm2 restart envn-backend`
- Wrong port configuration → Check nginx config and backend PORT
- Check logs: `pm2 logs envn-backend`

---

## Security Best Practices

1. **Change Default Password**: Update the default password `temp` in the backend code
2. **Strong Secrets**: Use strong, random values for `SESSION_SECRET`
3. **Regular Updates**: Keep system and packages updated
4. **Backup Database**: Regular MySQL backups
5. **Monitor Logs**: Check PM2 and nginx logs regularly
6. **Firewall**: Only allow necessary ports
7. **SSH Keys**: Use SSH keys instead of passwords for server access

---

## Monitoring

### View Application Logs

```bash
# Backend logs
pm2 logs envn-backend

# Nginx access logs
sudo tail -f /var/log/nginx/envn-access.log
sudo tail -f /var/log/nginx/enapi-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitor System Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

---

## Backup Strategy

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-envn-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/envn"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u envnuser -p'your_password' envnmoniter > $BACKUP_DIR/envn_$DATE.sql
gzip $BACKUP_DIR/envn_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "envn_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-envn-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-envn-db.sh
```

---

## Support and Maintenance

For issues and questions:
- GitHub Issues: https://github.com/HamzaQaz/envn.celinaisd.tech/issues
- Check logs: `pm2 logs`, nginx logs
- Review this deployment guide

---

## Summary of Deployed Architecture

```
Internet
    ↓
[DNS: envn.celinaisd.tech → Server IP]
[DNS: enapi.celinaisd.tech → Server IP]
    ↓
[Nginx (Port 80/443)]
    ↓
    ├─→ envn.celinaisd.tech → Serves static files from /var/www/envn/client/dist/
    └─→ enapi.celinaisd.tech → Proxies to Express server (localhost:3000)
                                ↓
                        [PM2: Node.js Backend]
                                ↓
                        [MySQL Database]
```

---

## Quick Reference Commands

```bash
# Application Management
pm2 status                          # Check backend status
pm2 logs envn-backend              # View logs
pm2 restart envn-backend           # Restart backend

# Nginx
sudo nginx -t                       # Test configuration
sudo systemctl reload nginx         # Reload nginx
sudo systemctl restart nginx        # Restart nginx

# Database
mysql -u envnuser -p envnmoniter   # Connect to database

# Logs
tail -f /var/log/envn/error.log    # Backend errors
tail -f /var/log/nginx/error.log   # Nginx errors

# Updates
cd /var/www/envn && git pull       # Pull updates
npm run build                       # Rebuild
pm2 restart envn-backend           # Restart
```
