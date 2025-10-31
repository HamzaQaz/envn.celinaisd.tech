# Production Deployment Guide

This guide covers deploying the React + Express environmental monitoring application to a production server with nginx.

## Prerequisites

- Ubuntu/Debian server (20.04 LTS or newer recommended)
- Node.js 18+ and npm
- MySQL 8.0+
- Nginx 1.18+
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

## 1. Server Setup

### Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2
```

## 2. Database Setup

### Create Database and User

```bash
sudo mysql
```

```sql
-- Create database
CREATE DATABASE envn_production;

-- Create user (replace with strong password)
CREATE USER 'envn_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON envn_production.* TO 'envn_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Import Database Schema

```bash
mysql -u envn_user -p envn_production < data.sql
```

## 3. Application Deployment

### Clone and Setup Repository

```bash
# Create application directory
sudo mkdir -p /var/www/envn.celinaisd.tech
sudo chown -R $USER:$USER /var/www/envn.celinaisd.tech
cd /var/www/envn.celinaisd.tech

# Clone repository
git clone https://github.com/HamzaQaz/envn.celinaisd.tech.git .

# Install dependencies
npm install
cd client && npm install && cd ..
```

### Configure Environment Variables

Create `.env` file in the root directory:

```bash
nano .env
```

```env
# Database Configuration
DB_HOST=localhost
DB_USER=envn_user
DB_PASS=your_strong_password_here
DB_NAME=envn_production

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Secret (generate a strong random string)
SESSION_SECRET=generate_a_very_strong_random_secret_here_at_least_32_chars

# Client URL (your production domain)
CLIENT_URL=https://envn.celinaisd.tech

# Email Configuration (if using notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@envn.celinaisd.tech
```

Create `.env` file in the client directory:

```bash
nano client/.env
```

```env
# Production API URL (same domain, nginx will proxy)
VITE_API_URL=https://envn.celinaisd.tech
```

### Build the Application

```bash
# Build the backend
npm run build:server

# Build the frontend
npm run build:client
```

## 4. Nginx Configuration

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/envn.celinaisd.tech
```

Copy the contents from `nginx.conf.example` in the repository, adjusting paths as needed.

### Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/envn.celinaisd.tech /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 5. SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d envn.celinaisd.tech -d www.envn.celinaisd.tech
```

Follow the prompts. Certbot will automatically configure nginx for HTTPS.

### Auto-Renewal

Certbot sets up auto-renewal automatically. Test it:

```bash
sudo certbot renew --dry-run
```

## 6. PM2 Process Management

### Start the Application

```bash
cd /var/www/envn.celinaisd.tech

# Start the server with PM2
pm2 start server/dist/server.js --name "envn-server"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command
```

### PM2 Management Commands

```bash
# View logs
pm2 logs envn-server

# Restart application
pm2 restart envn-server

# Stop application
pm2 stop envn-server

# Monitor status
pm2 status

# Monitor in real-time
pm2 monit
```

## 7. Firewall Configuration

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 8. Verification

### Test the Deployment

1. **Access the website**: Navigate to `https://envn.celinaisd.tech`
2. **Test navigation**: Click through different pages (Dashboard, History, Admin)
3. **Test authentication**: Login with your password
4. **Test real-time updates**: Ensure WebSocket connections work
5. **Test API**: Submit data from an IoT device

### Check Logs

```bash
# Application logs
pm2 logs envn-server

# Nginx access logs
sudo tail -f /var/log/nginx/envn.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/envn.error.log

# System logs
sudo journalctl -u nginx -f
```

## 9. Maintenance

### Updating the Application

```bash
cd /var/www/envn.celinaisd.tech

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install
cd client && npm install && cd ..

# Rebuild
npm run build:server
npm run build:client

# Restart the application
pm2 restart envn-server

# Reload nginx if configuration changed
sudo nginx -t && sudo systemctl reload nginx
```

### Database Backups

Create a backup script:

```bash
nano /home/$USER/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u envn_user -p'your_password' envn_production > $BACKUP_DIR/envn_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "envn_backup_*.sql" -mtime +7 -delete
```

Make it executable and add to cron:

```bash
chmod +x /home/$USER/backup-db.sh

# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/$USER/backup-db.sh
```

### Monitoring

Consider setting up monitoring with:
- **PM2 Plus** (Application Performance Monitoring)
- **Uptime Robot** (Uptime monitoring)
- **Datadog** or **New Relic** (Full stack monitoring)

## 10. Security Best Practices

1. **Keep software updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Change default password**: Update the hardcoded password in `server/src/server.ts`

3. **Use strong session secret**: Generate a strong random string for `SESSION_SECRET`

4. **Enable fail2ban** for SSH protection:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

5. **Regular backups**: Ensure database and code backups are automated

6. **Monitor logs**: Regularly check for suspicious activity

7. **Rate limiting**: Enable nginx rate limiting for API endpoints (see `nginx.conf.example`)

## 11. Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs envn-server

# Check if port 3000 is in use
sudo lsof -i :3000

# Verify environment variables
pm2 env 0
```

### Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Verify permissions
ls -la /var/www/envn.celinaisd.tech/client/dist
```

### WebSocket connection issues
```bash
# Check if Socket.io is running
curl http://localhost:3000/socket.io/

# Verify nginx WebSocket configuration
sudo nginx -T | grep -A 10 "location /socket.io"
```

### Database connection issues
```bash
# Test MySQL connection
mysql -u envn_user -p envn_production

# Check MySQL is running
sudo systemctl status mysql
```

## 12. Performance Optimization

### Enable Nginx Caching

Add to nginx configuration:

```nginx
# Define cache path
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# In /api location
location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    # ... other proxy settings
}
```

### PM2 Cluster Mode

For better performance on multi-core servers:

```bash
pm2 start server/dist/server.js --name "envn-server" -i max
pm2 save
```

### Database Optimization

```sql
-- Add indexes for frequently queried columns
ALTER TABLE sensordata ADD INDEX idx_timestamp (timestamp);
ALTER TABLE devices ADD INDEX idx_name (Name);
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/HamzaQaz/envn.celinaisd.tech/issues
- Documentation: https://github.com/HamzaQaz/envn.celinaisd.tech/blob/main/README.md
