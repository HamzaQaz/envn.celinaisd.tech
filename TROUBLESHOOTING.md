# Troubleshooting Guide

This guide covers common issues and their solutions when deploying and running the Environmental Monitoring System.

---

## 🔍 Quick Diagnostics

Run these commands to check system status:

```bash
# Backend status
pm2 status

# Backend logs (last 50 lines)
pm2 logs envn-backend --lines 50

# Nginx status
sudo systemctl status nginx

# Nginx configuration test
sudo nginx -t

# Check ports in use
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000

# Database connection test
mysql -u envnuser -p envnmoniter -e "SELECT 1;"

# Check disk space
df -h

# Check memory usage
free -h

# DNS resolution
dig envn.celinaisd.tech
dig enapi.celinaisd.tech
```

---

## 🚨 Backend Issues

### Backend Won't Start

**Symptoms:**
- PM2 shows status as "errored" or constantly restarting
- Application logs show errors

**Solutions:**

1. **Check Environment Variables**
   ```bash
   cat /var/www/envn/.env
   # Verify all required variables are set
   ```

2. **Check Database Connection**
   ```bash
   mysql -u envnuser -p envnmoniter
   # If this fails, fix database credentials in .env
   ```

3. **Check Port Availability**
   ```bash
   sudo lsof -i :3000
   # If port is in use, kill the process or change PORT in .env
   ```

4. **Check Build Output**
   ```bash
   ls -la /var/www/envn/server/dist/
   # Should contain server.js and other files
   # If missing, run: npm run build:server
   ```

5. **Check Node Version**
   ```bash
   node --version
   # Should be v18.x or v20.x
   ```

6. **Check Detailed Logs**
   ```bash
   pm2 logs envn-backend --lines 100
   # Look for specific error messages
   ```

### Database Connection Errors

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solutions:**

1. **Verify Database Credentials**
   ```bash
   # Test with credentials from .env
   mysql -h localhost -u envnuser -p envnmoniter
   ```

2. **Check MySQL is Running**
   ```bash
   sudo systemctl status mysql
   sudo systemctl start mysql  # if not running
   ```

3. **Verify Database Exists**
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   # Should list 'envnmoniter'
   ```

4. **Check User Permissions**
   ```sql
   -- Login as root
   mysql -u root -p
   
   -- Check user permissions
   SELECT user, host FROM mysql.user WHERE user='envnuser';
   SHOW GRANTS FOR 'envnuser'@'localhost';
   
   -- If needed, recreate user
   DROP USER 'envnuser'@'localhost';
   CREATE USER 'envnuser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON envnmoniter.* TO 'envnuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Session/Cookie Issues

**Error:** `Error: secret option required for sessions`

**Solution:**
```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo "SESSION_SECRET=generated_secret_here" >> /var/www/envn/.env

# Restart backend
pm2 restart envn-backend
```

---

## 🌐 Nginx Issues

### 502 Bad Gateway

**Symptoms:**
- Browser shows "502 Bad Gateway"
- Nginx error log shows connection refused

**Solutions:**

1. **Check Backend is Running**
   ```bash
   pm2 status
   # If not running, start it
   pm2 start ecosystem.config.js
   ```

2. **Verify Port Configuration**
   ```bash
   # Check backend port
   grep PORT /var/www/envn/.env
   
   # Check nginx proxy_pass port
   grep proxy_pass /etc/nginx/sites-available/enapi.celinaisd.tech
   
   # They should match (usually 3000)
   ```

3. **Check Nginx Error Logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Test Backend Directly**
   ```bash
   curl http://localhost:3000/api/check-auth
   # If this works, nginx configuration issue
   # If this fails, backend issue
   ```

### 404 Not Found (Frontend)

**Symptoms:**
- Frontend loads but shows 404 on page refresh
- React Router not working

**Solution:**

Check nginx configuration has the `try_files` directive:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

```bash
# Verify config
sudo nano /etc/nginx/sites-available/envn.celinaisd.tech

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Static Files Not Loading

**Symptoms:**
- Page loads but styling/images missing
- Browser shows 404 for JS/CSS files

**Solutions:**

1. **Verify Build Output**
   ```bash
   ls -la /var/www/envn/client/dist/
   # Should contain index.html, assets/, etc.
   ```

2. **Check Nginx Root Path**
   ```bash
   grep "root" /etc/nginx/sites-available/envn.celinaisd.tech
   # Should be: root /var/www/envn/client/dist;
   ```

3. **Check File Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/envn/client/dist/
   sudo chmod -R 755 /var/www/envn/client/dist/
   ```

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Chrome/Firefox)
   - Or clear cache in browser settings

---

## 🔌 WebSocket Issues

### WebSocket Connection Failed

**Symptoms:**
- Browser console shows WebSocket errors
- Real-time updates not working
- Socket.io connection errors

**Solutions:**

1. **Check Nginx WebSocket Configuration**
   ```bash
   sudo grep -A 10 "location /socket.io" /etc/nginx/sites-available/enapi.celinaisd.tech
   ```
   
   Should have:
   ```nginx
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```

2. **Test WebSocket Endpoint**
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     https://enapi.celinaisd.tech/socket.io/
   ```

3. **Check CORS Settings**
   ```bash
   grep CLIENT_URL /var/www/envn/.env
   # Should match frontend domain: https://envn.celinaisd.tech
   ```

4. **Check Browser Console**
   - Open Developer Tools → Console
   - Look for specific error messages
   - Verify API URL is correct

---

## 🔒 SSL/Certificate Issues

### Certificate Not Found

**Error:** `SSL certificate problem` or certificate warnings

**Solutions:**

1. **Verify Certificates Exist**
   ```bash
   sudo certbot certificates
   ```

2. **Obtain Certificates**
   ```bash
   # For API domain
   sudo certbot --nginx -d enapi.celinaisd.tech
   
   # For frontend domain
   sudo certbot --nginx -d envn.celinaisd.tech
   ```

3. **Check Certificate Paths in Nginx**
   ```bash
   grep ssl_certificate /etc/nginx/sites-available/enapi.celinaisd.tech
   grep ssl_certificate /etc/nginx/sites-available/envn.celinaisd.tech
   ```

### Certificate Renewal Failed

**Solution:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal if needed
sudo certbot renew --force-renewal

# Check certbot timer
sudo systemctl status certbot.timer
```

---

## 🔥 Firewall Issues

### Can't Access Server

**Symptoms:**
- Can't reach server via browser
- Connection timeout

**Solutions:**

1. **Check Firewall Status**
   ```bash
   sudo ufw status
   ```

2. **Allow Required Ports**
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

3. **Check if Ports are Open**
   ```bash
   # From another machine
   telnet your-server-ip 80
   telnet your-server-ip 443
   ```

4. **Check Cloud Provider Firewall**
   - AWS: Security Groups
   - DigitalOcean: Networking → Firewalls
   - Azure: Network Security Groups
   - Ensure ports 80, 443, and 22 are allowed

---

## 📊 Performance Issues

### High Memory Usage

**Solution:**
```bash
# Check memory
free -h

# Check which process is using memory
htop

# Restart backend if needed
pm2 restart envn-backend

# Reduce max memory in PM2 config
# Edit ecosystem.config.js
max_memory_restart: '500M'
```

### High CPU Usage

**Solutions:**

1. **Check for Infinite Loops**
   ```bash
   pm2 logs envn-backend --lines 100
   # Look for repeated errors or endless loops
   ```

2. **Check Database Queries**
   - Review slow query log
   - Add indexes if needed

3. **Restart Backend**
   ```bash
   pm2 restart envn-backend
   ```

### Slow Page Load

**Solutions:**

1. **Enable Gzip** (should already be in nginx config)
   ```bash
   grep -A 5 "gzip on" /etc/nginx/sites-available/envn.celinaisd.tech
   ```

2. **Check Network Latency**
   ```bash
   ping envn.celinaisd.tech
   ```

3. **Check Browser Network Tab**
   - Open Developer Tools → Network
   - Look for slow requests
   - Check file sizes

---

## 📧 Email Alert Issues

### Emails Not Sending

**Solutions:**

1. **Check SMTP Configuration**
   - Verify SMTP settings in code
   - Check credentials

2. **Test SMTP Connection**
   ```bash
   telnet smtp.gmail.com 587
   # Should connect
   ```

3. **Check Logs for Email Errors**
   ```bash
   pm2 logs envn-backend | grep -i "email\|mail\|smtp"
   ```

---

## 🔄 Update/Deployment Issues

### Update Failed

**Error:** Deployment script fails or application breaks after update

**Solutions:**

1. **Revert to Previous Version**
   ```bash
   cd /var/www/envn
   git log --oneline  # Find previous commit
   git checkout [commit-hash]
   npm run build
   pm2 restart envn-backend
   ```

2. **Check for Breaking Changes**
   - Review commit messages
   - Check for database schema changes
   - Verify environment variable changes

3. **Clean Install**
   ```bash
   cd /var/www/envn
   rm -rf node_modules client/node_modules
   npm install
   cd client && npm install && cd ..
   npm run build
   pm2 restart envn-backend
   ```

### Database Migration Issues

**Solution:**
```bash
# Backup database first
mysqldump -u envnuser -p envnmoniter > backup_$(date +%Y%m%d).sql

# Apply new schema changes
mysql -u envnuser -p envnmoniter < data.sql

# Restart backend
pm2 restart envn-backend
```

---

## 🧹 Cleanup and Maintenance

### Disk Space Full

**Solutions:**

1. **Check Disk Usage**
   ```bash
   df -h
   du -sh /var/log/*
   du -sh /var/www/envn/*
   ```

2. **Clean Old Logs**
   ```bash
   # PM2 logs
   pm2 flush
   
   # Nginx logs
   sudo truncate -s 0 /var/log/nginx/*.log
   
   # Old log files
   sudo find /var/log -type f -name "*.log.*" -delete
   ```

3. **Clean npm Cache**
   ```bash
   npm cache clean --force
   ```

4. **Remove Old Packages**
   ```bash
   sudo apt autoremove
   sudo apt autoclean
   ```

---

## 📞 Getting More Help

If issues persist:

1. **Collect Information**
   ```bash
   # System info
   uname -a
   lsb_release -a
   
   # Node version
   node --version
   npm --version
   
   # Backend status and logs
   pm2 status
   pm2 logs envn-backend --lines 50 > backend-logs.txt
   
   # Nginx status and logs
   sudo nginx -t
   sudo tail -100 /var/log/nginx/error.log > nginx-errors.txt
   ```

2. **Create GitHub Issue**
   - Include collected information
   - Describe the issue and steps to reproduce
   - https://github.com/HamzaQaz/envn.celinaisd.tech/issues

3. **Check Documentation**
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [QUICKSTART.md](./QUICKSTART.md)
   - [PRE-DEPLOYMENT.md](./PRE-DEPLOYMENT.md)

---

## 📝 Useful Commands Reference

```bash
# Backend Management
pm2 status                      # Check status
pm2 restart envn-backend       # Restart
pm2 stop envn-backend          # Stop
pm2 logs envn-backend          # View logs
pm2 monit                      # Monitor resources

# Nginx Management
sudo systemctl status nginx    # Check status
sudo systemctl restart nginx   # Restart
sudo systemctl reload nginx    # Reload config
sudo nginx -t                  # Test config

# Database Management
mysql -u envnuser -p envnmoniter                    # Connect
mysqldump -u envnuser -p envnmoniter > backup.sql  # Backup
mysql -u envnuser -p envnmoniter < backup.sql      # Restore

# System Monitoring
htop                           # Interactive process viewer
df -h                          # Disk usage
free -h                        # Memory usage
journalctl -xe                 # System logs
```
