# 📚 Documentation Index

Welcome to the Environmental Monitoring System deployment documentation. This index helps you navigate all available guides.

---

## 🎯 Quick Navigation

### For First-Time Deployment

1. **Start Here** → [PRE-DEPLOYMENT.md](./PRE-DEPLOYMENT.md)
   - Checklist of requirements
   - DNS setup verification
   - Server requirements
   - Database planning

2. **DNS Configuration** → [DNS-SETUP.md](./DNS-SETUP.md)
   - Configure DNS records
   - Instructions for all major DNS providers
   - Verification steps

3. **Quick Deployment** → [QUICKSTART.md](./QUICKSTART.md)
   - Fast 10-step deployment guide
   - Essential commands only
   - Perfect for experienced users

4. **Detailed Deployment** → [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Comprehensive step-by-step guide
   - Detailed explanations
   - Best practices and security
   - Perfect for first-time deployers

5. **Troubleshooting** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Common issues and solutions
   - Debugging commands
   - Performance optimization

### For Updates and Maintenance

- **Application Updates** → [DEPLOYMENT.md#updating-the-application](./DEPLOYMENT.md#updating-the-application)
- **Troubleshooting** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Backup Strategy** → [DEPLOYMENT.md#backup-strategy](./DEPLOYMENT.md#backup-strategy)

### For Development

- **Application Overview** → [README.md](./README.md)
- **Development Setup** → [README.md#development](./README.md#development)
- **API Documentation** → [README.md#api-endpoints](./README.md#api-endpoints)

---

## 📖 Documentation Overview

### PRE-DEPLOYMENT.md
**Purpose**: Prepare for deployment

**Contents**:
- ✅ Pre-deployment checklist
- Domain and DNS requirements
- Server specifications
- Database planning
- Security preparation
- Post-deployment testing

**When to use**: Before starting deployment

---

### DNS-SETUP.md
**Purpose**: Configure domain names

**Contents**:
- DNS record configuration
- Provider-specific instructions (Cloudflare, Namecheap, GoDaddy, AWS, etc.)
- DNS verification methods
- Troubleshooting DNS issues
- Propagation time expectations

**When to use**: Before or during deployment, when setting up domains

---

### QUICKSTART.md
**Purpose**: Fast deployment reference

**Contents**:
- 10-step quick deployment
- Essential commands only
- Minimal explanations
- Quick update instructions
- Common issues reference

**When to use**: 
- Experienced users who know the basics
- Quick reference during deployment
- For updates and maintenance

---

### DEPLOYMENT.md
**Purpose**: Comprehensive deployment guide

**Contents**:
- Detailed step-by-step instructions
- Complete explanations for each step
- Security best practices
- Monitoring and logging setup
- Backup strategy
- Update procedures
- Architecture overview

**When to use**:
- First-time deployment
- Need detailed explanations
- Want to understand each step
- Setting up production environment

---

### TROUBLESHOOTING.md
**Purpose**: Solve problems and debug issues

**Contents**:
- Quick diagnostics commands
- Backend issues (won't start, database errors, sessions)
- Nginx issues (502 errors, routing problems, static files)
- WebSocket connection problems
- SSL/certificate issues
- Firewall configuration
- Performance optimization
- Update/deployment issues
- Useful commands reference

**When to use**:
- Something isn't working
- Need to debug an issue
- Performance problems
- After updates

---

### README.md
**Purpose**: Application overview and development

**Contents**:
- Project overview
- Technology stack
- Features list
- Development setup
- API documentation
- WebSocket events
- Contributing guidelines

**When to use**:
- Understanding the application
- Setting up development environment
- API reference
- Contributing to the project

---

## 🗂️ Configuration Files

### Nginx Configurations

- **`nginx/enapi.celinaisd.tech`**
  - API server configuration
  - WebSocket support
  - CORS headers
  - SSL/TLS settings
  - Reverse proxy to backend (port 3000)

- **`nginx/envn.celinaisd.tech`**
  - Frontend static file serving
  - React Router SPA support
  - Caching strategies
  - Gzip compression
  - Security headers

### Process Management

- **`ecosystem.config.js`**
  - PM2 configuration
  - Process settings
  - Auto-restart configuration
  - Log file locations
  - Memory limits

- **`systemd/envn-backend.service`**
  - Systemd service file (alternative to PM2)
  - Service dependencies
  - Restart policies
  - Security hardening

### Deployment

- **`deploy.sh`**
  - Automated deployment script
  - Interactive prompts
  - Multiple deployment modes
  - Error checking

### Environment

- **`.env.example`** (root)
  - Backend environment variables
  - Database configuration
  - Server settings
  - CORS configuration

- **`client/.env.example`**
  - Frontend environment variables
  - API URL configuration

---

## 🔄 Deployment Flow

```
1. Pre-Deployment Checklist (PRE-DEPLOYMENT.md)
   ↓
2. DNS Configuration (DNS-SETUP.md)
   ↓
3. Server Preparation
   ↓
4. Choose your path:
   ├─→ Quick Deployment (QUICKSTART.md)
   └─→ Detailed Deployment (DEPLOYMENT.md)
   ↓
5. Verify Deployment
   ↓
6. If Issues → (TROUBLESHOOTING.md)
```

---

## 📋 Common Tasks Quick Reference

### Initial Deployment
```
PRE-DEPLOYMENT.md → DNS-SETUP.md → DEPLOYMENT.md → Verify
```

### Quick Deployment (Experienced Users)
```
PRE-DEPLOYMENT.md (checklist) → QUICKSTART.md
```

### Updating Application
```
DEPLOYMENT.md#updating → TROUBLESHOOTING.md (if needed)
```

### Fixing Issues
```
TROUBLESHOOTING.md → Search for specific issue
```

### DNS Problems
```
DNS-SETUP.md#verifying → DNS-SETUP.md#common-dns-issues
```

### Certificate Issues
```
TROUBLESHOOTING.md#ssl-certificate-issues
```

---

## 🎓 Skill Level Guide

### Beginner
**Recommended Path**:
1. Read [README.md](./README.md) to understand the application
2. Complete [PRE-DEPLOYMENT.md](./PRE-DEPLOYMENT.md) checklist
3. Follow [DNS-SETUP.md](./DNS-SETUP.md) step by step
4. Use [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guidance
5. Keep [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) open for reference

### Intermediate
**Recommended Path**:
1. Skim [PRE-DEPLOYMENT.md](./PRE-DEPLOYMENT.md) checklist
2. Configure DNS using [DNS-SETUP.md](./DNS-SETUP.md)
3. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) with focus on your environment
4. Reference [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) as needed

### Advanced
**Recommended Path**:
1. Quick review of [PRE-DEPLOYMENT.md](./PRE-DEPLOYMENT.md)
2. Use [QUICKSTART.md](./QUICKSTART.md) for deployment
3. Customize configurations as needed
4. Reference [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for specific issues

---

## 🔍 Finding Information

### By Topic

- **DNS**: [DNS-SETUP.md](./DNS-SETUP.md)
- **Nginx**: [DEPLOYMENT.md#step-7-configure-nginx](./DEPLOYMENT.md#step-7-configure-nginx)
- **SSL/HTTPS**: [DEPLOYMENT.md#step-8-ssltls-certificates-with-lets-encrypt](./DEPLOYMENT.md#step-8-ssltls-certificates-with-lets-encrypt)
- **Database**: [DEPLOYMENT.md#step-2-mysql-database-setup](./DEPLOYMENT.md#step-2-mysql-database-setup)
- **PM2**: [DEPLOYMENT.md#step-6-configure-pm2-process-manager](./DEPLOYMENT.md#step-6-configure-pm2-process-manager)
- **WebSocket**: [TROUBLESHOOTING.md#websocket-issues](./TROUBLESHOOTING.md#websocket-issues)
- **Security**: [DEPLOYMENT.md#security-best-practices](./DEPLOYMENT.md#security-best-practices)
- **Updates**: [DEPLOYMENT.md#updating-the-application](./DEPLOYMENT.md#updating-the-application)
- **Backup**: [DEPLOYMENT.md#backup-strategy](./DEPLOYMENT.md#backup-strategy)

### By Problem

- **Can't access server**: [TROUBLESHOOTING.md#firewall-issues](./TROUBLESHOOTING.md#firewall-issues)
- **502 Error**: [TROUBLESHOOTING.md#502-bad-gateway](./TROUBLESHOOTING.md#502-bad-gateway)
- **Backend won't start**: [TROUBLESHOOTING.md#backend-wont-start](./TROUBLESHOOTING.md#backend-wont-start)
- **Database connection failed**: [TROUBLESHOOTING.md#database-connection-errors](./TROUBLESHOOTING.md#database-connection-errors)
- **WebSocket not connecting**: [TROUBLESHOOTING.md#websocket-connection-failed](./TROUBLESHOOTING.md#websocket-connection-failed)
- **SSL certificate issues**: [TROUBLESHOOTING.md#ssl-certificate-issues](./TROUBLESHOOTING.md#ssl-certificate-issues)
- **DNS not working**: [DNS-SETUP.md#common-dns-issues](./DNS-SETUP.md#common-dns-issues)

---

## 📊 Document Statistics

| Document | Purpose | Pages | Skill Level | Time to Read |
|----------|---------|-------|-------------|--------------|
| PRE-DEPLOYMENT.md | Checklist | ~5 | All | 10 min |
| DNS-SETUP.md | DNS Config | ~6 | All | 15 min |
| QUICKSTART.md | Fast Deploy | ~3 | Intermediate+ | 5 min |
| DEPLOYMENT.md | Full Guide | ~15 | All | 30 min |
| TROUBLESHOOTING.md | Debug | ~8 | All | As needed |
| README.md | App Info | ~6 | All | 15 min |

---

## 🆘 Still Need Help?

1. **Search the docs**: Use Ctrl+F to search within documents
2. **Check TROUBLESHOOTING.md**: Most issues are covered there
3. **Review your steps**: Did you follow the pre-deployment checklist?
4. **Check logs**: See [TROUBLESHOOTING.md#quick-diagnostics](./TROUBLESHOOTING.md#quick-diagnostics)
5. **GitHub Issues**: https://github.com/HamzaQaz/envn.celinaisd.tech/issues

---

## 📝 Documentation Feedback

Found an issue or want to suggest improvements?
- Open an issue: https://github.com/HamzaQaz/envn.celinaisd.tech/issues
- Submit a PR with improvements

---

## ✅ Quick Links

- [Start Deployment](./PRE-DEPLOYMENT.md)
- [Configure DNS](./DNS-SETUP.md)
- [Quick Deploy](./QUICKSTART.md)
- [Full Deploy Guide](./DEPLOYMENT.md)
- [Fix Issues](./TROUBLESHOOTING.md)
- [App Overview](./README.md)
- [GitHub Repository](https://github.com/HamzaQaz/envn.celinaisd.tech)

---

**Last Updated**: October 2025
**Version**: 1.0.0

**Happy Deploying! 🚀**
