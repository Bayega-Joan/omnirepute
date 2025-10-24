# OmniRepute Setup Guide for omnirepute.samuelninsiima.com

## Prerequisites

- Ubuntu/Debian server with nginx installed
- Docker and Docker Compose installed
- Domain `omnirepute.samuelninsiima.com` pointing to your server IP
- Root or sudo access

## Step 1: Configure Nginx

```bash
# Copy the nginx configuration
sudo cp nginx-omnirepute-samuelninsiima.conf /etc/nginx/sites-available/omnirepute

# Enable the site
sudo ln -s /etc/nginx/sites-available/omnirepute /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 2: Deploy OmniRepute Application

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd omnirepute

# Setup production environment
./setup-prod.sh setup

# Update .env file with your domain
nano .env
# Add to ALLOWED_ORIGINS: https://omnirepute.samuelninsiima.com

# Deploy the application
./deploy.sh start

# Check status
./deploy.sh status
```

## Step 3: Setup SSL Certificate (Let's Encrypt)

```bash
# Install certbot (if not already installed)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d omnirepute.samuelninsiima.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 4: Verify Deployment

```bash
# Check if containers are running
docker compose ps

# Test backend health
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:8080

# Test through nginx proxy (HTTP first, then HTTPS after certbot)
curl http://omnirepute.samuelninsiima.com/health
curl https://omnirepute.samuelninsiima.com/health
```

## Step 5: Update Environment Variables

Make sure your `.env` file includes:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_PROJECT_ID=your-gcp-project-id
API_KEY=your-gemini-api-key
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://omnirepute.samuelninsiima.com,http://localhost:3000
```

## Troubleshooting

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/omnirepute_error.log
sudo tail -f /var/log/nginx/omnirepute_access.log
```

### Check Application Logs
```bash
./deploy.sh logs
./deploy.sh logs backend
./deploy.sh logs frontend
```

### Restart Services
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart application
./deploy.sh restart
```

### Test SSL Configuration
```bash
# Test SSL with external tool
curl -I https://omnirepute.samuelninsiima.com

# Check SSL certificate
openssl s_client -connect omnirepute.samuelninsiima.com:443 -servername omnirepute.samuelninsiima.com
```

## Security Considerations

1. **Firewall**: Ensure only ports 80 and 443 are open
2. **SSL**: Certificate auto-renewal is configured
3. **Headers**: Security headers are included
4. **CORS**: Only your domain is allowed
5. **Credentials**: GCP credentials are properly secured

## Monitoring

### Health Checks
- Application health: `https://omnirepute.samuelninsiima.com/health`
- Backend health: `https://omnirepute.samuelninsiima.com/api/health`

### Log Monitoring
```bash
# Monitor nginx logs
sudo tail -f /var/log/nginx/omnirepute_access.log

# Monitor application logs
./deploy.sh logs -f
```

## Backup Strategy

1. **Environment**: Backup `.env` file
2. **Credentials**: Backup `gcp-credentials.json`
3. **Configuration**: Backup nginx configs
4. **Data**: Backup BigQuery data
5. **Code**: Regular git commits

## Updates

To update the application:
```bash
git pull origin main
./deploy.sh update
```
