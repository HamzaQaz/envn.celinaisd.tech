# DNS Configuration Guide

This guide explains how to configure DNS records for the Environmental Monitoring System to work with separate frontend and API domains.

---

## 📋 Overview

The application uses two separate domains:
- **Frontend**: `envn.celinaisd.tech` - Serves the React application
- **API/Backend**: `enapi.celinaisd.tech` - Serves the API and WebSocket connections

Both domains point to the same server, but nginx routes them differently.

---

## 🌐 Required DNS Records

### Basic Setup

You need to create **2 A records** in your DNS provider's control panel:

| Record Type | Name/Host | Points To | TTL | Description |
|------------|-----------|-----------|-----|-------------|
| A | `envn` | `YOUR_SERVER_IP` | 3600 | Frontend domain |
| A | `enapi` | `YOUR_SERVER_IP` | 3600 | API domain |

### Example with Server IP: 203.0.113.45

| Record Type | Name/Host | Value | TTL |
|------------|-----------|-------|-----|
| A | `envn` | `203.0.113.45` | 3600 |
| A | `enapi` | `203.0.113.45` | 3600 |

This creates:
- `envn.celinaisd.tech` → `203.0.113.45`
- `enapi.celinaisd.tech` → `203.0.113.45`

---

## 🔧 Configuration by DNS Provider

### Common DNS Providers

#### Cloudflare

1. Login to Cloudflare dashboard
2. Select your domain `celinaisd.tech`
3. Go to **DNS** section
4. Click **Add record**
5. Add two records:
   ```
   Type: A
   Name: envn
   IPv4 address: YOUR_SERVER_IP
   Proxy status: DNS only (gray cloud) initially
   TTL: Auto
   
   Type: A
   Name: enapi
   IPv4 address: YOUR_SERVER_IP
   Proxy status: DNS only (gray cloud) initially
   TTL: Auto
   ```
6. Click **Save**

**Note**: You can enable Cloudflare proxy (orange cloud) after SSL is configured.

#### Namecheap

1. Login to Namecheap account
2. Go to **Domain List** → Select `celinaisd.tech`
3. Click **Manage** → **Advanced DNS**
4. Click **Add New Record**
5. Add two records:
   ```
   Type: A Record
   Host: envn
   Value: YOUR_SERVER_IP
   TTL: Automatic
   
   Type: A Record
   Host: enapi
   Value: YOUR_SERVER_IP
   TTL: Automatic
   ```
6. Click the green checkmark to save

#### GoDaddy

1. Login to GoDaddy
2. Go to **My Products** → **Domain**
3. Click **DNS** next to your domain
4. Click **Add** under Records section
5. Add two records:
   ```
   Type: A
   Name: envn
   Value: YOUR_SERVER_IP
   TTL: 1 Hour (3600 seconds)
   
   Type: A
   Name: enapi
   Value: YOUR_SERVER_IP
   TTL: 1 Hour (3600 seconds)
   ```
6. Click **Save**

#### Google Domains (now Squarespace)

1. Login to your account
2. Navigate to your domain
3. Go to **DNS** settings
4. Under **Custom resource records**, add:
   ```
   Name: envn
   Type: A
   TTL: 3600
   Data: YOUR_SERVER_IP
   
   Name: enapi
   Type: A
   TTL: 3600
   Data: YOUR_SERVER_IP
   ```
5. Click **Add**

#### AWS Route 53

1. Login to AWS Console
2. Go to **Route 53** → **Hosted zones**
3. Select your hosted zone `celinaisd.tech`
4. Click **Create record**
5. Create two records:
   ```
   Record name: envn
   Record type: A
   Value: YOUR_SERVER_IP
   TTL: 300
   Routing policy: Simple
   
   Record name: enapi
   Record type: A
   Value: YOUR_SERVER_IP
   TTL: 300
   Routing policy: Simple
   ```
6. Click **Create records**

---

## ✅ Verifying DNS Configuration

### Check DNS Propagation

After adding DNS records, verify they are working:

#### Using `dig` (Linux/Mac)

```bash
# Check frontend domain
dig envn.celinaisd.tech +short
# Should return: YOUR_SERVER_IP

# Check API domain
dig enapi.celinaisd.tech +short
# Should return: YOUR_SERVER_IP
```

#### Using `nslookup` (Windows/Linux/Mac)

```bash
# Check frontend domain
nslookup envn.celinaisd.tech
# Should show your server IP in the Address field

# Check API domain
nslookup enapi.celinaisd.tech
# Should show your server IP in the Address field
```

#### Using `host` (Linux/Mac)

```bash
host envn.celinaisd.tech
# Should show: envn.celinaisd.tech has address YOUR_SERVER_IP

host enapi.celinaisd.tech
# Should show: enapi.celinaisd.tech has address YOUR_SERVER_IP
```

#### Online Tools

Use these websites to check DNS propagation globally:
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.dnswatch.info/

Enter your domains:
- `envn.celinaisd.tech`
- `enapi.celinaisd.tech`

---

## ⏱️ DNS Propagation Time

- **Typical time**: 15 minutes to 2 hours
- **Maximum time**: Up to 48 hours (rare)
- **Factors affecting speed**:
  - DNS provider
  - TTL settings (lower TTL = faster updates)
  - ISP DNS cache
  - Geographic location

### Speeding Up Testing

If DNS isn't propagated yet:

1. **Flush Local DNS Cache**:
   ```bash
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   ```

2. **Use Alternative DNS Servers**:
   - Test with Google DNS: `dig @8.8.8.8 envn.celinaisd.tech`
   - Test with Cloudflare DNS: `dig @1.1.1.1 envn.celinaisd.tech`

3. **Use `/etc/hosts` for Testing** (temporary):
   ```bash
   sudo nano /etc/hosts
   ```
   Add:
   ```
   YOUR_SERVER_IP  envn.celinaisd.tech
   YOUR_SERVER_IP  enapi.celinaisd.tech
   ```
   ⚠️ **Remember to remove these after DNS propagates!**

---

## 🔒 HTTPS/SSL Considerations

### Before SSL Certificates

Initially, your domains will only work with HTTP:
- `http://envn.celinaisd.tech`
- `http://enapi.celinaisd.tech`

### After SSL Certificates (Let's Encrypt)

Once you run `certbot`, domains will work with HTTPS:
- `https://envn.celinaisd.tech` ✅
- `https://enapi.celinaisd.tech` ✅

HTTP will automatically redirect to HTTPS (configured in nginx).

### Requirements for Let's Encrypt

Before running `certbot`:
1. ✅ DNS records must be propagated
2. ✅ Domains must point to your server
3. ✅ Nginx must be running
4. ✅ Ports 80 and 443 must be open

---

## 🚀 Advanced DNS Configurations

### Optional: WWW Subdomain

If you want `www.envn.celinaisd.tech` to also work:

Add a CNAME record:
```
Type: CNAME
Name: www.envn
Target: envn.celinaisd.tech
TTL: 3600
```

The nginx configuration already handles the www redirect.

### Optional: Wildcard Subdomain

To allow any subdomain (*.celinaisd.tech):

```
Type: A
Name: *
Value: YOUR_SERVER_IP
TTL: 3600
```

⚠️ **Not recommended** for production unless you have specific needs.

### Using Cloudflare Proxy

If using Cloudflare, you can enable the proxy (orange cloud) for:
- ✅ `envn.celinaisd.tech` (frontend) - Recommended
- ⚠️ `enapi.celinaisd.tech` (API) - Be careful with WebSockets

**For API domain with WebSocket**, ensure Cloudflare settings:
1. **SSL/TLS Mode**: Full (strict)
2. **WebSockets**: Enabled (on by default)
3. **Always Use HTTPS**: Enabled

### Using a CDN

If you want to use a CDN for the frontend:

1. Keep API direct: `enapi.celinaisd.tech` → Server IP
2. Add CDN for frontend: `envn.celinaisd.tech` → CDN → Server IP

Most CDNs (Cloudflare, CloudFront) work with A records or CNAME.

---

## 🔍 Common DNS Issues

### Issue: Domain Not Resolving

**Solutions:**
1. Check DNS records are correct
2. Wait for propagation (up to 48 hours)
3. Flush DNS cache
4. Test with different DNS servers

### Issue: Wrong IP Showing

**Solutions:**
1. Verify A record points to correct IP
2. Clear old DNS cache
3. Check for conflicting records
4. Verify no typos in domain name

### Issue: Works on Some Networks, Not Others

**Cause:** DNS propagation not complete everywhere

**Solution:** Wait for full global propagation

### Issue: SSL Certificate Can't Be Obtained

**Cause:** DNS not pointing to server yet

**Solution:**
1. Verify DNS with `dig` or `nslookup`
2. Ensure ports 80/443 are open
3. Wait for full DNS propagation
4. Try obtaining cert again

---

## 📊 DNS Record Summary

After setup, your DNS should look like this:

```
celinaisd.tech.         3600    IN  SOA   (existing SOA record)
celinaisd.tech.         3600    IN  NS    (existing NS records)
celinaisd.tech.         3600    IN  A     (your main domain, if configured)
envn.celinaisd.tech.    3600    IN  A     YOUR_SERVER_IP
enapi.celinaisd.tech.   3600    IN  A     YOUR_SERVER_IP
```

You can verify all records:
```bash
dig celinaisd.tech ANY
```

---

## 🎯 Quick Reference

### Get Your Server IP

```bash
# On your server
curl ifconfig.me

# Or
hostname -I | awk '{print $1}'
```

### Test DNS Records

```bash
# Quick test both domains
for domain in envn.celinaisd.tech enapi.celinaisd.tech; do
  echo "Testing $domain:"
  dig +short $domain
  echo
done
```

### Expected Output After DNS Setup

```bash
$ dig +short envn.celinaisd.tech
YOUR_SERVER_IP

$ dig +short enapi.celinaisd.tech
YOUR_SERVER_IP
```

---

## ✅ Next Steps

Once DNS is configured and verified:

1. ✅ DNS records pointing to server
2. → Continue with [DEPLOYMENT.md](./DEPLOYMENT.md)
3. → Setup nginx configurations
4. → Obtain SSL certificates
5. → Deploy application

---

## 📞 Need Help?

- **DNS Issues**: Contact your DNS provider support
- **Application Issues**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **General Help**: Open an issue on GitHub
