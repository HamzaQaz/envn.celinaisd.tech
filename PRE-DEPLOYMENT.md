# Pre-Deployment Checklist

Before deploying the Environmental Monitoring System, ensure you have completed all items in this checklist.

## ✅ Domain Setup

- [ ] **Register Domain Names**: Ensure you have access to celinaisd.tech domain
- [ ] **Configure DNS Records**:
  
  Create the following DNS A records pointing to your server IP:
  
  | Record Type | Name/Host | Value | TTL |
  |------------|-----------|-------|-----|
  | A | envn | Your Server IP | 3600 |
  | A | enapi | Your Server IP | 3600 |
  
  This will create:
  - `envn.celinaisd.tech` → Frontend
  - `enapi.celinaisd.tech` → API/Backend

- [ ] **Wait for DNS Propagation**: Use tools like `dig` or `nslookup` to verify:
  ```bash
  dig envn.celinaisd.tech
  dig enapi.celinaisd.tech
  ```

## ✅ Server Requirements

- [ ] **Server Specifications**:
  - Ubuntu 20.04+ (22.04 LTS recommended)
  - Minimum 2GB RAM (4GB recommended)
  - 20GB disk space
  - Root or sudo access

- [ ] **Network Access**:
  - [ ] Port 22 (SSH) accessible
  - [ ] Port 80 (HTTP) accessible
  - [ ] Port 443 (HTTPS) accessible
  - [ ] Outbound internet access for installing packages

## ✅ Database Planning

- [ ] **Database Credentials Prepared**:
  - [ ] Database name: `envnmoniter` (or your choice)
  - [ ] Database user: `envnuser` (or your choice)
  - [ ] Strong password generated (20+ characters)

- [ ] **Session Secret Generated**:
  ```bash
  # Generate a strong random secret
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Save this for your `.env` file

## ✅ Email Configuration (Optional)

If using email alerts:

- [ ] **SMTP Server Details**:
  - [ ] SMTP host
  - [ ] SMTP port
  - [ ] SMTP username
  - [ ] SMTP password
  - [ ] From email address

## ✅ Repository Access

- [ ] **GitHub Access**:
  - [ ] Can clone: `git clone https://github.com/HamzaQaz/envn.celinaisd.tech.git`
  - [ ] SSH key setup (if using SSH) or HTTPS access enabled

## ✅ Pre-Installation Commands

Run these on your server before starting deployment:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Check available disk space (should have at least 10GB free)
df -h

# Check memory (should have at least 2GB)
free -h

# Verify internet connectivity
ping -c 3 google.com
```

## ✅ Security Preparation

- [ ] **SSH Key Setup**: Using SSH keys instead of password authentication
- [ ] **Firewall Planning**: UFW will be configured during deployment
- [ ] **Backup Strategy**: Plan for database backups
- [ ] **Password Policy**: Change default password `temp` after deployment

## ✅ Monitoring and Logging

- [ ] **Log Storage**: Ensure adequate space for logs at `/var/log/envn/`
- [ ] **Monitoring Tools**: Consider installing `htop` for resource monitoring
  ```bash
  sudo apt install htop
  ```

---

## 📋 Deployment Overview

Once all checklist items are complete, follow this order:

1. **Initial Setup** → [QUICKSTART.md](./QUICKSTART.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Install Prerequisites** → Node.js, nginx, MySQL, PM2
3. **Clone Repository** → `/var/www/envn/`
4. **Database Setup** → Create database, user, import schema
5. **Configure Environment** → `.env` files for backend and frontend
6. **Build Application** → `npm run build`
7. **Setup Process Manager** → PM2 or systemd
8. **Configure Nginx** → Copy configs and enable sites
9. **Setup SSL** → Let's Encrypt certificates
10. **Configure Firewall** → UFW rules
11. **Verify Deployment** → Test all endpoints

---

## 🧪 Post-Deployment Testing

After deployment, verify everything works:

### Backend Health Check
```bash
curl https://enapi.celinaisd.tech/health
# Expected: OK

curl https://enapi.celinaisd.tech/api/check-auth
# Expected: {"authenticated": false} or similar
```

### Frontend Access
```bash
# Open in browser
https://envn.celinaisd.tech
# Expected: Login page loads
```

### WebSocket Connection
- Open browser console on frontend
- Look for: "Socket connected: [socket-id]"

### Process Status
```bash
pm2 status
# Expected: envn-backend status should be "online"

pm2 logs envn-backend --lines 20
# Check for any errors
```

### Nginx Status
```bash
sudo systemctl status nginx
# Expected: active (running)

sudo nginx -t
# Expected: syntax is ok, test is successful
```

### SSL Certificate
```bash
sudo certbot certificates
# Expected: Shows valid certificates for both domains
```

---

## 📝 Configuration Reference

### Backend Environment Variables (`.env`)
```env
DB_HOST=localhost
DB_USER=envnuser
DB_PASS=your_strong_password_here
DB_NAME=envnmoniter
PORT=3000
SESSION_SECRET=your_64_character_random_hex_here
CLIENT_URL=https://envn.celinaisd.tech
```

### Frontend Environment Variables (`client/.env`)
```env
VITE_API_URL=https://enapi.celinaisd.tech
```

---

## 🔒 Security Checklist

Post-deployment security tasks:

- [ ] **Change Default Password**: Update `temp` password in backend code
- [ ] **Review CORS Settings**: Verify CLIENT_URL in backend .env
- [ ] **Enable Firewall**: `sudo ufw enable`
- [ ] **Setup Fail2ban** (optional but recommended):
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  ```
- [ ] **Regular Updates**: Setup automatic security updates
  ```bash
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure --priority=low unattended-upgrades
  ```
- [ ] **Database Security**: Ensure MySQL root password is strong
- [ ] **SSL Auto-Renewal**: Verify certbot timer is active
  ```bash
  sudo systemctl status certbot.timer
  ```

---

## 🆘 Common Issues and Solutions

### DNS Not Resolving
- **Problem**: Domain names don't resolve to server IP
- **Solution**: Wait for DNS propagation (up to 48 hours, usually much faster)
- **Check**: Use `dig` or online DNS checkers

### Port Already in Use
- **Problem**: Port 3000 already in use
- **Solution**: Find and kill process: `sudo lsof -i :3000` then `kill -9 [PID]`

### Database Connection Failed
- **Problem**: Backend can't connect to MySQL
- **Solution**: 
  - Verify MySQL is running: `sudo systemctl status mysql`
  - Check credentials in `.env`
  - Test connection: `mysql -u envnuser -p envnmoniter`

### Permission Denied
- **Problem**: Can't write to `/var/www/envn` or `/var/log/envn`
- **Solution**: 
  ```bash
  sudo chown -R $USER:$USER /var/www/envn
  sudo chown -R $USER:$USER /var/log/envn
  ```

### SSL Certificate Failed
- **Problem**: Certbot can't obtain certificate
- **Solution**: 
  - Ensure domains point to correct IP
  - Check ports 80 and 443 are open
  - Verify nginx is running and configured

---

## 📞 Getting Help

If you encounter issues:

1. **Check Logs**:
   - Backend: `pm2 logs envn-backend`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - System: `journalctl -xe`

2. **Review Documentation**:
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
   - [QUICKSTART.md](./QUICKSTART.md) - Quick reference

3. **GitHub Issues**:
   - https://github.com/HamzaQaz/envn.celinaisd.tech/issues

---

## ✅ Deployment Complete!

Once all tests pass and the system is running:

- [ ] Document your configuration (server IP, database name, etc.)
- [ ] Setup database backup cron job
- [ ] Add monitoring alerts (optional)
- [ ] Update default password in the code
- [ ] Share access with team members

**Congratulations! Your Environmental Monitoring System is now live! 🎉**
