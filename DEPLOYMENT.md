# FreeBird Deployment Guide

Complete guide for deploying FreeBird to production on a Linux VM.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [MongoDB Setup](#mongodb-setup)
5. [Process Management with PM2](#process-management-with-pm2)
6. [Reverse Proxy with Nginx](#reverse-proxy-with-nginx)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Environment Variables](#environment-variables)
9. [Backup & Maintenance](#backup--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Development
- Node.js 18+ (recommend using nvm)
- MongoDB 6.0+
- Git

### Production Server
- Linux VM (Ubuntu 22.04 LTS recommended)
- Root or sudo access
- Domain name pointed to your server IP (optional, for HTTPS)
- At least 2GB RAM
- 20GB disk space

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd FreeBird
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/freebird
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Optional: for AI features
```

### 4. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Start on boot
```

**Windows:**
```bash
net start MongoDB
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Production Deployment

### Step 1: Prepare the Server

SSH into your Linux VM:

```bash
ssh user@your-server-ip
```

Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js

Install Node.js using nvm (recommended):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version
```

### Step 3: Install MongoDB

Add MongoDB repository:

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

Install MongoDB:

```bash
sudo apt update
sudo apt install -y mongodb-org
```

Start and enable MongoDB:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### Step 4: Clone and Setup Application

Create application directory:

```bash
sudo mkdir -p /var/www/freebird
sudo chown $USER:$USER /var/www/freebird
cd /var/www/freebird
```

Clone repository:

```bash
git clone <your-repo-url> .
```

Install dependencies:

```bash
npm install
```

Create production environment file:

```bash
nano .env.local
```

Add configuration:

```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/freebird
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Optional
```

### Step 5: Build Application

```bash
npm run build
```

Test production build:

```bash
npm start
```

Press Ctrl+C to stop once verified.

---

## Process Management with PM2

PM2 keeps your app running and restarts it on crashes.

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```bash
nano ecosystem.config.js
```

Add configuration:

```javascript
module.exports = {
  apps: [{
    name: 'freebird',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/freebird',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Start Application with PM2

```bash
pm2 start ecosystem.config.js
```

### Useful PM2 Commands

```bash
# View running apps
pm2 list

# View logs
pm2 logs freebird

# Monitor resources
pm2 monit

# Restart app
pm2 restart freebird

# Stop app
pm2 stop freebird

# Delete app from PM2
pm2 delete freebird

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

---

## Reverse Proxy with Nginx

Nginx acts as a reverse proxy and can handle SSL/HTTPS.

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

Create configuration file:

```bash
sudo nano /etc/nginx/sites-available/freebird
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Change to your domain

    # Increase max upload size for images
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded images directly
    location /uploads {
        alias /var/www/freebird/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/freebird /etc/nginx/sites-enabled/
```

Test configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

Use Let's Encrypt for free SSL certificates.

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically:
- Obtain SSL certificate
- Update Nginx configuration
- Set up auto-renewal

### Verify Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Certificates auto-renew via cron job.

---

## Environment Variables

### Required Variables

```env
MONGODB_URI=mongodb://localhost:27017/freebird
```

### Optional Variables

```env
# Enable AI features (Claude API)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Custom port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=production
```

### Updating Environment Variables

After changing `.env.local`:

```bash
npm run build  # Rebuild if needed
pm2 restart freebird
```

---

## MongoDB Setup

### Secure MongoDB

Create admin user:

```bash
mongosh
```

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password-here",
  roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
})
exit
```

Enable authentication in `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

Update connection string in `.env.local`:

```env
MONGODB_URI=mongodb://admin:strong-password-here@localhost:27017/freebird?authSource=admin
```

Restart app:

```bash
pm2 restart freebird
```

---

## Backup & Maintenance

### Database Backups

Create backup script (`~/backup-freebird.sh`):

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/freebird-backups
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db=freebird --out=$BACKUP_DIR/mongo_$TIMESTAMP

# Backup uploaded images
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /var/www/freebird/public/uploads

# Delete backups older than 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

Make executable:

```bash
chmod +x ~/backup-freebird.sh
```

Add to crontab (daily at 2 AM):

```bash
crontab -e
```

Add line:

```
0 2 * * * ~/backup-freebird.sh >> ~/backup.log 2>&1
```

### Restore from Backup

```bash
# Restore MongoDB
mongorestore --db=freebird ~/freebird-backups/mongo_TIMESTAMP/freebird

# Restore uploads
tar -xzf ~/freebird-backups/uploads_TIMESTAMP.tar.gz -C /
```

### Update Application

```bash
cd /var/www/freebird
git pull
npm install
npm run build
pm2 restart freebird
```

---

## Troubleshooting

### App Won't Start

Check logs:
```bash
pm2 logs freebird
```

Check if port is in use:
```bash
sudo lsof -i :3000
```

### MongoDB Connection Issues

Check MongoDB status:
```bash
sudo systemctl status mongod
```

View MongoDB logs:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

Test connection:
```bash
mongosh "mongodb://localhost:27017/freebird"
```

### Nginx Issues

Test configuration:
```bash
sudo nginx -t
```

View error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

Check if Nginx is running:
```bash
sudo systemctl status nginx
```

### Image Upload Failing

Check permissions:
```bash
ls -la /var/www/freebird/public/uploads
```

Fix permissions:
```bash
sudo chown -R $USER:$USER /var/www/freebird/public/uploads
chmod -R 755 /var/www/freebird/public/uploads
```

Check disk space:
```bash
df -h
```

### AI Features Not Working

Verify API key is set:
```bash
grep ANTHROPIC_API_KEY /var/www/freebird/.env.local
```

Check API key validity at https://console.anthropic.com

Restart app after adding key:
```bash
pm2 restart freebird
```

### High Memory Usage

Restart app:
```bash
pm2 restart freebird
```

Monitor memory:
```bash
pm2 monit
```

Check MongoDB memory:
```bash
mongosh --eval "db.serverStatus().mem"
```

---

## Performance Optimization

### Enable Nginx Caching

Add to Nginx config:

```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### MongoDB Indexes

Create indexes for better query performance:

```bash
mongosh freebird
```

```javascript
// Index on type for filtering
db.entries.createIndex({ type: 1 })

// Index on category for filtering
db.entries.createIndex({ category: 1 })

// Index on date for sorting
db.entries.createIndex({ date: -1 })

// Text index for search
db.entries.createIndex({
  title: "text",
  content: "text",
  category: "text"
})

exit
```

### Enable Gzip Compression

In Nginx config (`/etc/nginx/nginx.conf`):

```nginx
gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss application/json;
```

---

## Security Checklist

- [ ] MongoDB authentication enabled
- [ ] Strong passwords used
- [ ] SSL/HTTPS enabled (Let's Encrypt)
- [ ] Firewall configured (UFW)
  ```bash
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 22/tcp
  sudo ufw enable
  ```
- [ ] Regular backups scheduled
- [ ] OS security updates enabled
  ```bash
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure --priority=low unattended-upgrades
  ```
- [ ] `.env.local` has proper permissions
  ```bash
  chmod 600 /var/www/freebird/.env.local
  ```
- [ ] MongoDB not exposed to internet (port 27017 firewalled)
- [ ] Nginx security headers added

### Add Security Headers to Nginx

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## Quick Reference

### Common Commands

```bash
# Check app status
pm2 status

# View logs
pm2 logs freebird --lines 100

# Restart app
pm2 restart freebird

# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# Reload Nginx config
sudo nginx -t && sudo systemctl reload nginx

# Monitor system resources
htop

# Check disk space
df -h

# View app directory
cd /var/www/freebird
```

### Service URLs

- **Application**: http://your-domain.com (or https:// with SSL)
- **PM2 Monitor**: `pm2 monit`
- **Nginx Logs**: `/var/log/nginx/`
- **MongoDB Logs**: `/var/log/mongodb/mongod.log`

---

## Support

For issues or questions:
- Check logs: `pm2 logs freebird`
- Review this guide
- Check MongoDB connection
- Verify environment variables
- Test with `npm run dev` locally first

---

**Deployment Complete!** Your FreeBird instance should now be running in production.
